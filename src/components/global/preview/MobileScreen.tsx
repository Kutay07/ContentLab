import React from 'react';

interface MobileScreenProps {
  children?: React.ReactNode;
  className?: string;
  width?: number;
  height?: number;
}

const MobileScreen: React.FC<MobileScreenProps> = ({ 
  children, 
  className = '',
  width = 320,
  height = 640
}) => {
  return (
    <div 
      className={`mobile-screen ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#3b82f6', // Mavi arkaplan
        border: '2px solid #e5e7eb', // Açık gri border
        borderRadius: '24px', // Telefon benzeri radius
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        position: 'relative'
      }}
    >
      {/* İçerik alanı */}
      <div 
        style={{
          flex: 1,
          backgroundColor: '#dbeafe', // Açık mavi iç alan
          borderRadius: '16px',
          padding: '12px',
          overflow: 'auto'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MobileScreen; 