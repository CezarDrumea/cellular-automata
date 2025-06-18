/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';

const DEFAULT_TREE_PROB = 0.6;
const DEFAULT_GROW_PROB = 0.01;
const DEFAULT_LIGHTNING_PROB = 0.0001;
const CELL_SIZE = 8;

const colorMap = {
  empty: '#eee',
  tree: 'green',
  burning: 'red',
};

const initForest = (r, c) =>
  Array.from({ length: r }, () =>
    Array.from({ length: c }, () =>
      Math.random() < DEFAULT_TREE_PROB ? 'tree' : 'empty'
    )
  );

const FireSpread = () => {
  const [rows, setRows] = useState(50);
  const [cols, setCols] = useState(50);
  const [speed, setSpeed] = useState(100);
  const [running, setRunning] = useState(false);

  const forestRef = useRef(initForest(rows, cols));
  const canvasRef = useRef(null);

  useEffect(() => {
    forestRef.current = initForest(rows, cols);

    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.width = cols * CELL_SIZE;
    canvas.height = rows * CELL_SIZE;

    drawForest();
  }, [rows, cols]);

  const drawForest = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const width = cols * CELL_SIZE;
    const height = rows * CELL_SIZE;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        ctx.fillStyle = colorMap[forestRef.current[i][j]];
        ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    ctx.strokeRect(0, 0, width, height);
  };

  const step = () => {
    const g = forestRef.current;
    const next = g.map((row) => [...row]);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = g[i][j];
        if (cell === 'burning') {
          next[i][j] = 'empty';
        } else if (cell === 'tree') {
          const neighbors = [
            [i - 1, j],
            [i + 1, j],
            [i, j - 1],
            [i, j + 1],
          ];

          const burningNeighbor = neighbors.some(
            ([x, y]) =>
              x >= 0 && x < rows && y >= 0 && y < cols && g[x][y] === 'burning'
          );

          if (burningNeighbor) next[i][j] = 'burning';
          else if (Math.random() < DEFAULT_LIGHTNING_PROB)
            next[i][j] = 'burning';
        } else if (Math.random() < DEFAULT_GROW_PROB) next[i][j] = 'tree';
      }
    }

    forestRef.current = next;

    drawForest();
  };

  useEffect(() => {
    if (!running) return;

    if (!forestRef.current.flat().some((c) => c === 'burning')) {
      const g = forestRef.current.map((row) => [...row]);
      let r, c;
      do {
        r = Math.floor(Math.random() * rows);
        c = Math.floor(Math.random() * cols);
      } while (g[r][c] !== 'tree');

      g[r][c] = 'burning';

      forestRef.current = g;

      drawForest();
    }
  }, [running, rows, cols]);

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
      <h2>Model Fire Spread</h2>
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
            forestRef.current = initForest(rows, cols);

            setRunning(false);
            drawForest();
          }}
        >
          Resetează
        </button>
      </div>
    </div>
  );
};

export default FireSpread;
