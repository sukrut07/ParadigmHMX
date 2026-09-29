import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
  threshold = 0.15,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    const current = domRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [threshold]);

  const getTransformStyle = () => {
    if (isVisible) return 'translate-x-0 translate-y-0 opacity-100 filter blur-0 scale-100';
    switch (direction) {
      case 'up':
        return 'translate-y-8 opacity-0 filter blur-[2px]';
      case 'down':
        return '-translate-y-8 opacity-0 filter blur-[2px]';
      case 'left':
        return 'translate-x-8 opacity-0 filter blur-[2px]';
      case 'right':
        return '-translate-x-8 opacity-0 filter blur-[2px]';
      case 'none':
      default:
        return 'opacity-0 scale-98';
    }
  };

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${getTransformStyle()} ${className}`}
    >
      {children}
    </div>
  );
};
