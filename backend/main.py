from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
import papermill as pm
import json
import threading
import time
import traceback
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = "uploads"
app.config['OUTPUT_FOLDER'] = "outputs"
app.config['STATIC_FOLDER'] = "static"
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)
os.makedirs(app.config['STATIC_FOLDER'], exist_ok=True)


jobs = {}
jobs_lock = threading.Lock()

def update_job_status(job_id, status=None, progress=None, error=None, **kwargs):
    """Thread-safe job status update"""
    with jobs_lock:
        if job_id in jobs:
            if status is not None:
                jobs[job_id]["status"] = status
            if progress is not None:
                jobs[job_id]["progress"] = min(max(progress, 0), 100)
            if error is not None:
                jobs[job_id]["error"] = error
            for key, value in kwargs.items():
                jobs[job_id][key] = value

def process_file_async(job_id, filepath, filename):
    """Process file asynchronously using papermill"""
    try:
        print(f"Starting processing for job {job_id}")
        
    
        update_job_status(job_id, status="processing", progress=10)
        
    
        output_notebook = os.path.abspath(os.path.join(app.config['OUTPUT_FOLDER'], f"{job_id}_output.ipynb"))
        output_image = os.path.abspath(os.path.join(app.config['STATIC_FOLDER'], f'{job_id}_histogram.png'))
        summary_file = os.path.abspath(os.path.join(app.config['OUTPUT_FOLDER'], f'{job_id}_summary.json'))
        
        print(f"Output paths:")
        print(f"  - Notebook: {output_notebook}")
        print(f"  - Image: {output_image}")
        print(f"  - Summary: {summary_file}")
    
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Input file not found: {filepath}")
  
        notebook_path = 'notebooks/preprocessing.ipynb'
        if not os.path.exists(notebook_path):
            raise FileNotFoundError(f"Notebook not found: {notebook_path}")

        update_job_status(job_id, progress=30)
        
        print(f"Executing notebook for job {job_id}")
        print(f"Input file size: {os.path.getsize(filepath)} bytes")

        pm.execute_notebook(
            notebook_path,
            output_notebook,
            parameters={
                "input_file": os.path.abspath(filepath),
                "output_image": output_image,
                "summary_file": summary_file,
                "job_id": job_id
            }
        )
        
        print(f"Notebook executed for job {job_id}")
        

        update_job_status(job_id, progress=80)
        
    
        print(f"Checking output files:")
        print(f"  - Summary file exists: {os.path.exists(summary_file)}")
        print(f"  - Image file exists: {os.path.exists(output_image)}")
        print(f"  - Output notebook exists: {os.path.exists(output_notebook)}")
        
        print(f"Files in {app.config['OUTPUT_FOLDER']}:")
        for f in os.listdir(app.config['OUTPUT_FOLDER']):
            print(f"  - {f}")
            
        print(f"Files in {app.config['STATIC_FOLDER']}:")
        for f in os.listdir(app.config['STATIC_FOLDER']):
            print(f"  - {f}")
        
        if os.path.exists(summary_file):
            print(f"Job {job_id} completed successfully")
            update_job_status(
                job_id,
                status="completed",
                progress=100,
                summary_file=summary_file,
                image_file=output_image,
                filename=filename
            )
        else:
            raise FileNotFoundError("Summary file was not created by the notebook")
            
    except Exception as e:
        error_msg = str(e)
        print(f"Error processing job {job_id}: {error_msg}")
        print(f"Traceback: {traceback.format_exc()}")
        
        update_job_status(
            job_id,
            status="failed",
            progress=0,
            error=error_msg
        )

