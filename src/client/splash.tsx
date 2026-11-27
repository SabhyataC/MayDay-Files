import './index.css';

import { requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Splash = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-4 px-6 bg-[#101a20] text-[#e9e1cf]">
      <p className="text-xs tracking-[0.3em] text-[#e9a33d]">MAYDAY FILES</p>
      <h1 className="text-2xl font-bold text-center">Every wreck has a story.</h1>
      <p className="text-center text-[#e9e1cf]/70">Every clue hides a lie.</p>
      <button
        className="px-6 h-11 rounded-full bg-[#e9a33d] text-[#101a20] font-semibold"
        onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
      >
        Tap to Start
      </button>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);