import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { InitResponse } from '../shared/api';
import { Scenes } from './derelict/Scenes';

const shell =
  'flex flex-col justify-center items-center min-h-screen px-6 bg-[#101a20] text-[#e9e1cf]';

export const App = () => {
  const [data, setData] = useState<InitResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/init')
      .then((r) => {
        if (!r.ok) throw new Error('bad response');
        return r.json() as Promise<InitResponse>;
      })
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <div className={shell}>Could not load today’s case.</div>;
  if (!data) return <div className={shell}>Loading case…</div>;

  return (
    <Scenes
      info={data.caseInfo}
      initialAreas={data.areasUsed}
      initialClues={data.clues}
    />
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);