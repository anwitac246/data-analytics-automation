import os
import uuid
import threading
import time
import traceback
import json
import re
import subprocess
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
import papermill as pm
from groq import Groq
from dotenv import load_dotenv
import pandas as pd
import pickle
from ml_analysis import process_ml_analysis_async

app = Flask(__name__)
CORS(app)

<<<<<<< HEAD
# Configuration
app.config['UPLOAD_FOLDER'] = 'notebooks/Uploads'
app.config['OUTPUT_FOLDER'] = os.path.abspath(os.path.join(os.path.dirname(__file__), 'outputs'))
app.config['STATIC_FOLDER'] = 'static'
app.config['TEMPLATE_FOLDER'] = 'templates'
=======
app.config['UPLOAD_FOLDER'] = "uploads"
app.config['OUTPUT_FOLDER'] = "outputs"
app.config['STATIC_FOLDER'] = "static"
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  
<<<<<<< HEAD
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
=======
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)
os.makedirs(app.config['STATIC_FOLDER'], exist_ok=True)

<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
=======

>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
jobs = {}
jobs_lock = threading.Lock()

def update_job_status(job_id, **kwargs):
    with jobs_lock:
        if job_id in jobs:
            jobs[job_id].update(kwargs)

def render_latex_to_html(job_id, template_data, output_dir):
    try:
