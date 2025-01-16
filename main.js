/** @type {HTMLCanvasElement}*/
const canvas = document.getElementById('canvas')

canvas.width = Math.floor(window.innerWidth / 2)
canvas.height = Math.floor(window.innerHeight / 2)

const offscreen_canvas = canvas.transferControlToOffscreen()

const initial_spawn_probability = 0.3

const worker = new Worker('worker.js')
worker.postMessage({ offscreen_canvas, initial_spawn_probability }, [offscreen_canvas])
