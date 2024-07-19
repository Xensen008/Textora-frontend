import React, { useState, useEffect } from 'react';
import logo from '../assets/Textora3.jpg';
import LoadingBar from 'react-top-loading-bar';

function Homelander({ onLoadingComplete }) {
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const intervalDuration = 100;

    const interval = setInterval(() => {
        setLoadingProgress((oldProgress) => {
            const newProgress = oldProgress + 2.5;
            if (newProgress >= 100) {
                clearInterval(interval);
                if (typeof onLoadingComplete === 'function') { // Check if onLoadingComplete is a function
                    onLoadingComplete();
                }
            }
            return newProgress;
        });
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center" style={{ backgroundColor: '#b7c0b3' }}>
      <LoadingBar
        color='#0a3822'
        progress={loadingProgress}
        onLoaderFinished={() => setLoadingProgress(0)}
        height={5} 
        className="w-full" 
      />
      <div className="text-center" style={{ marginTop: '-50px' }}>
        <img src={logo} alt="Textora Logo" width={300} className="mx-auto" /> 
        <p className="font-bold text-xl mt-4" style={{ color: '#b7c0b3' }}>Welcome To Textora</p> 
        {/* Maker Details */}
        <div className="text-sm mt-4" style={{ color: '#0a3822' }}>
          Made with ❤️ by Arnab JK | <a href="https://github.com/xensen008" className="underline" style={{ color: '#0a3822' }}>GitHub Repo</a>
        </div>
      </div>
    </div>
  );
}

export default Homelander;