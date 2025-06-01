
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
  vx: number; // velocity x
  vy: number; // velocity y
  radius: number;
}

const FloatingBubbles: React.FC<FloatingBubblesProps> = ({ comments }) => {
  const [bubblePositions, setBubblePositions] = useState<BubblePosition[]>([]);
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  const generateBubblePositions = () => {
    const positions = comments.map((_, index) => {
      // Calculate age-based scale (newer comments are larger)
      const ageRatio = index / Math.max(comments.length - 1, 1);
      const scale = Math.max(0.6, 1 - ageRatio * 0.4);
      const radius = 60 * scale; // Base radius of 60px scaled
      
      return {
        x: Math.random() * (80 - 20) + 10, // 10% to 90% of screen width with margin
        y: Math.random() * (70 - 15) + 15, // 15% to 85% of screen height with margin
        scale,
        vx: (Math.random() - 0.5) * 0.2, // Random velocity between -0.1 and 0.1
        vy: (Math.random() - 0.5) * 0.2,
        radius
      };
    });
    setBubblePositions(positions);
  };

  const checkCollision = (bubble1: BubblePosition, bubble2: BubblePosition, containerWidth: number, containerHeight: number) => {
    const dx = (bubble1.x / 100 * containerWidth) - (bubble2.x / 100 * containerWidth);
    const dy = (bubble1.y / 100 * containerHeight) - (bubble2.y / 100 * containerHeight);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = bubble1.radius + bubble2.radius;
    
    return distance < minDistance;
  };

  const resolveCollision = (bubble1: BubblePosition, bubble2: BubblePosition, containerWidth: number, containerHeight: number) => {
    const dx = (bubble1.x / 100 * containerWidth) - (bubble2.x / 100 * containerWidth);
    const dy = (bubble1.y / 100 * containerHeight) - (bubble2.y / 100 * containerHeight);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return; // Prevent division by zero
    
    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Separate bubbles
    const overlap = (bubble1.radius + bubble2.radius) - distance;
    const separationX = (overlap * 0.5 * nx) / containerWidth * 100;
    const separationY = (overlap * 0.5 * ny) / containerHeight * 100;
    
    bubble1.x += separationX;
    bubble1.y += separationY;
    bubble2.x -= separationX;
    bubble2.y -= separationY;
    
    // Apply collision response
    const bounceStrength = 0.3;
    bubble1.vx += nx * bounceStrength;
    bubble1.vy += ny * bounceStrength;
    bubble2.vx -= nx * bounceStrength;
    bubble2.vy -= ny * bounceStrength;
  };

  const updatePhysics = () => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    setBubblePositions(prevPositions => {
      const newPositions = [...prevPositions];
      
      // Update positions and apply physics
      newPositions.forEach((bubble, index) => {
        // Update position
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;
        
        // Apply friction
        bubble.vx *= 0.98;
        bubble.vy *= 0.98;
        
        // Boundary collision
        const marginX = (bubble.radius / containerWidth) * 100;
        const marginY = (bubble.radius / containerHeight) * 100;
        
        if (bubble.x <= marginX || bubble.x >= 100 - marginX) {
          bubble.vx *= -0.7;
          bubble.x = Math.max(marginX, Math.min(100 - marginX, bubble.x));
        }
        
        if (bubble.y <= marginY || bubble.y >= 100 - marginY) {
          bubble.vy *= -0.7;
          bubble.y = Math.max(marginY, Math.min(100 - marginY, bubble.y));
        }
        
        // Check collisions with other bubbles
        for (let j = index + 1; j < newPositions.length; j++) {
          if (checkCollision(bubble, newPositions[j], containerWidth, containerHeight)) {
            resolveCollision(bubble, newPositions[j], containerWidth, containerHeight);
          }
        }
      });
      
      return newPositions;
    });
    
    animationFrameRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    generateBubblePositions();
  }, [comments]);

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
    // Add impulse to clicked bubble
    setBubblePositions(prev => {
      const newPositions = [...prev];
      if (newPositions[index]) {
        newPositions[index].vx += (Math.random() - 0.5) * 0.5;
        newPositions[index].vy += (Math.random() - 0.5) * 0.5;
      }
      return newPositions;
    });
  };

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
      {comments.map((comment, index) => {
        const position = bubblePositions[index];
        if (!position) return null;

        return (
          <BubbleComment
            key={comment.id}
            comment={comment}
            position={position}
            onClick={() => handleBubbleClick(index)}
            animationDelay={index * 0.1}
          />
        );
      })}
    </div>
  );
};

export default FloatingBubbles;
