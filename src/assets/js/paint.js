import { getSocket } from "./sockets";

const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");
const controls = document.getElementById("jsControls");
const colors = document.querySelectorAll(".jsColor");
const range = document.getElementById("jsRange");
const mode = document.getElementById("jsMode");
const save = document.getElementById("jsSave");

const INITIAL_COLOR = "#2c2c2c";
const CANVAS_SIZE = 500;

let painting = false;
let filling = false;

export const paintInit = () => {
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.strokeStyle = INITIAL_COLOR;
  ctx.fillStyle = INITIAL_COLOR;
  ctx.lineWidth = 2.5;
};

const stopPainting = () => {
  painting = false;
};

const startPainting = () => {
  painting = true;
};

const beginPath = (x, y) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
};

const strokePath = (x, y, color = null, line = null) => {
  const currentColor = ctx.strokeStyle;
  const currentline = ctx.lineWidth;
  if (color !== null) {
    ctx.strokeStyle = color;
  }
  if (line !== null) {
    ctx.lineWidth = line;
  }
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentline;
};

const onMouseMove = (e) => {
  const { offsetX: x, offsetY: y } = e;
  if (!painting) {
    beginPath(x, y);
    getSocket().emit(window.events.beginPath, { x, y });
  } else {
    strokePath(x, y);
    getSocket().emit(window.events.stroke, {
      x,
      y,
      color: ctx.strokeStyle,
      line: ctx.lineWidth,
    });
  }
};

const handleColorClick = (e) => {
  const {
    target: {
      style: { backgroundColor: color },
    },
  } = e;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
};

const handleRangeInput = (e) => {
  const {
    target: { value },
  } = e;
  ctx.lineWidth = value;
};

const handleModeClick = (e) => {
  const {
    target: { innerHTML },
  } = e;
  console.log(innerHTML);
  if (innerHTML === "Fill") {
    mode.innerHTML = "Paint";
    filling = true;
  } else {
    mode.innerHTML = "Fill";
    filling = false;
  }
};

const fill = (color = null) => {
  const currentColor = ctx.fillStyle;
  if (color !== null) {
    ctx.fillStyle = color;
  }
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.fillStyle = currentColor;
};

const handleCanvasClick = () => {
  if (filling === true) {
    fill();
    getSocket().emit(window.events.fill, { color: ctx.fillStyle });
  }
};

const handleCM = (e) => {
  e.preventDefault();
};

const handleSaveClick = () => {
  const image = canvas.toDataURL();
  const link = document.createElement("a");
  link.href = image;
  link.download = "image";
  link.click();
};

export const handleBeganPath = ({ x, y }) => {
  beginPath(x, y);
};

export const handleStrokedPath = ({ x, y, color, line }) => {
  strokePath(x, y, color, line);
};

export const handleFilled = ({ color }) => {
  fill(color);
};

export const disableCanvas = () => {
  canvas.removeEventListener("mousemove", onMouseMove);
  canvas.removeEventListener("mousedown", startPainting);
  canvas.removeEventListener("mouseup", stopPainting);
  canvas.removeEventListener("mouseleave", stopPainting);
  canvas.removeEventListener("click", handleCanvasClick);
};

export const enableCanvas = () => {
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", startPainting);
  canvas.addEventListener("mouseup", stopPainting);
  canvas.addEventListener("mouseleave", stopPainting);
  canvas.addEventListener("click", handleCanvasClick);
};

export const hideControls = () => {
  controls.style.visibility = "hidden";
};

export const showControls = () => {
  controls.style.visibility = "visible";
};

if (canvas) {
  paintInit();
  disableCanvas();
  hideControls();
  canvas.addEventListener("contextmenu", handleCM);
  colors.forEach((color) => color.addEventListener("click", handleColorClick));
  range.addEventListener("input", handleRangeInput);
  mode.addEventListener("click", handleModeClick);
  save.addEventListener("click", handleSaveClick);
}
