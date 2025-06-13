"use client";
import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, Upload, Settings, Zap, Download, FileText, Target } from 'lucide-react';
import Navbar from '../components/navbar';
import Link from 'next/link';

const FeaturesPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Navigate to ML Analysis",
      description: "Go to tools on navbar and select ML analysis to begin your journey",
      side: "left"
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Upload Your Dataset",
      description: "Upload your file and let our intelligent system analyze your data structure",
      side: "right"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Select Evaluation Metric",
      description: "Choose the perfect evaluation metric that aligns with your analysis goals",
      side: "left"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Wait for the Magic",
      description: "Our AI-powered engine processes your data with advanced machine learning algorithms",
      side: "right"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Upload Test Files",
      description: "Select your test.csv and submission.csv files for comprehensive analysis",
      side: "left"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Get Your Results",
      description: "Download your final submission file and complete code file with insights",
      side: "right"
    }
  ];

  const CurvedArrow = ({ direction, delay = 0 }) => (
    <div className="absolute left-1/2 transform -translate-x-1/2 w-32 h-32 z-10">
      <svg 
        viewBox="0 0 120 120" 
        className="w-full h-full"
        style={{ animation: `fadeInArrow 1s ease-in-out ${delay}s both` }}
      >
        <defs>
          <linearGradient id={`gradient-${direction}-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        
      
        <path
          d={direction === 'left' 
            ? "M60 10 Q20 30 30 60 Q40 90 60 110" 
            : "M60 10 Q100 30 90 60 Q80 90 60 110"
          }
          fill="none"
          stroke={`url(#gradient-${direction}-${delay})`}
          strokeWidth="3"
          strokeDasharray="8 6"
          strokeLinecap="round"
          style={{ 
            animation: `drawPath 2s ease-in-out infinite ${delay}s`,
            filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))'
          }}
        />
        
   
        <polygon
          points="55,105 60,115 65,105 60,108"
          fill={`url(#gradient-${direction}-${delay})`}
          style={{ 
            animation: `pulse 2s ease-in-out infinite ${delay}s`,
            filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.6))'
          }}
        />
        
 
        <circle 
          cx="30" 
          cy="40" 
          r="2" 
          fill="#60a5fa" 
          opacity="0.7"
          style={{ animation: `float 3s ease-in-out infinite ${delay + 0.5}s` }}
        />
        <circle 
          cx="90" 
          cy="80" 
          r="1.5" 
          fill="#a855f7" 
          opacity="0.6"
          style={{ animation: `float 3s ease-in-out infinite ${delay + 1}s` }}
        />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <Navbar />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

   
      <div className="relative z-10 px-6 py-20">
       
        <div className={`text-center mt-20 mb-20 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">ML Analysis Workflow</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-6">
            Simple. Powerful. Magical.
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform your data into insights with our streamlined ML analysis process
          </p>
        </div>

        <div className={`max-w-4xl mx-auto mb-20 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative bg-gray-900 rounded-2xl p-2">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl aspect-video flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
                <div className="text-center">
                  <div className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-full p-6 inline-flex items-center justify-center mb-4 cursor-pointer transition-all duration-300 hover:scale-110">
                    <Play className="w-8 h-8 text-blue-400 ml-1" />
                  </div>
                  <p className="text-gray-300 text-lg">Watch Demo Video</p>
                  <p className="text-gray-500 text-sm mt-2">https://demo-video-url.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="max-w-6xl mx-auto relative">
          {steps.map((step, index) => (
            <div key={index} className="relative mb-24 last:mb-0">
      
              <div className={`flex items-center ${step.side === 'right' ? 'flex-row-reverse' : ''} gap-12 lg:gap-20`}>
       
                <div className={`flex-1 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                     style={{ transitionDelay: `${800 + index * 200}ms` }}>
                  
                  <div className={`group cursor-pointer transition-all duration-500 ${activeStep === index ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}>
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-1000 ${
                        activeStep === index ? 'opacity-75' : ''
                      }`}></div>
                      
                      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-500">
                    
                        <div className="flex items-center gap-4 mb-6">
                          
                          <div className={`bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl inline-flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                            activeStep === index ? 'scale-110 shadow-lg shadow-purple-500/50' : ''
                          }`}>
                            <div className="text-white">
                              {step.icon}
                            </div>
                          </div>
                        </div>

                
                        <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                          activeStep === index ? 'text-blue-300' : 'text-white group-hover:text-blue-300'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

           
                <div className="flex-shrink-0 w-32 h-32 hidden lg:flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-2 border-blue-500/30 flex items-center justify-center backdrop-blur-sm transition-all duration-500 ${
                    activeStep === index ? 'scale-110 border-blue-400 shadow-lg shadow-blue-500/30' : ''
                  }`}>
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl transition-all duration-300 ${
                      activeStep === index ? 'scale-110' : ''
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                </div>
              </div>

 
              {index < steps.length - 1 && (
                <div className="relative h-32 my-8">
                  <CurvedArrow 
                    direction={step.side === 'left' ? 'right' : 'left'} 
                    delay={index * 0.3} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>

      
        <div className={`text-center mt-20 transform transition-all duration-1000 delay-1500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <button className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
            <span><Link href="/ml-analysis">Start Your Analysis</Link></span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 -z-10"></div>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes drawPath {
          0% { stroke-dashoffset: 0; }
          50% { stroke-dashoffset: -20px; }
          100% { stroke-dashoffset: -40px; }
        }
        
        @keyframes fadeInArrow {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        
        @keyframes tilt {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          75% { transform: rotate(-1deg); }
        }
        
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-tilt { animation: tilt 10s infinite linear; }
      `}</style>
    </div>
  );
};

export default FeaturesPage;