import "./App.css";
import Model from "./model/Model.js";
import canvasTool from "./libs/canvas.js";
import { useState, useRef, useEffect } from "react";

let CanvasTool = undefined;
function App() {
  const [message, setMessage] = useState("No Message");
  const [count, setCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const canvasRef = useRef(null); // need to be able to refer to Canvas


  const listener = (event) => {
    if (event.type === "gameOver") {
      setGameOver(event.data);
    }
    if (event.type === "moveCounter") {
      setCount(event.data);
    }
    if (event.type === "message") {
      setMessage(event.data);
    }
  };

  const loadConfiguration = (index) => {
    CanvasTool.loadModel(new Model(index), String(index));
    CanvasTool.redraw();
  };

  const handleRotate = (type) => {
    if (gameOver) {
      return;
    }
    CanvasTool.rotate(type);
  };

  // identify WHAT STATE you monitor
  useEffect(() => {
    CanvasTool = new canvasTool(canvasRef.current, listener);
    loadConfiguration(0);
    return () => {
      CanvasTool.destroy();
      CanvasTool = undefined
    };
  }, []);

  return (
    <div className="App ma-md">
      <div className="flex justify-between mb-md header">
        <button className="reset_button" onClick={() => CanvasTool.reset()}>
          Reset
        </button>
      </div>

      <div className="flex justify-between  pa-md">
        <div className={gameOver ? "canvas-container disabled" : "canvas-container"}>
          <canvas id="canvas" ref={canvasRef} width="400" height="400" />
        </div>

        <div className="operation">
          <div className="flex justify-around items-center">
            <div className="custom-button" onClick={() => loadConfiguration(0)}>
              1
            </div>
            <div className="custom-button" onClick={() => loadConfiguration(1)}>
              2
            </div>
            <div className="custom-button" onClick={() => loadConfiguration(2)}>
              3
            </div>
          </div>
          <div className="text-center text-red">Choose A Configuration</div>
          <div className={gameOver ? "custom-button disabled" : "custom-button"} onClick={() => handleRotate("clockwise")}>
            Clockwise
          </div>
          <div className={gameOver ? "custom-button disabled" : "custom-button"} onClick={() => handleRotate("counterClockwise")}>
            Counter-Clockwise
          </div>
          <div className="text-center border-slate-1 pa-md">(Move Counter here): {count}</div>
        </div>
      </div>

      <div className="text-red text-center pa-md">{message}</div>
    </div>
  );
}

export default App;
