
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-12 text-orange-400">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-orange-500"></div>
      <p className="mt-4 text-lg font-semibold">Analyzing your delicious dish...</p>
    </div>
  );
};
