<<<<<<< HEAD
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
=======
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/navbar";
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job_id');

  useEffect(() => {
    if (!jobId) {
      setError('No job ID provided');
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/results/${jobId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch job results: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [jobId]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
  };

  const formatSummaryData = (data) => {
<<<<<<< HEAD
    if (!data) return [];

    const entries = [];
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          entries.push({
            category: key,
            metric: subKey,
            value: (typeof subValue === 'object' && subValue !== null)
              ? JSON.stringify(subValue)
              : (typeof subValue === 'number'
                ? (Number.isInteger(subValue) ? subValue.toLocaleString() : subValue.toFixed(4))
                : subValue)
          });
        });
      } else {
        entries.push({
          category: 'General',
          metric: key,
          value: (typeof value === 'object' && value !== null)
            ? JSON.stringify(value)
            : (typeof value === 'number'
              ? (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(4))
              : value)
        });
      }
    });

    return entries;
  };

  const summaryEntries = formatSummaryData(results?.summary);
=======
  if (!data) return [];

  const entries = [];
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        entries.push({
          category: key,
          metric: subKey,
          value: (typeof subValue === 'object' && subValue !== null)
            ? JSON.stringify(subValue)
            : (typeof subValue === 'number'
                ? (Number.isInteger(subValue) ? subValue.toLocaleString() : subValue.toFixed(4))
                : subValue)
        });
      });
    } else {
      entries.push({
        category: 'General',
        metric: key,
        value: (typeof value === 'object' && value !== null)
          ? JSON.stringify(value)
          : (typeof value === 'number'
              ? (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(4))
              : value)
      });
    }
  });

  return entries;
};
  const summaryEntries = formatSummaryData(summary);
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
  const groupedEntries = summaryEntries.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
<<<<<<< HEAD
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
=======
      <Navbar/>
      <div className="fixed inset-0 overflow-hidden pointer-events-none my-20">
>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

<<<<<<< HEAD
      <div className="relative z-10 p-4 sm:p-8 max-w-7xl mx-auto">
=======
      <div className="relative z-10 p-4 sm:p-8 max-w-7xl mx-auto my-20">

>>>>>>> 49926b03549b447a8bb11539b8fec0a1669c416c
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl px-6 py-3 mb-6 border border-purple-500/20">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <span className="text-purple-300 font-medium">Job ID: {jobId}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Analysis Results
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your data has been processed and analyzed. Here are the comprehensive insights and visualizations.
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 backdrop-blur-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold">Error Loading Results</h3>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📈</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Data Visualization</h2>
              </div>

              <div className="relative">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-800/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      <p className="text-gray-400">Loading visualization...</p>
                    </div>
                  </div>
                )}

                {results?.image_url ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: imageLoading ? 0 : 1, scale: imageLoading ? 0.9 : 1 }}
                    transition={{ duration: 0.5 }}
                    src={`http://localhost:5000/static/${jobId}_histogram.png`}
                    alt="Data Histogram"
                    className="w-full rounded-xl shadow-2xl border border-gray-700/50"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                ) : !error && (
                  <div className="aspect-video bg-gray-800/60 rounded-xl flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      <p className="text-gray-400">Loading visualization...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📋</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Summary Statistics</h2>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="text-gray-400">Loading...</div>
                  ))}
                </div>
              ) : results?.summary ? (
                <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar">
                  {Object.entries(groupedEntries).map(([category, entries], categoryIndex) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
                      className="space-y-3"
                    >
                      <h3 className="text-lg font-semibold text-purple-300 border-b border-purple-500/20 pb-2">
                        {category}
                      </h3>
                      <div className="grid gap-3">
                        {entries.map((entry, index) => (
                          <motion.div
                            key={`${entry.metric}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: (categoryIndex * 0.1) + (index * 0.05) }}
                            className="group bg-gray-700/30 hover:bg-gray-300 rounded-xl p-4 transition-all duration-200 border border-gray-600/30 hover:border-purple-500/30"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">
                                {entry.metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <span className="text-purple-600 font-semibold bg-purple-200/10 px-4 py-2 rounded-lg group-hover:bg-purple-200/20 transition-colors duration-300">
                                {entry.value}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : !error && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-gray-400">Loading statistics...</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-6 lg:col-span-2"
          >
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">💡</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Key Insights</h2>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-700/50 rounded-lg mb-2" />
                      <div className="h-3 bg-gray-600/50 rounded-lg w-3/4" />
                    </div>
                  ))}
                </div>
              ) : results?.insights ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Summary</h3>
                    <p className="text-gray-300">{results.insights.summary}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Key Columns</h3>
                    <ul className="list-disc pl-6 text-gray-300">
                      {results.insights.key_columns.map((col, index) => (
                        <li key={index}>{col}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Correlation Insights</h3>
                    <ul className="list-disc pl-6 text-gray-300">
                      {results.insights.correlation_insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Recommendations</h3>
                    <ul className="list-disc pl-6 text-gray-300">
                      {results.insights.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : !error && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-gray-400">Loading insights...</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {results?.summary && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8"
          >
            <details className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
              <summary className="p-6 cursor-pointer hover:bg-gray-700/30 transition-colors duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">🔍</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Raw Data (JSON)</h2>
                </div>
              </summary>
              <div className="px-6 pb-6">
                <pre className="bg-gray-900/60 text-sm p-4 rounded-xl overflow-x-auto border border-gray-600/30 text-gray-300 leading-relaxed">
                  {JSON.stringify(results.summary, null, 2)}
                </pre>
              </div>
            </details>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => window.history.back()}
            className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 group-hover:from-gray-500 group-hover:to-gray-600 transition-all duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Upload</span>
            </span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:from-purple-500 group-hover:to-blue-500 transition-all duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300 scale-75 group-hover:scale-100" />
            <span className="relative z-10 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Results</span>
            </span>
          </button>

          {results && (
  <button
    onClick={() => window.open(`http://localhost:5000/report/${jobId}`, '_blank')}
    className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 group-hover:from-green-500 group-hover:to-teal-500 transition-all duration-300" />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300 scale-75 group-hover:scale-100" />
    <span className="relative z-10 flex items-center space-x-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <span>Download Report</span>
    </span>
  </button>
)}
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}