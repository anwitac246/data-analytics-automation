import pandas as pd
import numpy as np
import json
import logging
import evalml
from evalml.automl import AutoMLSearch
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, mean_absolute_error, r2_score
import pickle
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_ml_analysis_async(job_id, jobs_lock, filepath, metric, update_job_status):
    try:
        update_job_status(job_id, status="processing", progress=10)
        df = pd.read_csv(filepath)
        
        # Drop 'id' column if present
        if 'id' in df.columns:
            df = df.drop(columns=['id'])
        
        # Handle datetime columns
        datetime_cols = df.select_dtypes(include=['datetime64']).columns
        if len(datetime_cols) > 0:
            logger.warning(f"Dropping datetime columns: {datetime_cols}")
            df = df.drop(columns=datetime_cols)
        
        # Determine target column
        target_col = df.columns[-1]
        is_classification = df[target_col].dtype in ['object', 'category'] or len(df[target_col].unique()) < 20
        update_job_status(job_id, progress=20)

        # Prepare data
        X = df.drop(columns=[target_col])
        y = df[target_col]

        # Save schema
        schema = {
            'dtypes': X.dtypes.to_dict(),
            'columns': list(X.columns)
        }

        # Map metrics
        scoring_map = {
            'accuracy': 'Accuracy Binary' if is_classification else None,
            'f1-score': 'F1' if is_classification else None,
            'rmse': 'Root Mean Squared Error' if not is_classification else None,
            'mae': 'Mean Absolute Error' if not is_classification else None,
            'r2': 'R2' if not is_classification else None
        }
        scoring_func_map = {
            'accuracy': accuracy_score,
            'f1-score': lambda y_true, y_pred: f1_score(y_true, y_pred, average='binary' if len(np.unique(y_true)) == 2 else 'macro'),
            'rmse': lambda y_true, y_pred: np.sqrt(mean_squared_error(y_true, y_pred)),
            'mae': mean_absolute_error,
            'r2': r2_score
        }

        if metric not in scoring_map or scoring_map[metric] is None:
            raise ValueError(f"Invalid metric for {'classification' if is_classification else 'regression'}: {metric}")
        evalml_metric = scoring_map[metric]
        scoring_func = scoring_func_map[metric]
        update_job_status(job_id, progress=40)

        # Initialize AutoML
        problem_type = 'binary' if is_classification else 'regression'
        automl = AutoMLSearch(
            X_train=X,
            y_train=y,
            problem_type=problem_type,
            objective=evalml_metric,
            max_time=120,
            n_jobs=1,
            optimize_thresholds=False,
            verbose=True
        )

        # Run AutoML
        automl.search()
        update_job_status(job_id, progress=60)

        # Evaluate best pipeline
        best_pipeline = automl.best_pipeline
        cv_scores = automl.rankings.iloc[0]['mean_cv_score']
        mean_score = float(cv_scores)

        # Get preprocessing steps
        numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
        categorical_cols = X.select_dtypes(include=['object', 'category']).columns.tolist()
        preprocessing = []
        if numeric_cols:
            preprocessing.append('Scaling for numeric columns')
        if categorical_cols:
            preprocessing.append('Encoding for categorical columns')
        if df.isnull().sum().sum() > 0:
            preprocessing.append('Impute missing values')

        # Save model and schema
        model_path = f'outputs/{job_id}_model.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump({'pipeline': best_pipeline, 'schema': schema}, f)

        # Save recommendations
        recommendations = {
            'best_model': str(best_pipeline.name),
            'preprocessing': preprocessing,
            'performance': mean_score,
            'is_classification': is_classification,
            'target_col': target_col,
            'numeric_cols': numeric_cols,
            'categorical_cols': categorical_cols,
            'model_path': model_path
        }
        output_file = f'outputs/{job_id}_ml_recommendations.json'
        with open(output_file, 'w') as f:
            json.dump(recommendations, f, indent=2)

        update_job_status(
            job_id,
            status="completed",
            progress=100,
            ml_recommendations=recommendations,
            output_file=output_file
        )
        logger.info(f"ML analysis completed for job {job_id}")

    except Exception as e:
        logger.error(f"Error in process_ml_analysis_async: {str(e)}")
        update_job_status(job_id, status="failed", progress=0, error=str(e))