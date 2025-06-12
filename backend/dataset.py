from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import kaggle
import os
import zipfile
import tempfile
import shutil
import pandas as pd
from datetime import datetime
import logging
from werkzeug.exceptions import BadRequest

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


app = Flask(__name__)
CORS(app)

class KaggleDatasetManager:
    
    def __init__(self):
        try:
            self.api = kaggle.api
            self.api.authenticate()
            logger.info("Kaggle API authenticated successfully")
        except Exception as e:
            logger.error(f"Failed to authenticate Kaggle API: {str(e)}")
            raise

    def search_datasets(self, query, page=1, sort_by='votes'):
        """Search for datasets on Kaggle"""
        try:

            valid_sort_options = ['hottest', 'votes', 'updated', 'active', 'published']
            if sort_by not in valid_sort_options:
                sort_by = 'votes'
            
            datasets = self.api.dataset_list(
                search=query,
                page=page,
                sort_by=sort_by
            )

            results = []
            for dataset in datasets:
                try:
                  
                    detailed = self.api.dataset_view(dataset.ref)
                    
               
                    files = getattr(detailed, 'files', [])
                    total_size = 0
                    file_types = []
                    
                    for file in files:
                        if hasattr(file, 'totalBytes') and file.totalBytes:
                            total_size += file.totalBytes
                        if hasattr(file, 'name') and file.name:
                            file_ext = file.name.split('.')[-1].lower()
                            if file_ext not in file_types:
                                file_types.append(file_ext)

                    tags = []
                    if hasattr(detailed, 'tags') and detailed.tags:
                        tags = [tag.name for tag in detailed.tags if hasattr(tag, 'name')]

                    result = {
                        'ref': dataset.ref,
                        'title': dataset.title if hasattr(dataset, 'title') else '',
                        'subtitle': getattr(detailed, 'subtitle', '') or '',
                        'description': getattr(detailed, 'description', '') or '',
                        'url': f"https://www.kaggle.com/datasets/{dataset.ref}",
                        'size': total_size,
                        'downloadCount': getattr(detailed, 'downloadCount', 0) or 0,
                        'voteCount': getattr(detailed, 'voteCount', 0) or 0,
                        'lastUpdated': detailed.lastUpdated.isoformat() if hasattr(detailed, 'lastUpdated') and detailed.lastUpdated else None,
                        'licenseName': getattr(detailed, 'licenseName', '') or '',
                        'tags': tags,
                        'fileTypes': file_types,
                        'fileCount': len(files)
                    }
                    results.append(result)
                    
                except Exception as detail_error:
                    logger.warning(f"Failed to get details for dataset {dataset.ref}: {str(detail_error)}")
                   
                    result = {
                        'ref': dataset.ref,
                        'title': dataset.title if hasattr(dataset, 'title') else '',
                        'subtitle': '',
                        'description': '',
                        'url': f"https://www.kaggle.com/datasets/{dataset.ref}",
                        'size': 0,
                        'downloadCount': 0,
                        'voteCount': 0,
                        'lastUpdated': None,
                        'licenseName': '',
                        'tags': [],
                        'fileTypes': [],
                        'fileCount': 0
                    }
                    results.append(result)

            return {
                'success': True,
                'datasets': results,
                'total': len(results),
                'page': page,
                'query': query
            }
        except Exception as e:
            logger.error(f"Error searching datasets: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'datasets': []
            }

    def get_dataset_files(self, dataset_ref):
        """Get list of files in a dataset without downloading"""
        temp_dir = None
        try:
            temp_dir = tempfile.mkdtemp()
            
            self.api.dataset_download_files(dataset_ref, path=temp_dir, unzip=False)
            
            zip_files = [f for f in os.listdir(temp_dir) if f.endswith('.zip')]
            if not zip_files:
                raise Exception("No zip file found after download")
            
            zip_path = os.path.join(temp_dir, zip_files[0])

            files = []
            with zipfile.ZipFile(zip_path, 'r') as z:
                for info in z.infolist():
                    if not info.is_dir(): 
                        files.append({
                            'name': info.filename,
                            'size': info.file_size,
                            'compressed_size': info.compress_size,
                            'date_time': datetime(*info.date_time).isoformat() if info.date_time else None
                        })

            return {
                'success': True,
                'files': files,
                'dataset_ref': dataset_ref
            }
        except Exception as e:
            logger.error(f"Error getting dataset files for {dataset_ref}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'files': []
            }
        finally:
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)

    def download_dataset(self, dataset_ref):
        """Download a complete dataset as a zip file"""
        temp_dir = None
        try:
            temp_dir = tempfile.mkdtemp()
            download_path = os.path.join(temp_dir, 'dataset')
            os.makedirs(download_path, exist_ok=True)

         
            self.api.dataset_download_files(
                dataset_ref,
                path=download_path,
                unzip=True
            )

           
            zip_filename = f"{dataset_ref.replace('/', '_')}.zip"
            zip_path = os.path.join(temp_dir, zip_filename)
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(download_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        
                        arcname = os.path.relpath(file_path, download_path)
                        zipf.write(file_path, arcname)

            if not os.path.exists(zip_path):
                raise Exception("Failed to create zip file")

            return {
                'success': True,
                'zip_path': zip_path,
                'temp_dir': temp_dir
            }
        except Exception as e:
            logger.error(f"Error downloading dataset {dataset_ref}: {str(e)}")
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)
            return {
                'success': False,
                'error': str(e)
            }

    def preview_dataset(self, dataset_ref, file_name=None, rows=10):
        """Preview dataset files"""
        temp_dir = None
        try:
            temp_dir = tempfile.mkdtemp()
            download_path = os.path.join(temp_dir, 'preview')
            os.makedirs(download_path, exist_ok=True)

           
            self.api.dataset_download_files(
                dataset_ref,
                path=download_path,
                unzip=True
            )

            previews = []
            files_processed = 0
            max_files = 10  

            for root, dirs, files in os.walk(download_path):
                for file in files:
                    if files_processed >= max_files:
                        break
                        
                   
                    if file_name is None and file.lower().endswith(('.csv', '.tsv')):
                       
                        should_process = True
                    elif file_name and file == file_name:
                       
                        should_process = True
                    else:
                       
                        continue
                    
                    if should_process:
                        file_path = os.path.join(root, file)
                        try:
                            
                            encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
                            df = None
                            
                            for encoding in encodings:
                                try:
                                    separator = '\t' if file.lower().endswith('.tsv') else ','
                                    df = pd.read_csv(file_path, nrows=rows, encoding=encoding, sep=separator)
                                    break
                                except UnicodeDecodeError:
                                    continue
                            
                            if df is None:
                                raise Exception("Unable to decode file with available encodings")

                           
                            dtypes_dict = {}
                            for col, dtype in df.dtypes.items():
                                dtypes_dict[col] = str(dtype)

                            previews.append({
                                'file_name': file,
                                'file_path': os.path.relpath(file_path, download_path),
                                'columns': df.columns.tolist(),
                                'data': df.to_dict('records'),
                                'shape': list(df.shape),
                                'dtypes': dtypes_dict,
                                'file_size': os.path.getsize(file_path)
                            })
                            files_processed += 1
                            
                        except Exception as e:
                            logger.warning(f"Could not preview file {file}: {str(e)}")
                            previews.append({
                                'file_name': file,
                                'file_path': os.path.relpath(file_path, download_path),
                                'error': f"Could not preview file: {str(e)}"
                            })

                        
                        if file_name:
                            break
                
                if files_processed >= max_files or file_name:
                    break

            return {
                'success': True,
                'previews': previews,
                'dataset_ref': dataset_ref,
                'files_processed': files_processed
            }
        except Exception as e:
            logger.error(f"Error previewing dataset {dataset_ref}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'previews': []
            }
        finally:
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)



