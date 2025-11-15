import React, { useState, useEffect } from 'react';

const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);

interface CookingModeProps {
  dishName: string;
  steps: string[];
  onClose: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ dishName, steps, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' && currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else if (event.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep, steps.length, onClose]);


  return (
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-50 flex flex-col p-4 md:p-8 animate-fade-in no-print">
      <header className="flex-shrink-0 flex items-center justify-between mb-4">
        <div>
            <h2 className="text-2xl font-bold text-orange-400">{dishName}</h2>
            <p className="text-gray-400">Step {currentStep + 1} of {steps.length}</p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" aria-label="Close cooking mode">
          <CloseIcon />
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <p className="text-3xl md:text-5xl font-semibold text-center text-gray-100 max-w-4xl leading-normal">
          {steps[currentStep]}
        </p>
      </main>

      <footer className="flex-shrink-0 flex items-center justify-center space-x-4">
        <button
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
          className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(prev => prev + 1)}
          disabled={currentStep === steps.length - 1}
          className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors"
        >
          Next
        </button>
      </footer>
    </div>
  );
};
