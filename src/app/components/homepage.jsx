'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Zap, TrendingUp, BarChart3, PieChart, LineChart, Sparkles, CheckCircle, Star, ArrowRight, Play, Target, Award, Trophy, Gift, Database, Brain, Rocket, Shield } from 'lucide-react';
import OrbitingCubeGame from './threed';
import Navbar from './navbar';

const HomePage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrollY(window.scrollY);
    }, 100); // Update every 100ms
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

useEffect(() => {
    const handleScroll = throttle(() => {
      setScrollY(window.scrollY);
    }, 100); 
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function (...args) {
      if (!lastRan) {
        func.apply(this, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };

  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const particles = [];
  let animationFrameId;

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5; 
      this.vy = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.4 + 0.2;
      this.size = Math.random() * 1.5 + 1; 
      this.hue = Math.random() * 60 + 240;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      const dx = mousePosition.x - this.x;
      const dy = mousePosition.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 80) { 
        const force = (80 - distance) / 80;
        this.vx += (dx / distance) * force * 0.005; 
        this.vy += (dy / distance) * force * 0.005;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity})`; 
      ctx.fill();
    }
  }

  for (let i = 0; i < 40; i++) {
    particles.push(new Particle());
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        const animate = () => {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          particles.forEach((particle, i) => {
            particle.update();
            particle.draw();

            particles.slice(i + 1).forEach(otherParticle => {
              const dx = particle.x - otherParticle.x;
              const dy = particle.y - otherParticle.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 100) {
                const opacity = (100 - distance) / 100 * 0.08;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.strokeStyle = `rgba(147, 51, 234, ${opacity})`;
                ctx.lineWidth = 0.4;
                ctx.stroke();
              }
            });
          });

          animationFrameId = requestAnimationFrame(animate);
        };
        animate();
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(canvas);

  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', resizeCanvas);
    observer.disconnect();
  };
}, [mousePosition]);

  useEffect(() => {
  const handleMouseMove = throttle((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, 100);
  window.addEventListener('mousemove', handleMouseMove);
  return () => window.removeEventListener('mousemove', handleMouseMove);
}, []);
  const processFile = async (file) => {
    try {
      setUploadedFile(file);
      gainExperience(150);
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      const jobId = await uploadFileToBackend(file);
      await pollJobStatus(jobId);
    } catch (err) {
      console.error('File processing error:', err);
      setIsAnalyzing(false);
      alert(`Upload failed: ${err.message}. Please try again.`);
    }
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const uploadFileToBackend = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading file:', file.name);

      const res = await fetch('http://localhost:5000/run-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${res.status} ${res.statusText} - ${errorText}`);
      }

      const data = await res.json();
      console.log('Upload response:', data);

      if (!data.job_id) {
        throw new Error('No job ID returned from server');
      }

      return data.job_id;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          gainExperience(300);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  };

  const pollJobStatus = async (jobId) => {
    console.log(`Starting to poll job status for: ${jobId}`);
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    let attempts = 0;
    const maxAttempts = 150;

    const poll = async () => {
      try {
        console.log(`Polling attempt ${attempts + 1}/${maxAttempts} for job ${jobId}`);

        const response = await fetch(`http://localhost:5000/job-status/${jobId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Job not found. Please try uploading the file again.');
          }
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Job status:`, data);

        const progress = Math.min(Math.max(data.progress || 0, 0), 100);
        setAnalysisProgress(progress);

        if (data.status === 'completed') {
          console.log('Job completed successfully');
          setIsAnalyzing(false);
          gainExperience(300);

          window.location.href = `/results?job_id=${jobId}`;
          return;

        } else if (data.status === 'failed') {
          console.error('Job failed:', data.error);
          setIsAnalyzing(false);

          const errorMsg = data.error || 'Unknown error occurred during analysis';
          alert(`Analysis failed: ${errorMsg}\n\nPlease try uploading your file again.`);
          return;

        } else if (data.status === 'processing') {
          console.log(`Job processing... Progress: ${progress}%`);


        } else if (data.status === 'queued') {
          console.log('Job queued, waiting to start...');


        } else {
          console.warn('Unknown status:', data.status);

        }


        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          console.error('Polling timed out after', maxAttempts, 'attempts');
          setIsAnalyzing(false);
          alert('Analysis timed out. This might mean your file is very large or there was a server issue. Please try again with a smaller file or contact support.');
        }

      } catch (err) {
        console.error('Polling error:', err);
        attempts++;

        if (attempts < maxAttempts) {
          console.log(`Retrying in 3 seconds... (attempt ${attempts}/${maxAttempts})`);
          setTimeout(poll, 3000);
        } else {
          setIsAnalyzing(false);
          alert(`Error checking analysis status: ${err.message}\n\nPlease try uploading your file again.`);
        }
      }
    };


    poll();
  };


  const gainExperience = (exp) => {
    const newExp = experience + exp;
    const newLevel = Math.floor(newExp / 500) + 1;

    if (newLevel > userLevel) {
      setUserLevel(newLevel);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }

    setExperience(newExp);
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms automatically detect patterns and anomalies in your data",
      gradient: "from-violet-500 via-purple-500 to-purple-600"
    },
    {
      icon: Zap,
      title: "Lightning Processing",
      description: "Process millions of rows in seconds with our optimized distributed computing infrastructure",
      gradient: "from-blue-500 via-cyan-500 to-teal-500"
    },
    {
      icon: Target,
      title: "Precision Insights",
      description: "Get actionable recommendations with confidence scores and statistical significance",
      gradient: "from-pink-500 via-rose-500 to-red-500"
    },
    {
      icon: Rocket,
      title: "Auto Visualization",
      description: "Beautiful, interactive charts and dashboards generated automatically from your analysis",
      gradient: "from-amber-500 via-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Navbar />
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />


      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent pointer-events-none" />

      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transform origin-left scale-x-0 transition-transform duration-300"
          style={{ transform: `scaleX(${typeof window !== 'undefined' && document ? scrollY / (document.documentElement.scrollHeight - window.innerHeight) : 0})` }} />
      </div>

      <div className="fixed top-6 right-6 z-40 my-20">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
              {userLevel}
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Level {userLevel}</div>
              <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${(experience % 500) / 500 * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLevelUp && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-xl animate-bounce">
            Level Up! Level {userLevel}
          </div>
        </div>
      )}

      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 py-30">
        <div className="max-w-7xl mx-auto text-center relative z-10">

          <div className="mb-12 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl rounded-full" />
            <h1 className="relative text-6xl md:text-8xl lg:text-9xl font-black leading-none mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                Transform
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
                Data Into
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Decisions
              </span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto font-light leading-relaxed">
            Advanced AI-powered data analysis that turns your raw information into
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-medium"> actionable insights </span>
            within seconds
          </p>

          <div className="relative mb-16 max-w-4xl mx-auto">
            <div
              className={`relative group cursor-pointer transition-all duration-500 ${dragActive ? 'scale-105' : 'hover:scale-102'
                }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  document.getElementById('fileInput')?.click();
                }
              }}
            >
              <input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".csv,.xlsx,.json"
              />

              <div className="absolute inset-0 rounded-3xl p-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="h-full w-full rounded-3xl bg-black" />
              </div>

              <div className={`relative border-2 border-dashed rounded-3xl p-20 transition-all duration-500 ${dragActive
                ? 'border-purple-400 bg-purple-500/10 shadow-2xl shadow-purple-500/25'
                : 'border-gray-600 group-hover:border-purple-500/50 group-hover:bg-purple-500/5'
                }`}>

                <div className="text-center">
                  <div className="mb-8 relative">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center transition-all duration-500 ${dragActive ? 'scale-125 rotate-12' : 'group-hover:scale-110 group-hover:rotate-6'
                      }`}>
                      <Upload className="w-10 h-10 text-white" />
                    </div>

                    {dragActive && (
                      <div className="absolute inset-0 animate-ping">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-75" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-3xl font-bold mb-4 text-white">
                    {dragActive ? 'Perfect! Drop your file' : 'Drop your data file here'}
                  </h3>
                  <p className="text-gray-400 text-lg mb-6">
                    Supports CSV, Excel, JSON formats up to 100MB
                  </p>

                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full text-sm text-gray-300 border border-white/10">
                    <Shield className="w-4 h-4" />
                    Your data is processed securely and never stored
                  </div>
                </div>

                {uploadedFile && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-green-400 font-semibold text-lg">{uploadedFile.name}</p>
                        <p className="text-green-300/70 text-sm">Ready for analysis</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isAnalyzing && (
              <div className="mt-12 max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-purple-400 font-semibold text-lg">Processing your data</span>
                  <span className="text-white font-bold text-lg">{Math.round(analysisProgress)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full transition-all duration-300 ease-out relative"
                    style={{ width: `${analysisProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </div>
                </div>


              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-10 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
              <span className="relative z-10 flex items-center gap-3">
                Start Free Analysis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <button className="group relative border-2 border-purple-500/50 text-purple-400 hover:text-white font-bold py-4 px-10 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
              <span className="relative z-10 flex items-center gap-3">
                Watch Demo
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          <p className="text-gray-500 mt-8 text-sm">
            No credit card required • Process up to 10 files free • Cancel anytime
          </p>
        </div>
      </section>

      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Powered by Advanced AI
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Our intelligent platform combines machine learning, statistical analysis, and data visualization
              to deliver insights that drive real business value
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:border-white/20 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">

                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-gray-400 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-20 text-white">
            Trusted by Data Teams Worldwide
          </h2>

          <div className="grid md:grid-cols-4 gap-12">
            {[
              { number: "2.5M", label: "Files Analyzed", description: "Processed with 99.9% accuracy" },
              { number: "15x", label: "Faster Insights", description: "Compared to traditional methods" },
              { number: "500+", label: "Companies", description: "From startups to Fortune 500" },
              { number: "24/7", label: "AI Processing", description: "Always available, never sleeps" }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="mb-6">
                  <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-xl font-bold text-white mb-2">
                    {stat.label}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {stat.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent" />

        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-8">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Ready to Transform
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
              Your Data Story?
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-16 leading-relaxed">
            Join thousands of data professionals who have discovered the power of AI-driven analysis
          </p>

          <button className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold py-6 px-16 rounded-3xl text-2xl transition-all duration-300 transform hover:scale-110 overflow-hidden">
            <span className="relative z-10">Begin Your Data Journey</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          <div className="mt-12 flex items-center justify-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              No setup required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Take a Break
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              While your data processes, enjoy our interactive 3D cube catching game!
              Test your reflexes and see how many levels you can complete.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="h-[600px]">
              <OrbitingCubeGame />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;