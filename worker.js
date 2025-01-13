importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

let data_size, image_now, image_next, neighbor_offsets;

function init_worker(w, h) {
  data_size = w * h * 4

  const row_size = w * 4;

  neighbor_offsets = [
    -row_size - 4,  // up-left
    -row_size,      // up
    -row_size + 4,  // up-right
    -4,              // left
    +4,              // right
    row_size - 4,   // down-left
    row_size,       // down
    row_size + 4,   // down-right
  ];

  const buffer_now = new Uint8ClampedArray(data_size);
  const buffer_next = new Uint8ClampedArray(data_size);

  const opacity = 255
  for (let i = 0; i < data_size; i += 4) {
    const state = Math.random() > 0.95 ? 255 : 0
    buffer_now[i + 3] = opacity;
    buffer_next[i + 3] = opacity;
    buffer_now[i] = state;
    buffer_next[i] = state;
  }

  image_now = new ImageData(buffer_now, w, h);
  image_next = new ImageData(buffer_next, w, h);
}

function next_frame() {
  let temp = image_now; image_now = image_next; image_next = temp;

  const buffer_now = image_now.data;
  const buffer_next = image_next.data;

  for (let i = 4; i < data_size - 4; i += 4) {
    let neighbors = 0;

    for (const offset of neighbor_offsets) {
      if (buffer_now[i + offset]) {
        neighbors += 1;
      }
    }

    let state_now = buffer_now[i];
    let state_next = 0;

    if (neighbors === 3) state_next = 255;
    else if (neighbors === 2) state_next = state_now;

    buffer_next[i] = state_next;
    buffer_next[i + 3] = 255;
  }
  return image_next
}

Comlink.expose({ next_frame, init_worker });