@app.route('/run-analysis', methods=['POST'])
def run_analysis():
    """Handle file upload and start analysis"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        allowed_extensions = {'csv', 'xlsx', 'xls', 'json'}
        if not ('.' in file.filename and 
                file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
            return jsonify({"error": "Invalid file type. Allowed: CSV, Excel, JSON"}), 400

        job_id = str(uuid.uuid4())
        
        original_filename = file.filename
        secure_name = secure_filename(file.filename)
        filename = f"{job_id}_{secure_name}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        file.save(filepath)
        print(f"File saved: {filepath}")
        
        with jobs_lock:
            jobs[job_id] = {
                "status": "queued",
                "progress": 0,
                "filename": original_filename,
                "created_at": time.time(),
                "filepath": filepath
            }
        
        thread = threading.Thread(target=process_file_async, args=(job_id, filepath, original_filename))
        thread.daemon = True
        thread.start()
        
        print(f"Started processing job {job_id}")
        
        return jsonify({
            "job_id": job_id,
            "status": "queued",
            "message": "File uploaded successfully, processing started"
        })
        
    except Exception as e:
        print(f"Error in run_analysis: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/job-status/<job_id>')
def get_job_status(job_id):
    """Get the status of a specific job"""
    try:
        with jobs_lock:
            if job_id not in jobs:
                return jsonify({"error": "Job not found"}), 404
            
            job_data = jobs[job_id].copy()
        
 
        job_data.pop('filepath', None)
        
        return jsonify(job_data)
        
    except Exception as e:
        print(f"Error getting job status: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/results/<job_id>')
def results(job_id):
    """Serve results page for a specific job"""
    try:
        with jobs_lock:
            if job_id not in jobs:
                return jsonify({"error": "Job not found"}), 404
            
            job_data = jobs[job_id].copy()
        
        if job_data["status"] != "completed":
            return jsonify({
                "error": "Job not completed yet",
                "status": job_data.get("status", "unknown"),
                "progress": job_data.get("progress", 0)
            }), 400
        
        summary_path = os.path.join(app.config['OUTPUT_FOLDER'], f'{job_id}_summary.json')
        image_path = os.path.join(app.config['STATIC_FOLDER'], f'{job_id}_histogram.png')
        
        print(f"Looking for summary at: {summary_path}")
        print(f"Looking for image at: {image_path}")
        
        if not os.path.exists(summary_path):
            return jsonify({"error": f"Summary file not found at {summary_path}"}), 404
            
        if not os.path.exists(image_path):
            return jsonify({"error": f"Image file not found at {image_path}"}), 404

        with open(summary_path, 'r') as f:
            summary = json.load(f)

        return jsonify({
            "job_id": job_id,
            "filename": job_data["filename"],
            "summary": summary,
            "image_url": f"/static/{job_id}_histogram.png",
            "status": "completed"
        })
        
    except Exception as e:
        print(f"Error serving results: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files (images, etc.)"""
    try:
        return send_from_directory(app.config['STATIC_FOLDER'], filename)
    except Exception as e:
        return jsonify({"error": f"File not found: {str(e)}"}), 404

@app.route('/health')
def health_check():
    """Simple health check endpoint"""
    with jobs_lock:
        active_jobs = len([j for j in jobs.values() if j.get("status") in ["queued", "processing"]])
        total_jobs = len(jobs)
    
    return jsonify({
        "status": "healthy",
        "active_jobs": active_jobs,
        "total_jobs": total_jobs,
        "timestamp": time.time()
    })

@app.route('/jobs')
def list_jobs():
    """List all jobs (for debugging)"""
    with jobs_lock:
       
        safe_jobs = {}
        for job_id, job_data in jobs.items():
            safe_job = job_data.copy()
            safe_job.pop('filepath', None)
            safe_jobs[job_id] = safe_job
    
    return jsonify(safe_jobs)

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 100MB."}), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print("Starting Flask server...")
    print(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
    print(f"Output folder: {app.config['OUTPUT_FOLDER']}")
    print(f"Static folder: {app.config['STATIC_FOLDER']}")
    
    if not os.path.exists('notebooks/preprocessing.ipynb'):
        print("WARNING: notebooks/preprocessing.ipynb not found!")
    
    app.run(debug=True, host='0.0.0.0', port=5000)