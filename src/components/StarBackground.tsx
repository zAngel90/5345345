import React, { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
  blur: number;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const COLORS = [
  'rgba(255,255,255,0.6)',
  'rgba(255,255,255,0.4)',
  'rgba(200,200,255,0.5)',
  'rgba(160,140,255,0.4)',
];

const STAR_COUNT = 130;

export default function StarBackground() {
  const stars: Star[] = useMemo(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      y: randomBetween(0, 100),
      size: randomBetween(1.0, 2.8),
      opacity: randomBetween(0.3, 0.65),
      duration: randomBetween(3, 8),
      delay: randomBetween(0, 7),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      blur: randomBetween(0.3, 1.0),
    }));
  }, []);

  return (
    <>
      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: var(--op); }
          50% { opacity: calc(var(--op) * 0.1); }
        }
        .star-dot {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: star-twinkle var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
        }
      `}</style>

      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      >
        {stars.map((star) => (
          <span
            key={star.id}
            className="star-dot"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              filter: `blur(${star.blur}px)`,
              ['--op' as string]: star.opacity,
              ['--dur' as string]: `${star.duration}s`,
              ['--delay' as string]: `${star.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
