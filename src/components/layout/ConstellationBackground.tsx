'use client';

import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  glowing: boolean;
  glowFactor: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
}

export const ConstellationBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates tracking
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180,
      active: false
    };

    // Initialize stars (faint, twinkling background particles)
    const starCount = 80;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Initialize constellation nodes
    const nodeCount = 50;
    const nodes: Node[] = [];
    const maxDistance = 140;

    for (let i = 0; i < nodeCount; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      nodes.push({
        x: rx,
        y: ry,
        originX: rx,
        originY: ry,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1.2,
        glowing: Math.random() > 0.75,
        glowFactor: Math.random() * Math.PI
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      // Re-distribute stars and nodes if width resize is significant
      stars.forEach(star => {
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      });
      nodes.forEach(node => {
        node.x = Math.random() * width;
        node.y = Math.random() * height;
        node.originX = node.x;
        node.originY = node.y;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleResize);

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and animate space stars
      stars.forEach((star) => {
        star.phase += star.twinkleSpeed;
        const currentAlpha = star.alpha + Math.sin(star.phase) * 0.15;
        
        // Faint parallax shift when mouse is active
        let offsetX = 0;
        let offsetY = 0;
        if (mouse.active) {
          offsetX = (mouse.x - width / 2) * -0.015 * (star.size * 0.5);
          offsetY = (mouse.y - height / 2) * -0.015 * (star.size * 0.5);
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, Math.min(0.9, currentAlpha))})`;
        ctx.fillRect(star.x + offsetX, star.y + offsetY, star.size, star.size);
      });

      // Draw premium cursor radial glow flashlight aura overlay
      if (mouse.active) {
        const glowRad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius * 1.5
        );
        glowRad.addColorStop(0, 'rgba(99, 102, 241, 0.05)'); // Very soft indigo
        glowRad.addColorStop(0.5, 'rgba(139, 92, 246, 0.015)'); // Soft purple
        glowRad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = glowRad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update positions and physics of Constellation Nodes
      nodes.forEach((node) => {
        // Natural wandering movement
        node.x += node.vx;
        node.y += node.vy;

        // Mouse interaction: soft attraction / gravity
        if (mouse.active) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < mouse.radius) {
            // Calculate pull force (stronger pull when closer, but cap it)
            const force = (mouse.radius - dist) / mouse.radius;
            node.x += (dx / dist) * force * 0.9;
            node.y += (dy / dist) * force * 0.9;
          }
        }

        // Bounce bounds
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Animate glow factor
        node.glowFactor += 0.025;
      });

      // Draw edges (pathway links between nodes)
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.16;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }

        // Draw edge connections from nodes to mouse cursor
        if (mouse.active) {
          const dx = nodes[i].x - mouse.x;
          const dy = nodes[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.25;
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`; // Blue/Teal link to cursor
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes (landmarks)
      nodes.forEach((node) => {
        const glow = node.glowing ? Math.sin(node.glowFactor) * 0.35 + 0.65 : 0.35;
        
        ctx.shadowBlur = node.glowing ? 8 : 0;
        ctx.shadowColor = '#a78bfa';

        ctx.fillStyle = node.glowing 
          ? `rgba(167, 139, 250, ${glow})`
          : 'rgba(56, 189, 248, 0.45)';

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset shadows
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
