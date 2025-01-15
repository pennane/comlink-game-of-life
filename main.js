/** @type {HTMLCanvasElement}*/
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })

canvas.width = Math.floor(window.innerWidth / 2)
canvas.height = Math.floor(window.innerHeight / 2)

const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height)

const worker = new Worker('worker.js')
const { next_frame, init_worker } = Comlink.wrap(worker)

function draw_frame(frame) {
  const frame_view = new Uint8ClampedArray(frame)
  const image_view = image_data.data

  for (let i = 0; i < frame_view.length; i++) {
    const red_i = i * 4
    const alpha_i = red_i + 3
    image_view[red_i] = frame_view[i]
    image_view[alpha_i] = 255
  }

  ctx.putImageData(image_data, 0, 0)
}

const target_fps = 60
const frame_time = 1000 / target_fps

let last_time = 0
async function animate(time) {
  if (time - last_time >= frame_time) {
    last_time = time
    draw_frame(await next_frame())
  }
  requestAnimationFrame(animate)
}


init_worker(canvas.width, canvas.height, 0.9).then(animate)
