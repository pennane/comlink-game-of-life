importScripts("https://unpkg.com/comlink/dist/umd/comlink.js")

let frame_view, data_size
let neighbor_indices, neighbor_view, neighbor_delta

function init_worker(w, h, p) {
  data_size = w * h

  const buffer = crossOriginIsolated
    ? new SharedArrayBuffer(data_size)
    : new ArrayBuffer(data_size)

  frame_view = new Uint8ClampedArray(buffer)

  for (let i = 0; i < data_size; i++) {
    const state = Math.random() > p ? 255 : 0
    frame_view[i] = state
  }

  neighbor_indices = new Array(data_size)
  neighbor_view = new Uint8ClampedArray(data_size)
  neighbor_delta = new Int8Array(data_size)

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = y * w + x
      const neighbors = []

      for (let dx = -1; dx < 2; dx++) {
        for (let dy = -1; dy < 2; dy++) {
          if (dx === 0 && dy === 0) continue
          const ox = x + dx
          if (ox === 0 || ox === w) continue
          const oy = y + dy
          if (oy === 0 || oy === h) continue
          neighbors.push(oy * w + ox)
        }
      }
      neighbor_indices[i] = neighbors
    }
  }

  for (let i = 0; i < data_size; i++) {
    let neighbors = 0
    for (const offset of neighbor_indices[i]) {
      if (frame_view[offset]) neighbors += 1
    }
    neighbor_view[i] = neighbors
  }
}

function next_frame() {
  neighbor_delta.fill(0)

  for (let i = 0; i < data_size; i++) {
    let state_now = frame_view[i]
    let neighbors = neighbor_view[i]
    if (!state_now && !neighbors) {
      continue
    }

    let state_next = 0
    if (neighbors === 3) state_next = 255
    else if (neighbors === 2) state_next = state_now

    if (state_now && !state_next) for (const j of neighbor_indices[i]) {
      neighbor_delta[j]--
    }
    else if (!state_now && state_next) for (const j of neighbor_indices[i]) {
      neighbor_delta[j]++
    }

    frame_view[i] = state_next
  }

  for (let i = 0; i < data_size; i++) neighbor_view[i] += neighbor_delta[i]

  return frame_view.buffer
}

Comlink.expose({ next_frame, init_worker })
