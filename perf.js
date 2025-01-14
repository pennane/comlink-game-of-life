
import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.mjs'

const worker = new Worker('worker.js')
const { next_frame, init_worker } = Comlink.wrap(worker)


async function measure_performance(target_frames, frame_size) {
  await init_worker(frame_size, frame_size)

  const start = performance.now()
  for (let i = 0; i < target_frames; i++) {
    await next_frame()
  }
  const end = performance.now()
  return end - start
}

console.log(await measure_performance(100, 1000))
//  ImageData                         3.3 s
//  Uint8ClampedArray                 3.4 s
//  ArrayBuffer                       3.5 s 
//  SharedArrayBuffer                 2.9 s 
//  ArrayBuffer only transport        0.5 s
//  SharedArrayBuffer only transport  10 ms
//  After all the changes             1.7 s