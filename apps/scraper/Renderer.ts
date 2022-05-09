import { createCanvas } from "https://deno.land/x/canvas@v1.3.0/mod.ts";

const renderFont = (data: ArrayBuffer, charset: string[]): Uint8Array => {
  const CHARACTER_SIZE = 64;
  const COLS = 10;
  const ROWS = Math.ceil(charset.length / COLS);

  const canvas = createCanvas(COLS * CHARACTER_SIZE, ROWS*CHARACTER_SIZE);
  const context = canvas.getContext('2d')

  canvas.loadFont(data, { family: "current" });
  context.font = `${Math.floor(CHARACTER_SIZE * 0.7)}px current`;
  
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = `white`;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const char = charset[row * COLS + col];
      
      if(!char) continue;
      
      context.fillText(
        char,
        0.15 * CHARACTER_SIZE + col * CHARACTER_SIZE,
        (CHARACTER_SIZE * 0.8) + row * CHARACTER_SIZE
      )
    }
  }

  return canvas.toBuffer();
}

export default renderFont;