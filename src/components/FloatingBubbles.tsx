import React, { useState, useEffect, useRef } from 'react';
import BubbleComment from './BubbleComment';
import type { Comment } from '../pages/Index';

interface FloatingBubblesProps {
  comments: Comment[];
}

interface BubblePosition {
  x: number;      // percentage x (0-100)
  y: number;      // percentage y (0-100)
  scale: number;
  vx: number;     // velocity x (in percentage per frame)
  vy: number;     // velocity y
  radius: number; // in px
}

const FloatingBubbles: React.FC<FloatingBubblesProps> = ({ comments }) => {
  const [bubblePositions, setBubblePositions] = useState<BubblePosition[]>([]);
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize bubble positions and velocities
  const generateBubblePositions = () => {
    const positions = comments.map((_, index) => {
      const ageRatio = index / Math.max(comments.length - 1, 1);
      const scale = Math.max(0.6, 1 - ageRatio * 0.4);
      const radius = 60 * scale;

      return {
        x: Math.random() * (80 - 20) + 10,  // random 10%-90%
        y: Math.random() * (70 - 15) + 15,  // random 15%-85%
        scale,
        vx: (Math.random() - 0.5) * 0.2,    // velocity between -0.1 and 0.1
        vy: (Math.random() - 0.5) * 0.2,
        radius,
      };
    });
    setBubblePositions(positions);
  };

  const checkCollision = (b1: BubblePosition, b2: BubblePosition, width: number, height: number) => {
    const dx = (b1.x / 100) * width - (b2.x / 100) * width;
    const dy = (b1.y / 100) * height - (b2.y / 100) * height;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < b1.radius + b2.radius;
  };

  const resolveCollision = (b1: BubblePosition, b2: BubblePosition, width: number, height: number) => {
    const dx = (b1.x / 100) * width - (b2.x / 100) * width;
    const dy = (b1.y / 100) * height - (b2.y / 100) * height;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;

    const overlap = (b1.radius + b2.radius) - dist;
    const separationX = (overlap * 0.5 * nx) / width * 100;
    const separationY = (overlap * 0.5 * ny) / height * 100;

    b1.x += separationX;
    b1.y += separationY;
    b2.x -= separationX;
    b2.y -= separationY;

    const bounceStrength = 0.3;
    b1.vx += nx * bounceStrength;
    b1.vy += ny * bounceStrength;
    b2.vx -= nx * bounceStrength;
    b2.vy -= ny * bounceStrength;
  };

  const updatePhysics = () => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    setBubblePositions(prev => {
      const next = [...prev];

      for (let i = 0; i < next.length; i++) {
        const b = next[i];

        // Update position by velocity
        b.x += b.vx;
        b.y += b.vy;

        // Bounce off container walls
        const marginX = (b.radius / width) * 100;
        const marginY = (b.radius / height) * 100;

        if (b.x < marginX || b.x > 100 - marginX) {
          b.vx *= -1;
          b.x = Math.max(marginX, Math.min(100 - marginX, b.x));
        }
        if (b.y < marginY || b.y > 100 - marginY) {
          b.vy *= -1;
          b.y = Math.max(marginY, Math.min(100 - marginY, b.y));
        }

        // Check collision with other bubbles
        for (let j = i + 1; j < next.length; j++) {
          if (checkCollision(b, next[j], width, height)) {
            resolveCollision(b, next[j], width, height);
          }
        }
      }

      return next;
    });

    animationFrameRef.current = requestAnimationFrame(updatePhysics);
  };

  // Initialize bubbles on comments change
  useEffect(() => {
    generateBubblePositions();
  }, [comments]);

  // Start animation when bubblePositions initialized
  useEffect(() => {
    if (bubblePositions.length > 0) {
      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [bubblePositions.length]);

  const handleBubbleClick = (index: number) => {
    setBubblePositions(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index].vx += (Math.random() - 0.5) * 0.5;
        next[index].vy += (Math.random() - 0.5) * 0.5;
      }
      return next;
    });
  };

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
      {comments.map((comment, index) => {
        const pos = bubblePositions[index];
        if (!pos) return null;
        return (
          <BubbleComment
            key={comment.id}
            comment={comment}
            position={pos}
            onClick={() => handleBubbleClick(index)}
            animationDelay={index * 0.1}
          />
        );
      })}
    </div>
  );
};

export default FloatingBubbles;
