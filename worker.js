// @ts-check
/** @type {HTMLCanvasElement}*/
let canvas
/** @type {CanvasRenderingContext2D} */
let ctx
/** @type {ImageData} */
let image_data
/** @type {Uint8ClampedArray<ArrayBufferLike>} */
let image_data_view
/** @type {number} */
let game_data_size
/** @type {number} */
let image_data_size
/** @type {Array<Array<number>>} */
let neighbor_game_indices
/** @type {Int8Array<ArrayBuffer>} */
let neighbor_delta


const ALIVE = 255
const DEAD = 0
const FULLY_OPAQUE = 255
const RGBA_LENGTH = 4
const GREEN_OFFSET = 1
const ALPHA_OFFSET = 3


function init_globals(c, p) {
  const _ctx = c.getContext('2d', { willReadFrequently: true })
  if (!_ctx) throw new Error("Failed to create 2d context")

  const w = c.width
  const h = c.height

  canvas = c
  ctx = _ctx

  image_data = ctx.getImageData(0, 0, w, h)
  image_data_view = image_data.data

  game_data_size = w * h
  image_data_size = image_data_view.length

  neighbor_game_indices = new Array(game_data_size)
  neighbor_delta = new Int8Array(game_data_size)

  // This is super memory intensive, but avoids the need for checking boundaries later per frame
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const game_i = (y * w) + x
      const cell_neighbor_indices = []
      for (let dx = -1; dx < 2; dx++) {
        for (let dy = -1; dy < 2; dy++) {
          if (dx === 0 && dy === 0) continue
          const ox = x + dx
          const oy = y + dy
          if (ox < 0 || ox >= w) continue
          if (oy < 0 || oy >= h) continue
          cell_neighbor_indices.push((oy * w) + ox)
        }
      }
      neighbor_game_indices[game_i] = cell_neighbor_indices
    }
  }

  for (let i_red = 0; i_red < image_data_size; i_red += RGBA_LENGTH) {
    const state = Math.random() > p ? ALIVE : DEAD
    const i_alpha = i_red + ALPHA_OFFSET
    image_data_view[i_red] = state
    image_data_view[i_alpha] = FULLY_OPAQUE
  }

  // Store alive cell neighbors to the green channel :D
  for (let i = 0; i < game_data_size; i++) {
    const i_green = i * RGBA_LENGTH + GREEN_OFFSET
    let neighbors = 0
    for (const i_neighbor of neighbor_game_indices[i]) {
      if (image_data_view[i_neighbor * RGBA_LENGTH]) neighbors += 1
    }
    image_data_view[i_green] = neighbors
  }
}

function next_frame() {
  neighbor_delta.fill(0)

  for (let i = 0; i < game_data_size; i++) {
    const i_red = i * RGBA_LENGTH
    const i_green = i_red + GREEN_OFFSET

    let alive_now = image_data_view[i_red]
    let neighbors = image_data_view[i_green]

    // Skip processing if the 3x3 grid around is dead - SPEED
    if (!alive_now && !neighbors) {
      continue
    }

    let alive_next = DEAD
    if (neighbors === 3) alive_next = ALIVE
    else if (neighbors === 2) alive_next = alive_now

    const state_delta = alive_next - alive_now

    if (!state_delta) continue

    const sign = Math.sign(state_delta)

    for (const j of neighbor_game_indices[i]) {
      neighbor_delta[j] += sign
    }

    image_data_view[i_red] = alive_next
  }

  for (let i = 0; i < game_data_size; i++) {
    const i_green = i * RGBA_LENGTH + GREEN_OFFSET
    image_data_view[i_green] += neighbor_delta[i]
  }

  ctx.putImageData(image_data, 0, 0)
}

function animate() {
  next_frame()
  requestAnimationFrame(animate)
}

onmessage = ({ data: { offscreen_canvas, initial_spawn_probability } }) => {
  init_globals(offscreen_canvas, initial_spawn_probability)
  animate()
}
