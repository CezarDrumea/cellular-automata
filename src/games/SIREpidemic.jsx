/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';

const DEFAULT_BETA = 0.3;
const DEFAULT_GAMMA = 0.05;
const CELL_SIZE = 8;

const colorMap = {
  S: '#87CEEB',
  I: '#FF4500',
  R: '#228B22',
};

const initSIR = (rows, cols) => {
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 'S')
  );

  const i = Math.floor(Math.random() * rows);
  const j = Math.floor(Math.random() * cols);

  grid[i][j] = 'I';

  return grid;
};

const SIREpidemic = () => {
  const [rows, setRows] = useState(50);
  const [cols, setCols] = useState(50);
  const [speed, setSpeed] = useState(100);
  const [running, setRunning] = useState(false);

  const gridRef = useRef(initSIR(rows, cols));
  const canvasRef = useRef(null);

  useEffect(() => {
    gridRef.current = initSIR(rows, cols);

    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.width = cols * CELL_SIZE;
    canvas.height = rows * CELL_SIZE;

    drawGrid();
  }, [rows, cols]);

  const drawGrid = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const width = cols * CELL_SIZE;
    const height = rows * CELL_SIZE;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        ctx.fillStyle = colorMap[gridRef.current[i][j]];
        ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    ctx.strokeRect(0, 0, width, height);
  };

  const step = () => {
    const g = gridRef.current;
    const next = g.map((row) => [...row]);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const state = g[i][j];
        if (state === 'S') {
          const neighbors = [
            [i - 1, j],
            [i + 1, j],
            [i, j - 1],
            [i, j + 1],
          ];

          const infectedNeighbor = neighbors.some(
            ([x, y]) =>
              x >= 0 && x < rows && y >= 0 && y < cols && g[x][y] === 'I'
          );

          if (infectedNeighbor && Math.random() < DEFAULT_BETA) {
            next[i][j] = 'I';
          }
        } else if (state === 'I') {
          if (Math.random() < DEFAULT_GAMMA) {
            next[i][j] = 'R';
          }
        }
      }
    }

    gridRef.current = next;

    drawGrid();
  };

  useEffect(() => {
    if (!running) return;

    let animationId;
    let lastTime = performance.now();

    const loop = (time) => {
      if (!running) return;

      if (time - lastTime >= speed) {
        step();
        lastTime = time;
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [running, speed, rows, cols]);

  return (
    <div>
      <h2>Model SIR Epidemic</h2>
      <div className='controls'>
        <label>
          Rânduri:
          <input
            type='number'
            value={rows}
            min={10}
            max={200}
            onChange={(e) => setRows(parseInt(e.target.value, 10) || 10)}
          />
        </label>
        <label>
          Coloane:
          <input
            type='number'
            value={cols}
            min={10}
            max={200}
            onChange={(e) => setCols(parseInt(e.target.value, 10) || 10)}
          />
        </label>
        <label>
          Viteză (ms):
          <input
            type='number'
            value={speed}
            min={10}
            max={1000}
            step={10}
            onChange={(e) => setSpeed(parseInt(e.target.value, 10) || 100)}
          />
        </label>
      </div>

      <canvas ref={canvasRef} style={{ border: '1px solid #000' }} />

      <div>
        <button onClick={() => setRunning((r) => !r)}>
          {running ? 'Pauză' : 'Începe'}
        </button>
        <button
          onClick={() => {
            gridRef.current = initSIR(rows, cols);

            setRunning(false);
            drawGrid();
          }}
        >
          Resetează
        </button>
      </div>
    </div>
  );
};

export default SIREpidemic;
