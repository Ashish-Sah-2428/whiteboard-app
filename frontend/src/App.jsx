import React, { useRef, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

const App = () => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
  const bgColor = '#ffffff'; // background color for eraser

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    socket.on('draw', ({ x0, y0, x1, y1, color, lineWidth }) => {
      drawLine(x0, y0, x1, y1, color, lineWidth, false);
    });
  }, []);

  const drawLine = (x0, y0, x1, y1, color, lineWidth, emit) => {
    const context = canvasRef.current.getContext('2d');
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();

    if (!emit) return;
    socket.emit('draw', { x0, y0, x1, y1, color, lineWidth });
  };

  const handleMouseDown = (e) => {
    setDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    canvasRef.current.lastX = offsetX;
    canvasRef.current.lastY = offsetY;
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const { offsetX, offsetY } = e.nativeEvent;

    const drawColor = tool === 'eraser' ? bgColor : color;

    drawLine(
      canvasRef.current.lastX,
      canvasRef.current.lastY,
      offsetX,
      offsetY,
      drawColor,
      lineWidth,
      true
    );

    canvasRef.current.lastX = offsetX;
    canvasRef.current.lastY = offsetY;
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const toggleTool = () => {
    setTool(tool === 'pen' ? 'eraser' : 'pen');
  };

  return (
    <div className="App">
      <div className="toolbar">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          disabled={tool === 'eraser'}
        />
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
        />
        <button onClick={toggleTool}>
          {tool === 'pen' ? 'Switch to Eraser' : 'Switch to Pen'}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="canvas"
      ></canvas>
    </div>
  );
};

export default App;