<<<<<<< HEAD
        tex_content = render_template('report_template.tex', **template_data)
        tex_file = os.path.join(output_dir, f'{job_id}_report.tex')
        with open(tex_file, 'w', encoding='utf-8') as f:
            f.write(tex_content)

        subprocess.run(
            ['pdflatex', '-output-directory', output_dir, tex_file],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        html_file = os.path.join(output_dir, f'{job_id}_report.html')
        css_file = os.path.abspath(os.path.join(app.config['STATIC_FOLDER'], 'report_style.css'))
        subprocess.run(
            [
                'pandoc', tex_file,
                '-o', html_file,
                '--standalone',
                '--css', css_file,
                '--mathjax',
                '-V', 'geometry:margin=1in'
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        return html_file, f'{job_id}_report.pdf'
    except subprocess.CalledProcessError as e:
        print(f"Pandoc/LaTeX error: {e.stderr}")
        raise
=======
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
            
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
    except Exception as e:
        print(f"Error rendering LaTeX to HTML: {str(e)}")
        raise

@app.route('/run-analysis', methods=['POST'])
def run_analysis():
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
<<<<<<< HEAD
=======
        
<<<<<<< HEAD
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
=======
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
        original_filename = file.filename
        secure_name = secure_filename(file.filename)
        filename = f"{job_id}_{secure_name}"
        filepath = os.path.abspath(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        file.save(filepath)
        time.sleep(0.1)
        if not os.path.exists(filepath):
            print(f"Error: File not saved at {filepath}")
            return jsonify({"error": "Failed to save uploaded file"}), 500
        if os.path.getsize(filepath) == 0:
            print(f"Error: File is empty at {filepath}")
            os.remove(filepath)
            return jsonify({"error": "Uploaded file is empty"}), 400
        
        print(f"File saved: {filepath}, Size: {os.path.getsize(filepath)} bytes")
        
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
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/ml-analysis', methods=['POST'])
def ml_analysis():
    try:
        if 'file' not in request.files or 'metric' not in request.form:
            return jsonify({"error": "Training file and metric required"}), 400

        file = request.files['file']
        metric = request.form['metric']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        if metric not in ['accuracy', 'f1-score', 'rmse', 'mae', 'r2']:
            return jsonify({"error": "Invalid metric"}), 400

        job_id = str(uuid.uuid4())
        original_filename = file.filename
        secure_name = secure_filename(file.filename)
        filename = f"{job_id}_{secure_name}"
        filepath = os.path.abspath(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        file.save(filepath)
        if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
            os.remove(filepath)
            return jsonify({"error": "Failed to save or empty file"}), 400

        with jobs_lock:
            jobs[job_id] = {
                "status": "queued",
                "progress": 0,
                "filename": original_filename,
                "created_at": time.time(),
                "filepath": filepath,
                "metric": metric,
                "type": "ml-analysis"
            }

        thread = threading.Thread(
            target=process_ml_analysis_async,
            args=(job_id, jobs_lock, filepath, metric, update_job_status)
        )
        thread.daemon = True
        thread.start()

        return jsonify({
            "job_id": job_id,
            "status": "queued",
            "message": "ML analysis started"
        })

    except Exception as e:
        print(f"Error in ml_analysis: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/generate-submission', methods=['POST'])
def generate_submission():
    try:
        if 'test_file' not in request.files or 'submission_file' not in request.files or 'job_id' not in request.form:
            print("Missing required inputs: test_file, submission_file, or job_id")
            return jsonify({"error": "Test file, submission_file, and job ID required"}), 400

        test_file = request.files['test_file']
        submission_file = request.files['submission_file']
        job_id = request.form['job_id']
        print(f"Processing submission for job_id: {job_id}")

        with jobs_lock:
            if job_id not in jobs or jobs[job_id]['status'] != 'completed':
                print(f"Invalid or incomplete job_id: {job_id}")
                return jsonify({"error": "Invalid or incomplete job ID"}), 400
            job_data = jobs[job_id]

        test_filename = secure_filename(test_file.filename)
        submission_filename = secure_filename(submission_file.filename)
        test_filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{job_id}_test_{test_filename}")
        submission_filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{job_id}_submission_{submission_filename}")

        test_file.save(test_filepath)
        submission_file.save(submission_filepath)
        print(f"Saved test_file: {test_filepath}, submission_file: {submission_filepath}")

        recommendations_file = job_data.get('output_file')
        if not os.path.exists(recommendations_file):
            print(f"Recommendations file not found: {recommendations_file}")
            return jsonify({"error": "Recommendations file not found"}), 404
        with open(recommendations_file, 'r') as f:
            recommendations = json.load(f)

        test_df = pd.read_csv(test_filepath)
        submission_df = pd.read_csv(submission_filepath)
        train_df = pd.read_csv(job_data['filepath'])
        print(f"Loaded test_df shape: {test_df.shape}, submission_df shape: {submission_df.shape}, train_df shape: {train_df.shape}")
        print(f"Submission_df columns: {submission_df.columns.tolist()}")

        # Validate row counts
        if len(test_df) != len(submission_df):
            print(f"Error: Test data ({len(test_df)} rows) and submission data ({len(submission_df)} rows) have mismatched row counts")
            return jsonify({"error": "Test and submission files must have the same number of rows"}), 400

        # Drop 'id' column if present in test_df and train_df
        if 'id' in test_df.columns:
            test_df = test_df.drop(columns=['id'])
        if 'id' in train_df.columns:
            train_df = train_df.drop(columns=['id'])

        # Load model and schema
        model_path = recommendations.get('model_path')
        if not os.path.exists(model_path):
            print(f"Model file not found: {model_path}")
            return jsonify({"error": "Model file not found"}), 404

        with open(model_path, 'rb') as file:
            saved_data = pickle.load(file)
            model = saved_data['pipeline']
            schema = saved_data['schema']
        print(f"Loaded model from: {model_path}, schema columns: {schema['columns']}")

        # Preprocess test_df to match training schema
        missing_cols = set(schema['columns']) - set(test_df.columns)
        if missing_cols:
            print(f"Error: Test data missing columns: {missing_cols}")
            return jsonify({"error": f"Missing columns: {missing_cols}"}), 400
        extra_cols = set(test_df.columns) - set(schema['columns'])
        if extra_cols:
            print(f"Dropping extra columns: {extra_cols}")
            test_df = test_df.drop(columns=extra_cols)
        test_df = test_df[schema['columns']]  # Reorder columns
        print(f"Test_df columns after reordering: {test_df.columns.tolist()}")

        # Enforce dtypes
        for col, dtype in schema['dtypes'].items():
            try:
                test_df[col] = test_df[col].astype(dtype)
            except Exception as e:
                print(f"Error converting column {col} to {dtype}: {str(e)}")
                return jsonify({"error": f"Cannot convert {col} to {dtype}: {str(e)}"}), 400
        print(f"Test_df dtypes after conversion: {test_df.dtypes}")

        # Drop datetime columns if any
        datetime_cols = [col for col in test_df.columns if test_df[col].dtype.name.startswith('datetime64')]
        if datetime_cols:
            print(f"Dropping datetime columns: {datetime_cols}")
            test_df = test_df.drop(columns=datetime_cols)

        # Predict
        predictions = model.predict(test_df)
        print(f"Generated {len(predictions)} predictions")

        # Create final DataFrame with only target column
        target_col = recommendations['target_col']
        final_df = pd.DataFrame({target_col: predictions})
        print(f"Final_df columns: {final_df.columns.tolist()}")

        # Save submission CSV
        output_submission = os.path.join(app.config['OUTPUT_FOLDER'], f'{job_id}_submission.csv')
        with open(output_submission, 'w', encoding='utf-8', newline='') as f:
            final_df.to_csv(f, index=False)
            f.flush()
            os.fsync(f.fileno())
        print(f"Saved submission file: {output_submission}, Size: {os.path.getsize(output_submission)} bytes")

        # Verify file existence with retries
        max_retries = 5
        retry_delay = 1.0
        for attempt in range(max_retries):
            if os.path.exists(output_submission) and os.path.getsize(output_submission) > 0:
                break
            print(f"Submission file not found, retrying attempt {attempt + 1}/{max_retries}...")
            time.sleep(retry_delay)
        else:
            print(f"Failed to verify submission file after {max_retries} attempts: {output_submission}")
            return jsonify({"error": "Failed to generate submission file"}), 500

        # Update job status
        update_job_status(job_id, submission_file=output_submission, submission_status="generated")

        # Clean up temporary files
        for temp_file in [test_filepath, submission_filepath]:
            try:
                os.remove(temp_file)
                print(f"Cleaned up temporary file: {temp_file}")
            except OSError as e:
                print(f"Error cleaning up {temp_file}: {str(e)}")

        return jsonify({
            "job_id": job_id,
            "submission_url": f"/outputs/{job_id}_submission.csv",
            "message": "Submission file generated successfully"
        })

    except Exception as e:
        print(f"Error in generate_submission: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

def process_file_async(job_id, filepath, filename):
    try:
        print(f"Starting processing for job {job_id}")
        update_job_status(job_id, status="processing", progress=10)
        
        output_notebook = os.path.abspath(os.path.join(app.config['OUTPUT_FOLDER'], f"{job_id}_output.ipynb"))
        output_image = os.path.abspath(os.path.join(app.config['STATIC_FOLDER'], f'{job_id}_histogram.png'))
        summary_file = os.path.abspath(os.path.join(app.config['OUTPUT_FOLDER'], f'{job_id}_summary.json'))
        
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Input file not found: {filepath}")
        if os.path.getsize(filepath) == 0:
            raise ValueError(f"Input file is empty: {filepath}")
        
        notebook_path = 'notebooks/preprocessing.ipynb'
        if not os.path.exists(notebook_path):
            raise FileNotFoundError(f"Notebook not found: {notebook_path}")
        
        update_job_status(job_id, progress=30)
        
        pm.execute_notebook(
            notebook_path,
            output_notebook,
            parameters={
                "input_file": filepath,
                "output_image": output_image,
                "summary_file": summary_file,
                "job_id": job_id
            },
            cwd=os.path.dirname(notebook_path)
        )
        
        print(f"Notebook executed for job {job_id}")
        update_job_status(job_id, progress=80)
        
        if not os.path.exists(summary_file):
            raise FileNotFoundError("Summary file was not created by the notebook")
        
        with open(summary_file, 'r') as f:
            summary_data = json.load(f)
        
        # Dummy LLM insights for testing
        llm_insights = {
            "summary": "Dataset processed, insights skipped for testing.",
            "key_columns": [],
            "correlation_insights": [],
            "recommendations": ["Enable Groq API for full insights."]
        }

        insights_file = os.path.join(app.config['OUTPUT_FOLDER'], f'{job_id}_insights.json')
        with open(insights_file, 'w') as f:
            json.dump(llm_insights, f, indent=2)
        
        print(f"Job {job_id} completed successfully")
        update_job_status(
            job_id,
            status="completed",
            progress=100,
            summary_file=summary_file,
            image_file=output_image,
            insights_file=insights_file,
            filename=filename
        )
            
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

@app.route('/job-status/<job_id>')
def job_status(job_id):
    try:
        with jobs_lock:
            if job_id not in jobs:
                return jsonify({"error": "Job not found"}), 404
<<<<<<< HEAD
        return jsonify(jobs[job_id])
=======
            
            job_data = jobs[job_id].copy()
        
 
        job_data.pop('filepath', None)
        
        return jsonify(job_data)
        
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
    except Exception as e:
        print(f"Error retrieving job status for {job_id}: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/results/<job_id>')
def results(job_id):
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
        
<<<<<<< HEAD
<<<<<<< HEAD
        if job_data.get("type") == "ml-analysis":
            output_file = job_data.get("output_file")
            if not os.path.exists(output_file):
                return jsonify({"error": "Recommendations file not found"}), 404
            with open(output_file, 'r') as f:
                recommendations = json.load(f)
            return jsonify({
                "job_id": job_id,
                "ml_recommendations": recommendations,
                "status": "completed"
            })

=======
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
=======
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
        summary_path = os.path.join(app.config['OUTPUT_FOLDER'], f'{job_id}_summary.json')
        image_path = os.path.join(app.config['STATIC_FOLDER'], f'{job_id}_histogram.png')
        insights_path = os.path.join(app.config['OUTPUT_FOLDER'], f'{job_id}_insights.json')
        
<<<<<<< HEAD
=======
        print(f"Looking for summary at: {summary_path}")
        print(f"Looking for image at: {image_path}")
        
<<<<<<< HEAD
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
=======
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
        if not os.path.exists(summary_path):
            return jsonify({"error": "Summary file not found"}), 404
        if not os.path.exists(image_path):
            return jsonify({"error": "Image file not found"}), 404
        if not os.path.exists(insights_path):
            return jsonify({"error": "Insights file not found"}), 404

<<<<<<< HEAD
<<<<<<< HEAD
        with open(summary_path, 'r', encoding='utf-8') as f:
=======
=======
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
        with open(summary_path, 'r') as f:
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
            summary = json.load(f)
        with open(insights_path, 'r', encoding='utf-8') as f:
            insights = json.load(f)

        return jsonify({
            "job_id": job_id,
            "filename": job_data["filename"],
            "summary": summary,
            "image_url": f"/static/{job_id}_histogram.png",
            "insights": insights,
            "status": "completed"
        })
        
    except Exception as e:
        print(f"Error serving results for job {job_id}: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/report/<job_id>')
def generate_report(job_id):
    try:
        with jobs_lock:
            if job_id not in jobs:
                return jsonify({"error": "Job not found"}), 404
            job_data = jobs[job_id].copy()
        
        if job_data["status"] != "completed":
            return jsonify({"error": "Job not completed"}), 400
        
        summary_path = os.path.join(app.config['OUTPUT_FOLDER'], f'{job_id}_summary.json')
        insights_path = os.path.join(app.config['OUTPUT_FOLDER'], f'{job_id}_insights.json')
        image_path = os.path.join(app.config['STATIC_FOLDER'], f'{job_id}_histogram.png')
        
        if not os.path.exists(summary_path):
            return jsonify({"error": f"Summary file not found at {summary_path}"}), 404
        if not os.path.exists(insights_path):
            return jsonify({"error": f"Insights file not found at {insights_path}"}), 404
        if not os.path.exists(image_path):
            return jsonify({"error": f"Image file not found at {image_path}"}), 404
        
        with open(summary_path, 'r', encoding='utf-8') as f:
            summary = json.load(f)
        with open(insights_path, 'r', encoding='utf-8') as f:
            insights = json.load(f)
        
        def ensure_list(value, field_name):
            if isinstance(value, list):
                return value
            print(f"Warning: {field_name} is not a list: {type(value).__name__} - {value}")
            return []

        def ensure_string(value, field_name):
            if isinstance(value, str):
                return value
            print(f"Warning: {field_name} is not a string: {type(value).__name__} - {value}")
            return str(value) if value is not None else "N/A"

        def ensure_dict(value, field_name):
            if isinstance(value, dict):
                return value
            print(f"Warning: {field_name} is not a dict: {type(value).__name__} - {value}")
            return {}

        template_data = {
            "job_id": job_id,
            "dataset_name": ensure_string(summary.get('filename', ''), 'filename'),
            "processed_at": ensure_string(summary.get('processed_at', time.strftime('%Y-%m-%d %H:%M:%S')), 'processed_at'),
            "image_url": os.path.abspath(image_path),
            "insights_summary": ensure_string(insights.get('summary', 'No summary available'), 'insights_summary'),
            "rows": summary.get('cleaned_shape', [0, 0])[0],
            "columns": summary.get('cleaned_shape', [0, 0])[1],
            "numeric_columns": ensure_list(summary.get('numeric_columns', []), 'numeric_columns'),
            "categorical_columns": ensure_list(summary.get('categorical_columns', []), 'categorical_columns'),
            "key_columns": ensure_list(insights.get('key_columns', []), 'key_columns'),
            "correlation_insights": ensure_list(insights.get('correlation_insights', []), 'correlation_insights'),
            "recommendations": ensure_list(insights.get('recommendations', []), 'recommendations'),
            "missing_values": [
                {"column": col, "count": count}
                for col, count in ensure_dict(summary.get('missing_values', {}), 'missing_values').items()
            ],
            "stats_columns": list(ensure_dict(summary.get('descriptive_statistics', {})).keys()),
            "stats_rows": [
                {
                    "stat": stat,
                    "stat_values": ensure_list(
                        [
                            round(summary.get('descriptive_statistics', {}).get(col, {}).get(stat, 0), 3)
                            for col in ensure_dict(summary.get('descriptive_statistics', {})).keys()
                        ],
                        f"stats_rows[{stat}]"
                    )
                }
                for stat in ['mean', 'std', 'min', '25%', '50%', '75%', 'max']
            ],
            "corr_columns": list(ensure_dict(summary.get('correlations', {})).keys()),
            "corr_rows": [
                {
                    "column": col1,
                    "corr_values": ensure_list(
                        [
                            round(summary.get('correlations', {}).get(col1, {}).get(col2, 0), 3)
                            for col2 in ensure_dict(summary.get('correlations', {})).keys()
                        ],
                        f"corr_rows[{col1}]"
                    )
                }
                for col1 in ensure_dict(summary.get('correlations', {})).keys()
            ],
            "feature_importance": [
                {"column": col, "importance": round(imp, 3)}
                for col, imp in ensure_dict(summary.get('feature_importance', {})).items()
            ]
        }
        
        print(f"Template data for job {job_id}:")
        for key, value in template_data.items():
            print(f"  {key}: {type(value).__name__} - {value[:100] if isinstance(value, (list, str)) else value}")
        
        html_file, pdf_file = render_latex_to_html(job_id, template_data, app.config['OUTPUT_FOLDER'])
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        update_job_status(job_id, pdf_file=pdf_file)
        return html_content
        
    except Exception as e:
        print(f"Error generating report for job {job_id}: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/download-pdf/<job_id>')
def download_pdf(job_id):
    try:
        with jobs_lock:
            if job_id not in jobs:
                return jsonify({"error": "Job not found"}), 404
            job_data = jobs[job_id]
        
        pdf_file = job_data.get('pdf_file')
        if not pdf_file or not os.path.exists(pdf_file):
            return jsonify({"error": "PDF file not found"}), 404
        
        return send_from_directory(
            app.config['OUTPUT_FOLDER'],
            os.path.basename(pdf_file),
            as_attachment=True,
            download_name=f'report_{job_id}.pdf'
        )
    except Exception as e:
        print(f"Error serving PDF for job {job_id}: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"File not found: {str(e)}"}), 404

@app.route('/outputs/<filename>')
def serve_output(filename):
    try:
        safe_filename = secure_filename(filename)
        output_dir = app.config['OUTPUT_FOLDER']
        file_path = os.path.normpath(os.path.join(output_dir, safe_filename))

<<<<<<< HEAD
        print(f"Requested filename: {filename}")
        print(f"Secured filename: {safe_filename}")
        print(f"Output directory: {output_dir}")
        print(f"Constructed file path: {file_path}")
=======
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
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c

        if not file_path.startswith(os.path.abspath(output_dir)):
            print(f"Security error: Attempted to access file outside output directory: {file_path}")
            return jsonify({"error": "Invalid file path"}), 400

        # Extended retry mechanism
        max_retries = 5
        retry_delay = 1.0
        for attempt in range(max_retries):
            print(f"Checking file existence, attempt {attempt + 1}/{max_retries}: {file_path}")
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                file_mtime = time.ctime(os.path.getmtime(file_path))
                print(f"File found: Size={file_size} bytes, Modified={file_mtime}")
                break
            if attempt < max_retries - 1:
                print(f"File not found, retrying after {retry_delay}s...")
                time.sleep(retry_delay)
        else:
            print(f"File not found after {max_retries} attempts: {file_path}")
            return jsonify({"error": f"File not found: {safe_filename}"}), 404

        if not os.access(file_path, os.R_OK):
            print(f"File not readable: {file_path}")
            return jsonify({"error": f"File not accessible: {safe_filename}"}), 403

        print(f"Serving file: {file_path}")
        return send_from_directory(
            output_dir,
            safe_filename,
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        print(f"Error serving file {filename}: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
<<<<<<< HEAD
=======
    print("Starting Flask server...")
    print(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
    print(f"Output folder: {app.config['OUTPUT_FOLDER']}")
    print(f"Static folder: {app.config['STATIC_FOLDER']}")
    
    if not os.path.exists('notebooks/preprocessing.ipynb'):
        print("WARNING: notebooks/preprocessing.ipynb not found!")
    
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
    app.run(debug=True, host='0.0.0.0', port=5000)