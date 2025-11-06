import React, { useState, useEffect } from 'react';

interface LaunchPageProps {
  onLaunchComplete: () => void;
}

const CelebrationAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center animate-fade-in-content z-50">
      <div className="confetti-container">
        {Array.from({ length: 200 }).map((_, i) => (
          <div key={i} className={`confetti confetti-${i % 10}`} style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}></div>
        ))}
      </div>
      <h2 className="text-6xl md:text-8xl font-extrabold text-white z-10 tracking-tighter animate-scale-in-celebrate">
        Welcome to GCET Campus Hub!
      </h2>
      <p className="text-xl text-gray-400 mt-4 z-10 animate-scale-in-celebrate" style={{ animationDelay: '200ms' }}>
        Redirecting to homepage...
      </p>
    </div>
  );
};

const LaunchPage: React.FC<LaunchPageProps> = ({ onLaunchComplete }) => {
  const [step, setStep] = useState<'initial' | 'counting' | 'celebrating'>('initial');
  const [count, setCount] = useState(5);

  useEffect(() => {
    // FIX: The return type of setTimeout in a browser environment is `number`, not `NodeJS.Timeout`.
    let timer: NodeJS.Timeout;
    if (step === 'counting' && count > 0) {
      timer = setTimeout(() => setCount(prevCount => prevCount - 1), 1000);
    } else if (step === 'counting' && count === 0) {
      setStep('celebrating');
    }
    return () => clearTimeout(timer);
  }, [step, count]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'celebrating') {
      timer = setTimeout(() => {
        onLaunchComplete();
      }, 4000); // 4 seconds for celebration
    }
    return () => clearTimeout(timer);
  }, [step, onLaunchComplete]);

  const handleLaunch = () => {
    setStep('counting');
  };

  const renderContent = () => {
    switch (step) {
      case 'initial':
        return (
          <div className="text-center animate-fade-in-content">
            <button
              onClick={handleLaunch}
              className="px-12 py-6 bg-indigo-600 text-white font-bold text-2xl rounded-xl hover:bg-indigo-700 transition-colors transform hover:scale-105 shadow-lg animate-glow"
            >
              Launch Website
            </button>
          </div>
        );
      case 'counting':
        return (
          <div key={count} className="text-9xl font-extrabold text-white animate-ping-once">
            {count === 0 ? '🚀' : count}
          </div>
        );
      case 'celebrating':
        return <CelebrationAnimation />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-soft-light filter blur-2xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-soft-light filter blur-2xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
      {renderContent()}
    </div>
  );
};

export default LaunchPage;