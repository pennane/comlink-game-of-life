/** @type {HTMLCanvasElement}*/
const canvas = document.getElementById('canvas')

canvas.width = Math.floor(window.innerWidth / 2)
canvas.height = Math.floor(window.innerHeight / 2)

const offscreen_canvas = canvas.transferControlToOffscreen();

const worker = new Worker('worker.js')
worker.postMessage({ canvas: offscreen_canvas }, [offscreen_canvas]);