import React from 'react';

interface MobileScreenContainerProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  gap?: number;
  className?: string;
  wrap?: boolean;
}

const MobileScreenContainer: React.FC<MobileScreenContainerProps> = ({ 
  children, 
  direction = 'row',
  gap = 16,
  className = '',
  wrap = true
}) => {
  return (
    <div 
      className={`mobile-screen-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: direction,
        gap: `${gap}px`,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '10px'
      }}
    >
      {children}
    </div>
  );
};

export default MobileScreenContainer; 