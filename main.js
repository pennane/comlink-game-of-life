import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.mjs'

/** @type {HTMLCanvasElement}*/
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })

function update_canvas_size() {
  const [width, height] = [window.innerWidth, window.innerHeight]
  canvas.width = Math.floor(width / 2)
  canvas.height = Math.floor(height / 2)
}

const worker = new Worker('worker.js')
const { next_frame, init_worker } = Comlink.wrap(worker)

const target_fps = 60
const frame_time = 1000 / target_fps

let last_time = 0
async function animate(time) {
  if (time - last_time >= frame_time) {
    last_time = time
    ctx.putImageData(await next_frame(), 1, 1) // 1, 1 due to one px padding around the data
  }
  requestAnimationFrame(animate)
}

update_canvas_size()
init_worker(canvas.width, canvas.height).then(animate)