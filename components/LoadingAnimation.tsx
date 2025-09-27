import React from 'react';

const LoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="absolute w-12 h-12 rounded-full opacity-0 animate-pulse"
            style={{
              animationName: 'scale',
              animationDuration: '3s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
              animationDelay: `${(index + 1) * 0.3}s`,
              boxShadow: '0px 0px 50px rgba(59, 130, 246, 0.5)',
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes scale {
          0% {
            transform: scale(2);
            opacity: 0;
            box-shadow: 0px 0px 50px rgba(59, 130, 246, 0.5);
          }
          50% {
            transform: scale(1) translate(0px, -5px);
            opacity: 1;
            box-shadow: 0px 8px 20px rgba(59, 130, 246, 0.5);
          }
          100% {
            transform: scale(0.1) translate(0px, 5px);
            opacity: 0;
            box-shadow: 0px 10px 20px rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;
