'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/navbar';

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
  const [step, setStep] = useState(1);

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
      setStep(2);
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
          setStep(3);
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
      setStep(4);
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
      setStep(5);
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

  const ProgressBar = ({ currentStep }) => (
    <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400"
        initial={{ width: '0%' }}
        animate={{ width: `${(currentStep / 5) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
    </div>
  );

  const StepIndicator = ({ currentStep }) => (
    <div className="flex justify-center items-center space-x-4 mb-8">
      {[1, 2, 3, 4, 5].map((stepNum) => (
        <motion.div
          key={stepNum}
          className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
            ${stepNum <= currentStep 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50' 
              : 'bg-slate-700 text-slate-400'}`}
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ 
            scale: stepNum === currentStep ? 1.1 : 1, 
            opacity: stepNum <= currentStep ? 1 : 0.6 
          }}
          transition={{ duration: 0.3 }}
        >
          {stepNum <= currentStep && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          )}
          <span className="relative z-10">{stepNum}</span>
          {stepNum === currentStep && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );

  const FloatingOrbs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-32 h-32 rounded-full bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  const GlowCard = ({ children, className = "" }) => (
    <motion.div
      className={`relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl" />
      <div className="absolute inset-px bg-slate-900/90 rounded-2xl" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );

  const AnimatedButton = ({ children, onClick, disabled, className = "", variant = "primary" }) => {
    const variants = {
      primary: "from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500",
      success: "from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:via-teal-500 hover:to-green-500",
      secondary: "from-slate-600 via-slate-700 to-slate-600 hover:from-slate-500 hover:via-slate-600 hover:to-slate-500"
    };

    return (
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`relative group w-full overflow-hidden rounded-xl px-6 py-4 font-semibold text-white transition-all duration-300 ${className}`}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        
        <div className={`absolute inset-0 bg-gradient-to-r ${variants[variant]} transition-all duration-300`} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: disabled ? "none" : [
              "0 0 20px rgba(59, 130, 246, 0.3)",
              "0 0 40px rgba(147, 51, 234, 0.4)",
              "0 0 20px rgba(59, 130, 246, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="relative z-10 flex items-center justify-center">
          {children}
        </span>
      </motion.button>
    );
  };

  const LoadingSpinner = () => (
    <div className="relative w-6 h-6 mr-3">
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-blue-500/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );

  const FileUploadIcon = () => (
    <svg className="w-12 h-12 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );

  const AnalyticsIcon = () => (
    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const DownloadIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      <Navbar/>
      <FloatingOrbs />
   
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="relative mt-30 z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full space-y-8"
        >
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 40px rgba(147, 51, 234, 0.4)",
                  "0 0 20px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnalyticsIcon />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              ML Analysis Studio
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Transform your data into intelligent predictions with our advanced machine learning pipeline
            </p>
          </motion.div>

          <ProgressBar currentStep={step} />
          <StepIndicator currentStep={step} />

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!recommendations && (
            <GlowCard>
              <motion.form
                onSubmit={handleTrainSubmit}
                className="space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Upload Training Data</h2>
                  <p className="text-slate-400">Start by uploading your dataset to begin the analysis</p>
                </div>

                <motion.div
                  className="relative group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <FileUploadIcon />
                    <p className="mb-2 text-lg font-semibold text-slate-300">
                      {trainFile ? trainFile.name : 'Click to upload training data'}
                    </p>
                    <p className="text-sm text-slate-500">CSV files only</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setTrainFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </motion.div>

                <div>
                  <label className="block text-lg font-semibold text-slate-300 mb-4">
                    Evaluation Metric
                  </label>
                  <motion.select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl py-4 px-6 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    whileFocus={{ scale: 1.02 }}
                  >
                    {metrics.map((m) => (
                      <option key={m} value={m}>{m.toUpperCase()}</option>
                    ))}
                  </motion.select>
                </div>

                <AnimatedButton
                  disabled={status === 'Uploading training data...'}
                >
                  {status === 'Uploading training data...' ? (
                    <>
                      <LoadingSpinner />
                      Analyzing Data...
                    </>
                  ) : (
                    'Start Analysis'
                  )}
                </AnimatedButton>
              </motion.form>
            </GlowCard>
          )}

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <GlowCard className="bg-slate-800/50">
                  <div className="flex items-center justify-center">
                    {(status === 'Generating submission file...' || status === 'Uploading training data...') && <LoadingSpinner />}
                    <span className="text-lg text-slate-300">{status}</span>
                  </div>
                </GlowCard>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {recommendations && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <GlowCard>
                  <div className="text-center mb-6">
                    <motion.div
                      className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl mb-4"
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(16, 185, 129, 0.3)",
                          "0 0 40px rgba(20, 184, 166, 0.4)",
                          "0 0 20px rgba(16, 185, 129, 0.3)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">Analysis Complete</h3>
                    <p className="text-slate-400">Here are your ML recommendations</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                      className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="text-sm font-semibold text-blue-400 mb-2">BEST MODEL</h4>
                      <p className="text-xl font-bold text-white">{recommendations.best_model}</p>
                    </motion.div>
                    
                    <motion.div
                      className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="text-sm font-semibold text-purple-400 mb-2">PREPROCESSING</h4>
                      <p className="text-sm text-slate-300">{recommendations.preprocessing.join(', ')}</p>
                    </motion.div>
                    
                    <motion.div
                      className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="text-sm font-semibold text-cyan-400 mb-2">PERFORMANCE ({metric.toUpperCase()})</h4>
                      <p className="text-xl font-bold text-white">{recommendations.performance.toFixed(4)}</p>
                    </motion.div>
                  </div>
                </GlowCard>

                <GlowCard>
                  <motion.form
                    onSubmit={handleSubmissionGenerate}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">Generate Submission</h3>
                      <p className="text-slate-400">Create your final submission file</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">Job ID</label>
                      <input
                        type="text"
                        value={manualJobId}
                        onChange={(e) => setManualJobId(e.target.value)}
                        placeholder="Enter Job ID (e.g., de355b4c-...)"
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl py-3 px-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        className="relative group cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300 relative overflow-hidden">
                          <svg className="w-8 h-8 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm font-medium text-slate-300">
                            {testFile ? testFile.name : 'Test Data'}
                          </p>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setTestFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        className="relative group cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300 relative overflow-hidden">
                          <svg className="w-8 h-8 text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm font-medium text-slate-300">
                            {submissionFile ? submissionFile.name : 'Sample Submission'}
                          </p>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setSubmissionFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </motion.div>
                    </div>

                    <AnimatedButton
                      disabled={status === 'Generating submission file...'}
                    >
                      {status === 'Generating submission file...' ? (
                        <>
                          <LoadingSpinner />
                          Generating Submission...
                        </>
                      ) : (
                        'Generate Submission File'
                      )}
                    </AnimatedButton>
                  </motion.form>
                </GlowCard>

                <AnimatePresence>
                  {submissionUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center"
                    >
                      <GlowCard className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 border-emerald-500/20">
                        <motion.div
                          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-6"
                          animate={{
                            boxShadow: [
                              "0 0 20px rgba(16, 185, 129, 0.4)",
                              "0 0 40px rgba(20, 184, 166, 0.6)",
                              "0 0 20px rgba(16, 185, 129, 0.4)"
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-4">Submission Ready!</h3>
                        <p className="text-slate-300 mb-6">Your submission file has been generated successfully</p>
                        
                        <AnimatedButton
                          onClick={handleDownload}
                          disabled={isDownloading}
                          variant="success"
                          className="max-w-xs mx-auto"
                        >
                          {isDownloading ? (
                            <>
                              <LoadingSpinner />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <DownloadIcon />
                              Download Submission
                            </>
                          )}
                        </AnimatedButton>
                      </GlowCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating action indicators */}
          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="fixed top-8 right-8 z-50"
              >
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-3 h-3 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-sm font-medium text-slate-300">Processing...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Achievement notifications */}
          <AnimatePresence>
            {recommendations && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.8 }}
                className="fixed bottom-8 right-8 z-50"
              >
                <div className="bg-gradient-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-2xl max-w-sm">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </motion.div>
                    <div>
                      <h4 className="text-white font-semibold">Achievement Unlocked!</h4>
                      <p className="text-emerald-100 text-sm">ML Analysis Completed</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Ambient light effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};

export default MLAnalysisPage;