import { useState } from 'react';
import Menu from './Menu';
import GameOfLife from './games/GameOfLife';
import FireSpread from './games/FireSpread';
import SIREpidemic from './games/SIREpidemic';

export default function App() {
  const [mode, setMode] = useState(null);
  return (
    <div className='app-container'>
      {!mode ? (
        <Menu onSelect={setMode} />
      ) : (
        <>
          <button className='back-button' onClick={() => setMode(null)}>
            ← Înapoi
          </button>
          {mode === 'life' && <GameOfLife />}
          {mode === 'fire' && <FireSpread />}
          {mode === 'sir' && <SIREpidemic />}
        </>
      )}
    </div>
  );
}