try:
    kaggle_manager = KaggleDatasetManager()
except Exception as e:
    logger.error(f"Failed to initialize Kaggle manager: {str(e)}")
    kaggle_manager = None


@app.route('/api/search', methods=['GET'])
def search_datasets_route():
    """Search for datasets endpoint"""
    if not kaggle_manager:
        return jsonify({'success': False, 'error': 'Kaggle API not available'}), 500
    
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'success': False, 'error': 'Query parameter "q" is required'}), 400

    try:
        page = int(request.args.get('page', 1))
        if page < 1:
            page = 1
    except ValueError:
        page = 1

    sort_by = request.args.get('sort_by', 'votes')
    
    result = kaggle_manager.search_datasets(query, page, sort_by)
    return jsonify(result)


@app.route('/api/dataset/<path:dataset_ref>/files', methods=['GET'])
def get_dataset_files_route(dataset_ref):
    """Get dataset files list endpoint"""
    if not kaggle_manager:
        return jsonify({'success': False, 'error': 'Kaggle API not available'}), 500
    
    if not dataset_ref:
        return jsonify({'success': False, 'error': 'Dataset reference is required'}), 400
    
    result = kaggle_manager.get_dataset_files(dataset_ref)
    return jsonify(result)


@app.route('/api/dataset/<path:dataset_ref>/download', methods=['GET'])
def download_dataset_route(dataset_ref):
    """Download dataset endpoint"""
    if not kaggle_manager:
        return jsonify({'success': False, 'error': 'Kaggle API not available'}), 500
    
    if not dataset_ref:
        return jsonify({'success': False, 'error': 'Dataset reference is required'}), 400
    
    result = kaggle_manager.download_dataset(dataset_ref)

    if result['success']:
        try:
            zip_filename = f"{dataset_ref.replace('/', '_')}.zip"
            return send_file(
                result['zip_path'],
                as_attachment=True,
                download_name=zip_filename,
                mimetype='application/zip'
            )
        except Exception as e:
            logger.error(f"Error sending file: {str(e)}")
            return jsonify({'success': False, 'error': 'Failed to send file'}), 500
        finally:
        
            if 'temp_dir' in result and os.path.exists(result['temp_dir']):
                shutil.rmtree(result['temp_dir'], ignore_errors=True)
    else:
        return jsonify(result), 500


@app.route('/api/dataset/<path:dataset_ref>/preview', methods=['GET'])
def preview_dataset_route(dataset_ref):
    """Preview dataset endpoint"""
    if not kaggle_manager:
        return jsonify({'success': False, 'error': 'Kaggle API not available'}), 500
    
    if not dataset_ref:
        return jsonify({'success': False, 'error': 'Dataset reference is required'}), 400
    
    file_name = request.args.get('file')
    
    try:
        rows = int(request.args.get('rows', 10))
        if rows < 1:
            rows = 10
        elif rows > 1000: 
            rows = 1000
    except ValueError:
        rows = 10
    
    result = kaggle_manager.preview_dataset(dataset_ref, file_name, rows)
    return jsonify(result)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        if not kaggle_manager:
            return jsonify({
                'success': False,
                'error': 'Kaggle API manager not initialized',
                'timestamp': datetime.now().isoformat()
            }), 500
        
       
        kaggle_manager.api.authenticate()
        
        return jsonify({
            'success': True,
            'message': 'Kaggle API is authenticated and ready',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'success': False, 'error': 'Internal server error'}), 500


@app.errorhandler(BadRequest)
def bad_request(error):
    return jsonify({'success': False, 'error': 'Bad request'}), 400


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)