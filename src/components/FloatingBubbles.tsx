import React, { useState, useEffect, useRef } from 'react';
import BubbleComment from './BubbleComment';
import type { Comment } from '../pages/Index';

interface FloatingBubblesProps {
  comments: Comment[];
}

interface BubblePosition {
  x: number;
  y: number;
  scale: number;
  vx: number;
  vy: number;
  radius: number;
}

const FloatingBubbles: React.FC<FloatingBubblesProps> = ({ comments }) => {
  const [bubblePositions, setBubblePositions] = useState<BubblePosition[]>([]);
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Generate bubble positions and motion values
  const generateBubblePositions = (): BubblePosition[] => {
    return comments.map((_, index) => {
      const ageRatio = index / Math.max(comments.length - 1, 1);
      const scale = Math.max(0.6, 1 - ageRatio * 0.4);
      const radius = 60 * scale;

      return {
        x: Math.random() * (90 - 10) + 10,  // 10% - 90%
        y: Math.random() * (85 - 15) + 15,  // 15% - 85%
        scale,
        vx: (Math.random() - 0.5) * 0.5,    // increased for more noticeable motion
        vy: (Math.random() - 0.5) * 0.5,
        radius,
      };
    });
  };

  // 2. Collision detection
  const checkCollision = (
    b1: BubblePosition,
    b2: BubblePosition,
    width: number,
    height: number
  ) => {
    const dx = (b1.x - b2.x) / 100 * width;
    const dy = (b1.y - b2.y) / 100 * height;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < b1.radius + b2.radius;
  };

  const resolveCollision = (
    b1: BubblePosition,
    b2: BubblePosition,
    width: number,
    height: number
  ) => {
    const dx = (b1.x - b2.x) / 100 * width;
    const dy = (b1.y - b2.y) / 100 * height;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = b1.radius + b2.radius - dist;
    const sepX = (overlap * 0.5 * nx) / width * 100;
    const sepY = (overlap * 0.5 * ny) / height * 100;

    b1.x += sepX;
    b1.y += sepY;
    b2.x -= sepX;
    b2.y -= sepY;

    const bounce = 0.3;
    b1.vx += nx * bounce;
    b1.vy += ny * bounce;
    b2.vx -= nx * bounce;
    b2.vy -= ny * bounce;
  };

  // 3. Animate
  const updatePhysics = () => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    setBubblePositions((prev) => {
      const next = [...prev];
      for (let i = 0; i < next.length; i++) {
        const b = next[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.99;
        b.vy *= 0.99;

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

  // 4. Start animation
  useEffect(() => {
    const initialPositions = generateBubblePositions();
    setBubblePositions(initialPositions);

    // Delay animation by a frame to ensure DOM measures are correct
    setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    }, 0);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [comments]);

  // 5. Bubble click impulse
  const handleBubbleClick = (index: number) => {
    setBubblePositions((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].vx += (Math.random() - 0.5) * 1;
        updated[index].vy += (Math.random() - 0.5) * 1;
      }
      return updated;
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
