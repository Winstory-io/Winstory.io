import React from 'react';

const TipBox: React.FC = () => {
  return (
    <div className="absolute top-6 right-6 z-50 flex items-center space-x-2 bg-yellow-100/90 text-black px-3 py-2 rounded-xl shadow-lg">
      <img src="/tooltip.svg" alt="Help" style={{ width: 64, height: 64, marginRight: 8 }} />
    </div>
  );
};

export default TipBox; 