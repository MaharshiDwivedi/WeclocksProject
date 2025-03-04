import React from 'react';
import { PulseLoader } from 'react-spinners';

const Loader = () => {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // Ensure it's on top of everything
      }}>
        <PulseLoader color="#00008B"size={24} margin={7} /> {/* Pulse Loader with color and size */}
      </div>
    );
  };
  
export default Loader;