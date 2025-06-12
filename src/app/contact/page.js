'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Navbar from '../components/navbar';

export default function ContactPage() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clicks, setClicks] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const createParticle = (x, y) => {
    const colors = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B'];
    const newParticles = [];
    
    for (let i = 0; i < 7; i++) {
      newParticles.push({
        id: Date.now() + Math.random() + i,
        x: x + (Math.random() - 0.5) * 1000,
        y: y + (Math.random() - 0.5) * 1000,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1500);
  };

  const handleCardClick = (e, platform) => {
    e.preventDefault();
    setClicks(prev => prev + 1);
    const rect = e.currentTarget.getBoundingClientRect();
    createParticle(
      e.clientX - rect.left, 
      e.clientY - rect.top
    );
  };

  const InstagramIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="transition-all duration-300 group-hover:scale-110">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="2"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const TwitterIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="transition-all duration-300 group-hover:scale-110">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" 
            stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );

  const EmailIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="transition-all duration-300 group-hover:scale-110">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" 
            stroke="currentColor" strokeWidth="2" fill="none"/>
      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const contactMethods = [
    {
      name: 'Instagram',
      icon: <InstagramIcon />,
      href: 'https://instagram.com/anwitac.795',
      bgColor: 'from-purple-500/20 to-pink-500/20',
      hoverColor: 'group-hover:from-purple-500/30 group-hover:to-pink-500/30',
      textColor: 'text-purple-300',
      description: 'Follow for updates'
    },
    {
      name: 'Email',
      icon: <EmailIcon />,
      href: 'mailto:diyachakra.369@gmail.com',
      bgColor: 'from-blue-500/20 to-cyan-500/20',
      hoverColor: 'group-hover:from-blue-500/30 group-hover:to-cyan-500/30',
      textColor: 'text-blue-300',
      description: 'Let\'s collaborate'
    },
    {
      name: 'Twitter',
      icon: <TwitterIcon />,
      href: 'https://twitter.com/ThisisAnwita_C',
      bgColor: 'from-blue-400/20 to-blue-600/20',
      hoverColor: 'group-hover:from-blue-400/30 group-hover:to-blue-600/30',
      textColor: 'text-blue-400',
      description: 'Join the conversation'
    }
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`
      }}
    > <Navbar/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.1),transparent_50%)] opacity-40"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.08),transparent_50%)] opacity-60"></div>
      
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <div className="w-1 h-1 bg-blue-400/30 rounded-full"></div>
          </div>
        ))}
      </div>

      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none z-50 animate-bounce"
          style={{
            left: particle.x,
            top: particle.y,
            animationDuration: '1.5s'
          }}
        >
          <div 
            className="rounded-full animate-pulse" 
            style={{ 
              backgroundColor: particle.color,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
            }}
          ></div>
        </div>
      ))}

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <div className="inline-block mb-8">
            <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent animate-pulse">
              Let's Connect
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-4 animate-pulse"></div>
          </div>
          
          <p className="text-xl text-slate-300 mb-4 opacity-0 animate-[fadeIn_1s_ease-in-out_0.5s_forwards]">
            Ready to create something amazing together?
          </p>
          
          <div className="text-sm text-blue-300 opacity-0 animate-[fadeIn_1s_ease-in-out_1s_forwards]">
            Interactions: {clicks} • Keep clicking for particle explosions!
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {contactMethods.map((method, index) => (
            <Link
              key={method.name}
              href={method.href}
              className="group relative block transform transition-all duration-500 hover:scale-105 opacity-0 animate-[slideUp_0.8s_ease-in-out_forwards] cursor-pointer"
              style={{ animationDelay: `${index * 0.2 + 1.2}s` }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={(e) => handleCardClick(e, method.name)}
            >
              <div className={`
                relative p-8 rounded-3xl border border-slate-700/50 backdrop-blur-sm
                bg-gradient-to-br ${method.bgColor} ${method.hoverColor}
                transition-all duration-500 overflow-hidden
                hover:border-slate-600/70 hover:shadow-2xl
                ${hoveredCard === index ? 'shadow-2xl' : 'shadow-lg'}
              `}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 text-center">
                  <div className={`
                    inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6
                    bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm
                    ${method.textColor} border border-slate-600/30
                    transition-all duration-500 group-hover:scale-110 group-hover:rotate-12
                  `}>
                    {method.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors duration-300">
                    {method.name}
                  </h3>
                  
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                    {method.description}
                  </p>
                </div>

                <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-pink-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-20 opacity-0 animate-[fadeIn_1s_ease-in-out_2s_forwards]">
          <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-pink-500/10 border border-slate-700/50 backdrop-blur-sm">
            <p className="text-slate-300 text-sm">
              Or just say hello at <span className="text-blue-300 font-medium"><Link href="mailto:diyachakra.369@gmail.com">Our Mail</Link></span>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}