const hiraganaChars = {
  start: 0x3040,
  end: 0x309f,
  disabled: [
    0x3040, 0x3041, 0x3043, 0x3045, 0x3047, 0x3049,
    0x3064,
    0x3083, 0x3085, 0x3087, 0x308e,
    0x3095, 0x3096, 0x3097, 0x3098, 0x3099, 0x309a, 0x309b, 0x309c, 0x309d, 0x309e 
  ]
}


const hiragana = new Array(hiraganaChars.end - hiraganaChars.start + 1)
  .fill(null)
  .map((_, i) => hiraganaChars.start + i)
  .filter(c => !hiraganaChars.disabled.includes(c))
  .map(c => String.fromCharCode(c));

console.log(hiragana)

export {
  hiragana
}