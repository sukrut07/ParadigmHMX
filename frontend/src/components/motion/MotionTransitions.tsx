import React from 'react';

interface TransitionProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

export const FadeIn: React.FC<TransitionProps> = ({ children, className = '', delayMs = 0 }) => (
  <div
    style={{ animationDelay: `${delayMs}ms` }}
    className={`animate-fade-in ${className}`}
  >
    {children}
  </div>
);

export const SlideUp: React.FC<TransitionProps> = ({ children, className = '', delayMs = 0 }) => (
  <div
    style={{ animationDelay: `${delayMs}ms` }}
    className={`animate-slide-up ${className}`}
  >
    {children}
  </div>
);

export const ScaleIn: React.FC<TransitionProps> = ({ children, className = '', delayMs = 0 }) => (
  <div
    style={{ animationDelay: `${delayMs}ms` }}
    className={`animate-scale-in ${className}`}
  >
    {children}
  </div>
);

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerMs = 60,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <div
            style={{
              animationDelay: `${index * staggerMs}ms`,
              animationFillMode: 'both',
            }}
            className="animate-slide-up"
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};
