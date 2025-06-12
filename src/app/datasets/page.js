'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Eye, FileText, Calendar, Users, Tag, ChevronRight, Loader2, AlertCircle, CheckCircle2, Sparkles, Database, TrendingUp } from 'lucide-react';
import Navbar from '../components/navbar';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function KaggleDatasetSearch() {
  const [query, setQuery] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [searchStarted, setSearchStarted] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const searchDatasets = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setSearchStarted(true);

    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setDatasets(data.datasets);
        setSuccess(`Found ${data.datasets.length} datasets`);
      } else {
        setError(data.error || 'Failed to search datasets');
      }
    } catch (err) {
      setError('Failed to connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const downloadDataset = async (datasetRef) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/dataset/${datasetRef}/download`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${datasetRef.replace('/', '_')}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setSuccess('Dataset download started!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to download dataset');
      }
    } catch (err) {
      setError('Failed to download dataset');
    }
  };

  const previewDataset = async (datasetRef) => {
    setPreviewLoading(true);
    setPreviewData(null);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/dataset/${datasetRef}/preview?rows=5`);
      const data = await response.json();

      if (data.success) {
        setPreviewData(data.previews);
      } else {
        setError(data.error || 'Failed to preview dataset');
      }
    } catch (err) {
      setError('Failed to preview dataset');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchDatasets();
    }
  };

  // Floating particles animation
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full opacity-20 animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-blue-500/10 to-purple-500/10 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <FloatingParticles />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <Navbar/>
        {/* Header */}
        <div className="text-center mb-16 relative mt-20">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Database className="w-96 h-96 text-white" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-5 h-5 text-pink-400 animate-spin" />
              <span className="text-white/80 text-sm font-medium">AI-Powered Dataset Discovery</span>
              <Sparkles className="w-5 h-5 text-blue-400 animate-spin" style={{ animationDirection: 'reverse' }} />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-pink-200 to-blue-200 bg-clip-text text-transparent">
              Kaggle
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                Explorer
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto font-light leading-relaxed">
              Discover, preview, and download datasets from Kaggle's vast universe of data science resources with cutting-edge AI insights
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-12 relative">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl hover:shadow-pink-500/20 transition-all duration-500">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-300" />
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/50 w-6 h-6 z-10" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search for datasets (e.g., 'machine learning', 'covid-19', 'finance')"
                    className="w-full pl-16 pr-6 py-6 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl focus:border-pink-400/50 focus:ring-4 focus:ring-pink-500/20 text-white text-lg placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                  />
                </div>
              </div>
              
              <button
                onClick={searchDatasets}
                disabled={loading}
                className="px-12 py-6 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl hover:shadow-pink-500/30 transform hover:scale-105 hover:-translate-y-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-8 relative">
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-6 flex items-center gap-4 shadow-xl">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-lg">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-8 relative">
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 flex items-center gap-4 shadow-xl">
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
              <p className="text-green-200 text-lg">{success}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {datasets.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <TrendingUp className="w-8 h-8 text-pink-400" />
              <h2 className="text-3xl font-bold text-white">Search Results</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-pink-500/50 to-transparent" />
            </div>
            
            {datasets.map((dataset, index) => (
              <div 
                key={dataset.ref} 
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl hover:shadow-pink-500/20 transition-all duration-500 hover:border-pink-400/40">
                  <div className="p-8">
                    <div className="flex flex-col xl:flex-row xl:items-start gap-8">
                      <div className="flex-1 space-y-6">
                        {/* Title and subtitle */}
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-200 transition-colors duration-300">
                            {dataset.title}
                          </h3>
                          
                          {dataset.subtitle && (
                            <p className="text-lg text-pink-200/80 font-medium">
                              {dataset.subtitle}
                            </p>
                          )}
                        </div>

                        <p className="text-white/70 text-lg leading-relaxed line-clamp-3">
                          {dataset.description || 'No description available'}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 text-white/60">
                              <FileText className="w-5 h-5 text-pink-400" />
                              <div>
                                <div className="text-xs uppercase tracking-wide">Size</div>
                                <div className="text-sm font-semibold text-white">{formatFileSize(dataset.size)}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 text-white/60">
                              <Download className="w-5 h-5 text-blue-400" />
                              <div>
                                <div className="text-xs uppercase tracking-wide">Downloads</div>
                                <div className="text-sm font-semibold text-white">{dataset.downloadCount?.toLocaleString() || 0}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 text-white/60">
                              <Calendar className="w-5 h-5 text-purple-400" />
                              <div>
                                <div className="text-xs uppercase tracking-wide">Updated</div>
                                <div className="text-sm font-semibold text-white">{formatDate(dataset.lastUpdated)}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 text-white/60">
                              <Users className="w-5 h-5 text-green-400" />
                              <div>
                                <div className="text-xs uppercase tracking-wide">Votes</div>
                                <div className="text-sm font-semibold text-white">{dataset.voteCount || 0}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        {dataset.tags && dataset.tags.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {dataset.tags.slice(0, 5).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 text-white/90 rounded-full text-sm font-medium hover:from-pink-500/30 hover:to-blue-500/30 transition-all duration-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {dataset.tags.length > 5 && (
                              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 rounded-full text-sm">
                                +{dataset.tags.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-4 xl:w-64 xl:flex-shrink-0">
                        <button
                          onClick={() => previewDataset(dataset.ref)}
                          className="px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105 hover:shadow-lg"
                        >
                          <Eye className="w-5 h-5" />
                          Preview
                        </button>
                        
                        <button
                          onClick={() => downloadDataset(dataset.ref)}
                          className="px-6 py-4 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-pink-500/30 hover:scale-105"
                        >
                          <Download className="w-5 h-5" />
                          Download
                        </button>
                        
                        <a
                          href={dataset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-4 border-2 border-white/30 hover:border-white/50 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 hover:bg-white/10 hover:scale-105"
                        >
                          View on Kaggle
                          <ChevronRight className="w-5 h-5" />
                        </a>
                      </div>
                    </div>

                    {/* Preview Data */}
                    {previewData && previewData.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-white/20">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                          <Sparkles className="w-6 h-6 text-pink-400" />
                          Data Preview
                        </h4>
                        
                        {previewData.map((preview, previewIndex) => (
                          <div key={previewIndex} className="mb-8">
                            <h5 className="font-semibold text-pink-200 mb-4 text-lg">
                              {preview.file_name}
                              {preview.shape && (
                                <span className="text-sm text-white/60 ml-3 bg-white/10 px-3 py-1 rounded-full">
                                  {preview.shape[0]} rows × {preview.shape[1]} columns
                                </span>
                              )}
                            </h5>
                            
                            {preview.error ? (
                              <p className="text-red-400 bg-red-500/20 p-4 rounded-xl border border-red-400/30">{preview.error}</p>
                            ) : (
                              <div className="overflow-x-auto bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
                                <table className="min-w-full">
                                  <thead className="bg-white/10">
                                    <tr>
                                      {preview.columns?.map((column, colIndex) => (
                                        <th key={colIndex} className="px-6 py-4 text-left text-sm font-bold text-pink-200 border-b border-white/20">
                                          {column}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {preview.data?.map((row, rowIndex) => (
                                      <tr key={rowIndex} className="hover:bg-white/5 transition-colors duration-200">
                                        {preview.columns?.map((column, colIndex) => (
                                          <td key={colIndex} className="px-6 py-4 text-sm text-white/80 border-b border-white/10">
                                            {String(row[column] || '').substring(0, 100)}
                                            {String(row[column] || '').length > 100 && (
                                              <span className="text-pink-400">...</span>
                                            )}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {previewLoading && (
                      <div className="mt-8 pt-8 border-t border-white/20 flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-pink-400 mr-3" />
                        <span className="text-white/80 text-lg">Loading preview...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && datasets.length === 0 && !error && searchStarted && (
          <div className="text-center py-24">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-500/20 to-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20">
              <Search className="w-16 h-16 text-white/60" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No datasets found</h3>
            <p className="text-white/60 max-w-md mx-auto text-lg">
              Try adjusting your search terms or explore different keywords.
            </p>
          </div>
        )}

        {/* Initial Empty State */}
        {!loading && datasets.length === 0 && !error && !searchStarted && (
          <div className="text-center py-24">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-500/20 to-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20 animate-pulse">
              <Database className="w-16 h-16 text-white/60" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-6">Ready to Explore?</h3>
            <p className="text-white/70 max-w-2xl mx-auto text-xl leading-relaxed">
              Enter keywords above to discover datasets from Kaggle's vast collection of data science resources. 
              Unleash the power of data with AI-driven insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}