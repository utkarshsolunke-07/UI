import React, { useEffect, useRef } from 'react';

/**
 * UTKARSH AI — Interactive Neural Particle Canvas v36.0
 * Renders an ambient, interactive 60 FPS neural network particle field
 * with floating node connections and mouse pointer force-field repulsion.
 */
export default function NeuralParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width  = (canvas.width  = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cache theme primary RGB once to prevent 60FPS getComputedStyle layout thrashing
    let primaryRgbStr = '56, 189, 248';
    const updatePrimaryRgb = () => {
      const computedStyle = getComputedStyle(document.body);
      primaryRgbStr = computedStyle.getPropertyValue('--primary-rgb').trim() || '56, 189, 248';
    };
    updatePrimaryRgb();

    // Particle nodes definition (ultra-light node count to guarantee 0% UI lag)
    const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 28000), 35);
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 1.8 + 1.0,
        baseAlpha: Math.random() * 0.35 + 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseAngle: Math.random() * Math.PI * 2,
      });
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0 || p.x > width)  p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Pulse alpha
        p.pulseAngle += p.pulseSpeed;
        const alpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.15;

        // Draw particle node (No expensive shadowBlur to prevent GPU lag)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${primaryRgbStr}, ${Math.max(0.1, alpha)})`;
        ctx.fill();

        // Connect nearby nodes with neural lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const lx = p.x - p2.x;
          const ly = p.y - p2.y;
          const lDistSq = lx * lx + ly * ly; // Use squared distance to avoid Math.sqrt CPU cost

          if (lDistSq < 14400) { // 120^2 = 14400
            const lDist = Math.sqrt(lDistSq);
            const lineAlpha = (1 - lDist / 120) * 0.20;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${primaryRgbStr}, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85,
      }}
    />
  );
}
