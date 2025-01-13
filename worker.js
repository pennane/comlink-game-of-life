importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

let width, height, rowLength, a, b;

function initialize(w, h) {
  const ad = new Uint8ClampedArray(w * h * 4);
  const bd = new Uint8ClampedArray(w * h * 4);

  for (let i = 0; i < ad.length; i += 4) {
    const cell = Math.random() > 0.95 ? 255 : 0
    const opacity = 255
    ad[i + 3] = opacity; bd[i + 3] = opacity;
    ad[i] = cell; bd[i] = cell;
  }
  a = new ImageData(ad, w, h); b = new ImageData(bd, w, h);
  width = w; height = h; rowLength = w * 4;
  offsets = [
    -rowLength - 4,  // up-left
    -rowLength,      // up
    -rowLength + 4,  // up-right
    -4,              // left
    +4,              // right
    rowLength - 4,   // down-left
    rowLength,       // down
    rowLength + 4,   // down-right
  ];
}

function valid_offset(index, offset, rowLength, totalLength) {
  const target = index + offset;

  if (target < 0 || target >= totalLength) return false;
  if (offset === -4 && (index % rowLength) === 0) return false;
  if (offset === 4 && (index % rowLength) === (rowLength - 4)) return false;

  return true;
}

function next_frame() {
  let temp = a; a = b; b = temp;
  const now = a.data;
  const next = b.data;
  for (let i = 0; i < now.length; i += 4) {
    let neighbors = 0;

    // TODO: precompute valid offsets for each index
    for (const offset of offsets) {
      if (valid_offset(i, offset, rowLength, now.length) && now[i + offset]) {
        neighbors += 1;
      }
    }

    const alive = now[i];
    let cell = 0;

    if (neighbors === 3) cell = 255;
    else if (neighbors === 2) cell = alive;

    next[i] = cell;
    next[i + 3] = 255;
  }
  return b
}

Comlink.expose({ next_frame, initialize });