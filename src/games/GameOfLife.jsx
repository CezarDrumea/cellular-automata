/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';

const createGrid = (r, c) =>
  Array.from({ length: r }, () => Array(c).fill(false));

const CELL_SIZE = 10;

const GameOfLife = () => {
  const [rows, setRows] = useState(50);
  const [cols, setCols] = useState(50);
  const [speed, setSpeed] = useState(100);
  const [generation, setGeneration] = useState(0);
  const [running, setRunning] = useState(false);

  const gridRef = useRef(createGrid(rows, cols));
  const canvasRef = useRef(null);

  useEffect(() => {
    gridRef.current = createGrid(rows, cols);

    setGeneration(0);

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
        ctx.fillStyle = gridRef.current[i][j] ? '#000' : '#fff';
        ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    ctx.beginPath();

    for (let x = 0; x <= cols; x++) {
      const xp = x * CELL_SIZE + 0.5;
      ctx.moveTo(xp, 0);
      ctx.lineTo(xp, height);
    }

    for (let y = 0; y <= rows; y++) {
      const yp = y * CELL_SIZE + 0.5;
      ctx.moveTo(0, yp);
      ctx.lineTo(width, yp);
    }

    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    ctx.strokeRect(0, 0, width, height);
  };

  const getCanvasCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    return [y, x];
  };

  const toggleCell = (r, c) => {
    const copy = gridRef.current.map((row) => [...row]);
    copy[r][c] = !copy[r][c];
    gridRef.current = copy;
    drawGrid();
  };

  const step = () => {
    const g = gridRef.current;
    const next = createGrid(rows, cols);
    let changed = false;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let count = 0;
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            if (di || dj) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && g[ni][nj])
                count++;
            }
          }
        }
        const alive = count === 3 || (g[i][j] && count === 2);
        next[i][j] = alive;
        if (alive !== g[i][j]) changed = true;
      }
    }

    if (changed) {
      gridRef.current = next;

      setGeneration((gen) => gen + 1);
      drawGrid();
    }
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
      <h2>Game of Life</h2>
      <div className='controls'>
        <label>
          Rânduri:
          <input
            type='number'
            value={rows}
            min={10}
            max={200}
            onChange={(e) => setRows(parseInt(e.target.value) || 10)}
          />
        </label>
        <label>
          Coloane:
          <input
            type='number'
            value={cols}
            min={10}
            max={200}
            onChange={(e) => setCols(parseInt(e.target.value) || 10)}
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
            onChange={(e) => setSpeed(parseInt(e.target.value) || 100)}
          />
        </label>
        <p>Generație: {generation}</p>
      </div>
      <canvas
        ref={canvasRef}
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          const [r, c] = getCanvasCoords(e);
          if (r >= 0 && r < rows && c >= 0 && c < cols) toggleCell(r, c);
        }}
      />

      <div>
        <button onClick={() => setRunning((r) => !r)}>
          {running ? 'Pauză' : 'Începe'}
        </button>
        <button
          onClick={() => {
            gridRef.current = createGrid(rows, cols);

            setRunning(false);
            setGeneration(0);
            drawGrid();
          }}
        >
          Resetează
        </button>
      </div>
    </div>
  );
};

export default GameOfLife;
