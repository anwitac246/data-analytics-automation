'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const MLAnalysisPage = () => {
  const [trainFile, setTrainFile] = useState(null);
  const [testFile, setTestFile] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [metric, setMetric] = useState('accuracy');
  const [jobId, setJobId] = useState(null);
  const [manualJobId, setManualJobId] = useState('');
  const [status, setStatus] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  const metrics = ['accuracy', 'f1-score', 'rmse', 'mae', 'r2'];

  const handleTrainSubmit = async (e) => {
    e.preventDefault();
    if (!trainFile || !metric) {
      setError('Please upload a training file and select a metric.');
      return;
    }

    const formData = new FormData();
    formData.append('file', trainFile);
    formData.append('metric', metric);

    try {
      setStatus('Uploading training data...');
      const response = await fetch('http://localhost:5000/ml-analysis', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setStatus(null);
        return;
      }
      setJobId(data.job_id);
      setManualJobId(data.job_id);
      pollJobStatus(data.job_id);
    } catch (err) {
      setError('Failed to upload training data: ' + err.message);
      setStatus(null);
    }
  };

  const pollJobStatus = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/job-status/${jobId}`);
        const data = await response.json();
        setStatus(data.status);
        if (data.status === 'completed') {
          clearInterval(interval);
          fetchRecommendations(jobId);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setError(data.error || 'Job failed.');
          setStatus(null);
        }
      } catch (err) {
        clearInterval(interval);
        setError('Failed to check job status: ' + err.message);
        setStatus(null);
      }
    }, 3000);
  };

  const fetchRecommendations = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/results/${jobId}`);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setRecommendations(data.ml_recommendations);
      setStatus('Analysis complete.');
    } catch (err) {
      setError('Failed to fetch recommendations: ' + err.message);
      setStatus(null);
    }
  };

  const handleSubmissionGenerate = async (e) => {
    e.preventDefault();
    if (!testFile || !submissionFile || !manualJobId) {
      setError('Please upload test data, sample submission, and provide a job ID.');
      return;
    }

    const formData = new FormData();
    formData.append('test_file', testFile);
    formData.append('submission_file', submissionFile);
    formData.append('job_id', manualJobId);

    try {
      setStatus('Generating submission file...');
      const response = await fetch('http://localhost:5000/generate-submission', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setStatus(null);
        return;
      }
      setSubmissionUrl(data.submission_url);
      setJobId(manualJobId);
      setStatus('Submission file generated.');
    } catch (err) {
      setError('Failed to generate submission file: ' + err.message);
      setStatus(null);
    }
  };

  const handleDownload = async () => {
    if (!submissionUrl) {
      setError('No submission file available to download.');
      return;
    }

    setIsDownloading(true);
    setError(null);

    const maxRetries = 3;
    const retryDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`http://localhost:5000${submissionUrl}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = submissionUrl.split('/').pop();
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setStatus('Submission file downloaded.');
        setIsDownloading(false);
        return;
      } catch (err) {
        console.error(`Download attempt ${attempt} failed: ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else {
          setError(`Failed to download file after ${maxRetries} attempts: ${err.message}`);
          setIsDownloading(false);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full space-y-8 bg-gray-800/80 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-purple-700/20"
      >
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Machine Learning Analysis
        </h2>

        {error && (
          <div className="text-red-400 text-center">{error}</div>
        )}

        {!recommendations && (
          <form onSubmit={handleTrainSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Upload Training Data (CSV)
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setTrainFile(e.target.files[0])}
                className="mt-2 block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Select Evaluation Metric
              </label>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="mt-2 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {metrics.map((m) => (
                  <option key={m} value={m}>{m.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden text-white font-semibold rounded-full transition-all duration-300 hover:scale-105"
              disabled={status === 'Uploading training data...'}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:from-purple-500 group-hover:to-blue-500 transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10">
                {status === 'Uploading training data...' ? 'Uploading...' : 'Analyze Training Data'}
              </span>
            </button>
          </form>
        )}

        {status && (
          <div className="text-center text-gray-300 flex items-center justify-center">
            {status === 'Generating submission file...' || status === 'Uploading training data...' ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-purple-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : null}
            {status}
          </div>
        )}

        {recommendations && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-200">Recommendations</h3>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p><strong>Best Model:</strong> {recommendations.best_model}</p>
              <p><strong>Preprocessing Steps:</strong> {recommendations.preprocessing.join(', ')}</p>
              <p><strong>Expected Performance ({metric.toUpperCase()}):</strong> {recommendations.performance.toFixed(4)}</p>
            </div>

            <form onSubmit={handleSubmissionGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Job ID
                </label>
                <input
                  type="text"
                  value={manualJobId}
                  onChange={(e) => setManualJobId(e.target.value)}
                  placeholder="Enter Job ID (e.g., de355b4c-...)"
                  className="mt-2 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Upload Test Data (CSV)
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setTestFile(e.target.files[0])}
                  className="mt-2 block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Upload Sample Submission (CSV)
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                  className="mt-2 block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500"
                />
              </div>
              <button
                type="submit"
                className="w-full group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden text-white font-semibold rounded-full transition-all duration-300 hover:scale-105"
                disabled={status === 'Generating submission file...'}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:from-purple-500 group-hover:to-blue-500 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">
                  {status === 'Generating submission file...' ? 'Generating...' : 'Generate Submission File'}
                </span>
              </button>
            </form>

            {submissionUrl && (
              <div className="text-center">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-white transition-all duration-300 ${
                    isDownloading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                  }`}
                >
                  {isDownloading ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : null}
                  {isDownloading ? 'Downloading...' : 'Download Submission File'}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MLAnalysisPage;