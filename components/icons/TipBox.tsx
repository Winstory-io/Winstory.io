import React from 'react';

const TipBox: React.FC = () => {
  return (
    <div className="absolute top-6 right-6 z-50 flex items-center space-x-2 bg-yellow-100/90 text-black px-3 py-2 rounded-xl shadow-lg">
      <span style={{ fontSize: 32, marginRight: 8 }}>💡</span>
    </div>
  );
};

export default TipBox; 