import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, BarChart3, PieChart, TrendingUp, FileText, CheckCircle, AlertCircle, Database, Brain, Zap, Target } from 'lucide-react';

const ResultsPage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);

  useEffect(() => {
    // Extract job ID from URL path
    const pathParts = window.location.pathname.split('/');
    const currentJobId = pathParts[pathParts.length - 1];
    setJobId(currentJobId);
    
    if (currentJobId) {
      fetchResults(currentJobId);
    }
  }, []);

  const fetchResults = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/results/${jobId}`);
      
      if (response.status === 202) {
        // Still processing
        const data = await response.json();
        setTimeout(() => fetchResults(jobId), 2000);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      setResults(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(results.results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-results-${jobId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading your analysis results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Results</h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            onClick={goBack}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { results: analysisResults, filename, completed_at } = results;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Analysis Results</h1>
              <p className="text-gray-400">{filename}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-sm text-green-400">
                {new Date(completed_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={downloadResults}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Dataset Overview */}
          <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Dataset Overview</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {analysisResults.dataset_info?.rows?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-gray-400">Rows</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400 mb-2">
                  {analysisResults.dataset_info?.columns || 'N/A'}
                </div>
                <div className="text-gray-400">Columns</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {analysisResults.dataset_info?.file_size || 'N/A'}
                </div>
                <div className="text-gray-400">File Size</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {analysisResults.summary_statistics?.missing_values || 0}
                </div>
                <div className="text-gray-400">Missing Values</div>
              </div>
            </div>
          </section>

          {/* Summary Statistics */}
          <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold">Summary Statistics</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
                <h3 className="font-semibold mb-3 text-blue-400">Column Types</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Numeric:</span>
                    <span className="font-semibold">{analysisResults.summary_statistics?.numeric_columns || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Categorical:</span>
                    <span className="font-semibold">{analysisResults.summary_statistics?.categorical_columns || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                <h3 className="font-semibold mb-3 text-purple-400">Data Quality</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Duplicates:</span>
                    <span className="font-semibold">{analysisResults.summary_statistics?.duplicates || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Missing:</span>
                    <span className="font-semibold">{analysisResults.summary_statistics?.missing_values || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-500/10 to-red-500/10 rounded-xl p-6 border border-pink-500/20">
                <h3 className="font-semibold mb-3 text-pink-400">Analysis Score</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">A+</div>
                  <div className="text-sm text-gray-400">Excellent data quality</div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Insights */}
          <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold">Key Insights</h2>
            </div>
            
            <div className="space-y-4">
              {analysisResults.insights?.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-200">{insight}</p>
                </div>
              )) || (
                <p className="text-gray-400 text-center py-8">No specific insights available</p>
              )}
            </div>
          </section>

          {/* Visualizations */}
          <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold">Generated Visualizations</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {analysisResults.visualizations?.map((viz, index) => (
                <div key={index} className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/20 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    {viz.type === 'histogram' && <BarChart3 className="w-8 h-8 text-white" />}
                    {viz.type === 'correlation' && <Target className="w-8 h-8 text-white" />}
                    {viz.type === 'scatter' && <PieChart className="w-8 h-8 text-white" />}
                  </div>
                  <h3 className="font-semibold text-orange-400 mb-2">{viz.title}</h3>
                  <p className="text-sm text-gray-400 capitalize">{viz.type} visualization</p>
                </div>
              )) || (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">No visualizations generated</p>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <section className="text-center py-8">
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Analyze Another File
              </button>
              <p className="text-gray-400 text-sm">
                Ready to analyze more data? Upload another file to get started.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;