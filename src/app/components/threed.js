"use client";
import React, { useRef, useEffect, useState } from 'react';
import { Zap, RotateCcw, Play, Pause, Trophy } from 'lucide-react';

export default function OrbitingCubeGame() {
  const mountRef = useRef(null);
  const gameStateRef = useRef({
    cubes: [],
    centralCube: null,
    camera: null,
    scene: null,
    renderer: null,
    mousePosition: { x: 0, y: 0 },
    isPlaying: true,
    score: 0,
    level: 1,
    speed: 1,
    clickedCubes: new Set(),
    particles: []
  });

  const [gameStats, setGameStats] = useState({
    score: 0,
    level: 1,
    isPlaying: true,
    clickStreak: 0
  });

  const [showLevelComplete, setShowLevelComplete] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Load Three.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      initializeGame();
    };
    document.head.appendChild(script);

    function initializeGame() {
      const THREE = window.THREE;
      
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);

      const camera = new THREE.PerspectiveCamera(
        75,
        mount.clientWidth / mount.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 8);
      
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mount.appendChild(renderer.domElement);

      gameStateRef.current.scene = scene;
      gameStateRef.current.camera = camera;
      gameStateRef.current.renderer = renderer;

      const ambientLight = new THREE.AmbientLight(0x4a0080, 0.4);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0x8a2be2, 1, 100);
      pointLight.position.set(0, 5, 5);
      pointLight.castShadow = true;
      scene.add(pointLight);

      const centralGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const centralMaterial = new THREE.MeshPhongMaterial({
        color: 0x8a2be2,
        emissive: 0x2a0040,
        shininess: 100,
        transparent: true,
        opacity: 0.9
      });
      const centralCube = new THREE.Mesh(centralGeometry, centralMaterial);
      centralCube.castShadow = true;
      scene.add(centralCube);
      gameStateRef.current.centralCube = centralCube;


      const updateGameStats = () => {
        setGameStats({
          score: gameStateRef.current.score,
          level: gameStateRef.current.level,
          isPlaying: gameStateRef.current.isPlaying,
          clickStreak: gameStateRef.current.clickedCubes.size
        });
      };

      const createOrbitingCubes = () => {
 
        gameStateRef.current.cubes.forEach(cube => {
          scene.remove(cube);
          cube.geometry.dispose();
          cube.material.dispose();
        });
        gameStateRef.current.cubes = [];

        const numCubes = Math.min(6 + gameStateRef.current.level, 12);
        
        for (let i = 0; i < numCubes; i++) {
          const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
          const hue = (i / numCubes) * 0.8;
          const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(hue, 0.8, 0.6),
            emissive: new THREE.Color().setHSL(hue, 0.8, 0.2),
            shininess: 50
          });
          
          const cube = new THREE.Mesh(geometry, material);
          cube.castShadow = true;

          const orbitRadius = 2.5 + (i % 3) * 0.8;
          const orbitSpeed = (0.008 + Math.random() * 0.012) * gameStateRef.current.speed;
          
          cube.userData = {
            orbitRadius,
            orbitSpeed,
            angle: (i / numCubes) * Math.PI * 2,
            bobSpeed: 0.02 + Math.random() * 0.02,
            bobOffset: Math.random() * Math.PI * 2,
            originalColor: material.color.clone(),
            originalEmissive: material.emissive.clone(),
            clicked: false,
            id: i
          };
          
          scene.add(cube);
          gameStateRef.current.cubes.push(cube);
        }
        
        // Update game stats to reflect new cube count
        updateGameStats();
      };

      createOrbitingCubes();

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const updateMousePosition = (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        gameStateRef.current.mousePosition = { x: mouse.x, y: mouse.y };
      };

      const handleClick = (event) => {
        if (!gameStateRef.current.isPlaying) return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(gameStateRef.current.cubes);

        if (intersects.length > 0) {
          const clickedCube = intersects[0].object;
          
          if (!clickedCube.userData.clicked) {
            clickedCube.userData.clicked = true;
            gameStateRef.current.clickedCubes.add(clickedCube.userData.id);

            clickedCube.material.color.setHex(0x00ff88);
            clickedCube.material.emissive.setHex(0x004422);

            createParticleExplosion(clickedCube.position);

            gameStateRef.current.score += 10 * gameStateRef.current.level;

            if (gameStateRef.current.clickedCubes.size === gameStateRef.current.cubes.length) {
              setTimeout(() => {
                levelUp();
              }, 500);
              setShowLevelComplete(true);
              setTimeout(() => setShowLevelComplete(false), 2000);
            }
            
            updateGameStats();
          }
        }
      };

      const createParticleExplosion = (position) => {
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
          const particleGeometry = new THREE.SphereGeometry(0.05, 6, 6);
          const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 1
          });

          const particle = new THREE.Mesh(particleGeometry, particleMaterial);
          particle.position.copy(position);
          
          const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3
          );
          
          particle.userData = {
            velocity: velocity,
            life: 1.0,
            decay: 0.03
          };
          
          scene.add(particle);
          gameStateRef.current.particles.push(particle);
        }
      };

      const levelUp = () => {
        gameStateRef.current.level += 1;
        gameStateRef.current.speed = Math.min(gameStateRef.current.speed + 0.2, 3);
        gameStateRef.current.clickedCubes.clear();

        gameStateRef.current.cubes.forEach(cube => {
          cube.userData.clicked = false;
          cube.material.color.copy(cube.userData.originalColor);
          cube.material.emissive.copy(cube.userData.originalEmissive);
          cube.userData.orbitSpeed = (0.008 + Math.random() * 0.012) * gameStateRef.current.speed;
        });

        if (gameStateRef.current.level % 2 === 0) {
          createOrbitingCubes();
        }
        
        updateGameStats();
      };

      let animationId;
      const animate = () => {
        const time = Date.now() * 0.001;

        if (gameStateRef.current.centralCube) {
          gameStateRef.current.centralCube.rotation.x += 0.008;
          gameStateRef.current.centralCube.rotation.y += 0.008;
          const scale = 1 + Math.sin(time * 2) * 0.08;
          gameStateRef.current.centralCube.scale.setScalar(scale);
        }

        if (gameStateRef.current.isPlaying) {
          gameStateRef.current.cubes.forEach((cube, index) => {
            const userData = cube.userData;
            userData.angle += userData.orbitSpeed;
            
            const x = Math.cos(userData.angle) * userData.orbitRadius;
            const z = Math.sin(userData.angle) * userData.orbitRadius;
            const y = Math.sin(time * userData.bobSpeed + userData.bobOffset) * 0.3;
            
            cube.position.set(x, y, z);

            cube.rotation.x += 0.015;
            cube.rotation.y += 0.015;

            const mouseInfluence = 0.2;
            cube.position.x += gameStateRef.current.mousePosition.x * mouseInfluence;
            cube.position.y += gameStateRef.current.mousePosition.y * mouseInfluence;

            if (!userData.clicked) {
              const pulse = 1 + Math.sin(time * 4 + index) * 0.1;
              cube.scale.setScalar(pulse);
            }
          });
        }

        gameStateRef.current.particles = gameStateRef.current.particles.filter(particle => {
          if (particle.userData) {
            particle.position.add(particle.userData.velocity);
            particle.userData.velocity.multiplyScalar(0.95);
            particle.userData.life -= particle.userData.decay;
            particle.material.opacity = particle.userData.life;
            
            if (particle.userData.life <= 0) {
              scene.remove(particle);
              particle.geometry.dispose();
              particle.material.dispose();
              return false;
            }
          }
          return true;
        });

        camera.position.x = Math.sin(time * 0.1) * 0.3;
        camera.position.y = Math.cos(time * 0.15) * 0.2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
      };

      renderer.domElement.addEventListener('mousemove', updateMousePosition);
      renderer.domElement.addEventListener('click', handleClick);

      const handleResize = () => {
        const mount = mountRef.current;
        if (!mount) return;

        const width = mount.clientWidth;
        const height = mount.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      animate();
      updateGameStats();

    
      gameStateRef.current.cleanup = () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        renderer.domElement.removeEventListener('mousemove', updateMousePosition);
        renderer.domElement.removeEventListener('click', handleClick);
        window.removeEventListener('resize', handleResize);
        
        if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }

        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        renderer.dispose();
      };

      gameStateRef.current.createOrbitingCubes = createOrbitingCubes;
      gameStateRef.current.updateGameStats = updateGameStats;
    }

    return () => {
      if (gameStateRef.current.cleanup) {
        gameStateRef.current.cleanup();
      }
      document.head.removeChild(script);
    };
  }, []);

  const togglePlay = () => {
    gameStateRef.current.isPlaying = !gameStateRef.current.isPlaying;
    setGameStats(prev => ({ ...prev, isPlaying: gameStateRef.current.isPlaying }));
  };

  const resetGame = () => {
    gameStateRef.current.score = 0;
    gameStateRef.current.level = 1;
    gameStateRef.current.speed = 1;
    gameStateRef.current.clickedCubes.clear();
    gameStateRef.current.isPlaying = true;

    if (gameStateRef.current.cubes.length > 0) {
      gameStateRef.current.cubes.forEach(cube => {
        cube.userData.clicked = false;
        cube.material.color.copy(cube.userData.originalColor);
        cube.material.emissive.copy(cube.userData.originalEmissive);
        cube.userData.orbitSpeed = 0.008 + Math.random() * 0.012;
        cube.scale.setScalar(1);
      });
    }

    if (gameStateRef.current.particles.length > 0) {
      gameStateRef.current.particles.forEach(particle => {
        if (gameStateRef.current.scene) {
          gameStateRef.current.scene.remove(particle);
        }
        particle.geometry.dispose();
        particle.material.dispose();
      });
      gameStateRef.current.particles = [];
    }
    
    setGameStats({
      score: 0,
      level: 1,
      isPlaying: true,
      clickStreak: 0
    });
    
    setShowLevelComplete(false);

    if (gameStateRef.current.createOrbitingCubes) {
      gameStateRef.current.createOrbitingCubes();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-black rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
      <div ref={mountRef} className="w-full h-full" />
      
      <div className="absolute inset-0 pointer-events-none">
  
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
          <div className="flex gap-3">
            <div className="bg-black/70 backdrop-blur-md rounded-xl px-4 py-2 border border-purple-400/40">
              <div className="text-purple-300 text-xs font-medium">SCORE</div>
              <div className="text-white font-bold text-xl">{gameStats.score.toLocaleString()}</div>
            </div>
            
            <div className="bg-black/70 backdrop-blur-md rounded-xl px-4 py-2 border border-pink-400/40">
              <div className="text-pink-300 text-xs font-medium">LEVEL</div>
              <div className="text-white font-bold text-xl">{gameStats.level}</div>
            </div>
            
            <div className="bg-black/70 backdrop-blur-md rounded-xl px-4 py-2 border border-blue-400/40">
              <div className="text-blue-300 text-xs font-medium">CLICKED</div>
              <div className="text-white font-bold text-xl">
                {gameStats.clickStreak}/{gameStateRef.current.cubes?.length || 0}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={togglePlay}
              className="bg-purple-600/80 hover:bg-purple-500 p-3 rounded-xl border border-purple-400/50 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              title={gameStats.isPlaying ? "Pause" : "Play"}
            >
              {gameStats.isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
            </button>
            
            <button
              onClick={resetGame}
              className="bg-pink-600/80 hover:bg-pink-500 p-3 rounded-xl border border-pink-400/50 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              title="Reset Game"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>


        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-xl px-6 py-3 border border-white/20">
          <div className="text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold">Click all orbiting cubes to advance!</span>
            </div>
            <div className="text-gray-300 text-sm">
              Mouse movement influences cube orbits • Speed increases each level
            </div>
          </div>
        </div>

 
        {showLevelComplete && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-6 rounded-2xl font-bold text-3xl border-2 border-white/40 shadow-2xl backdrop-blur-sm animate-pulse">
              <div className="flex items-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-300" />
                <div>
                  <div>Level Complete!</div>
                  <div className="text-lg font-normal text-purple-100">Level {gameStats.level} unlocked</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}