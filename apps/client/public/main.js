const chars = [
  "あ", "い", "う", "え", "お", "か", "が", "き", "ぎ", "く",
  "ぐ", "け", "げ", "こ", "ご", "さ", "ざ", "し", "じ", "す",
  "ず", "せ", "ぜ", "そ", "ぞ", "た", "だ", "ち", "ぢ", "っ",
  "づ", "て", "で", "と", "ど", "な", "に", "ぬ", "ね", "の",
  "は", "ば", "ぱ", "ひ", "び", "ぴ", "ふ", "ぶ", "ぷ", "へ",
  "べ", "ぺ", "ほ", "ぼ", "ぽ", "ま", "み", "む", "め", "も",
  "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "ゐ",
  "ゑ", "を", "ん"
]

class Drawer {
  constructor(dom, unlock) {
    this.dom = dom;
    this.unlock = unlock;
    this.ctx = dom.getContext("2d");
    this.previous = {
      x: null,
      y: null,
    }

    this.dom.width = 256;
    this.dom.height = 256;

    this.measure();
    this.prepare();
  }

  measure = () => {
    const { width, height, left, top } = this.dom.getBoundingClientRect();

    this.width = width;
    this.height = height;
    this.left = left;
    this.top = top;
  }

  prepare() {
    window.addEventListener('resize', this.measure);
    this.dom.addEventListener('mousedown', this.mouseDown);
  }

  close = () => {
    window.removeEventListener('resize', this.measure);
  }

  clear = () => {
    this.ctx.clearRect(0, 0, this.dom.width, this.dom.height);
  }

  getImage = () => {
    return this.ctx.getImageData(0, 0, this.dom.width, this.dom.height).data;
  }

  mouseDown = ({ pageX: initialX, pageY: initialY }) => {
    const { width, height, left, top, dom, ctx } = this;

    this.previous = {
      x: (initialX - left) * (dom.width / width),
      y: (initialY - top) * (dom.height / height)
    };

    this.ctx.lineWidth = 8;
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.lineCap = 'round';

    this.ctx.strokeStyle = "#fff";

    const draw = ({ pageX: x, pageY: y }) => {
      this.ctx.beginPath();

      ctx.moveTo(this.previous.x, this.previous.y);

      ctx.lineTo(
        Math.floor(x - left) * (dom.width / width) - 0.5,
        Math.floor(y - top) * (dom.height / height) - 0.5
      );

      ctx.stroke();
      this.unlock();

      this.previous = {
        x: Math.floor(x - left) * (dom.width / width) - 0.5,
        y: Math.floor(y - top) * (dom.height / height) - 0.5,
      };
    };

    const clearListener = () => {
      this.dom.removeEventListener("mousemove", draw);
      window.removeEventListener("mouseup", clearListener);
    };

    this.dom.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", clearListener);
  }
}

class Application {
  locked = false;

  drawer = null;

  elements = {
    output: document.getElementById("output"),
    canvas: document.getElementById("canvas"),
    clearButton: document.getElementById("clear"),
  };

  constructor() {
    this.drawer = new Drawer(this.elements.canvas, () => {
      this.locked = false;
    })

    this.elements.clearButton.onclick = this.drawer.clear;

    setInterval(() => {
      this.submit();
    }, 100);
  }

  submit = async () => {
    if (this.locked) return;
    this.locked = true;

    const data = this.drawer.getImage();
    const response = await fetch("http://localhost:3001/predict", {
      body: JSON.stringify(Array.from(data)),
      method: "POST",
      headers: {
        'Content-Type': "application/json"
      }
    });

    if (response.ok) {
      const body = await response.json();

      const output = document.createElement("ul");
      for (
        const out of body
          .map((v, i) => ({ char: chars[i], value: v }))
          .sort((a, b) => b.value - a.value)
      ) {
        const el = document.createElement("li");
        el.innerHTML = `<span>${out.char}</span><p>${out.value.toFixed(2)}</p>`;
        output.appendChild(el);
      }

      this.elements.output.innerHTML = '';
      this.elements.output.appendChild(output)
    }
  }
}

new Application();