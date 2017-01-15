interface Color {
  toString(): string
}

export class ColorHSL implements Color {
  constructor(
    public h: number,
    public s: number,
    public l: number,
    public a = 1,
  ) {}

  toString() {
    const h = Math.round(this.h * 255)
    const s = Math.round(this.s * 100)
    const l = Math.round(this.l * 100)
    return `hsl(${h}, ${s}%, ${l}%)`
  }
}

export class Rectangle {
  private color: Color = new ColorHSL(1, 1, 1)
  private halign = 0.5
  private valign = 0.5

  constructor(
    private x: number,
    private y: number,
    private width: number,
    private height: number,
  ) {}

  colorize(color: Color) {
    this.color = color
    return this
  }

  align(halign: number, valign: number) {
    this.halign = halign
    this.valign = valign
    return this
  }

  fill() {
    if (context2d) {
      context2d.fillStyle = this.color.toString()
      context2d.fillRect(this.x - this.width * this.halign, this.y - this.height * this.valign, this.width, this.height)
    }
    return this
  }

  stroke(lineWidth: number) {
    if (context2d) {
      context2d.strokeStyle = this.color.toString()
      context2d.lineWidth = lineWidth
      context2d.strokeRect(this.x - this.width * this.halign, this.y - this.height * this.valign, this.width, this.height)
    }
    return this
  }
}

export const canvas = document.querySelector('canvas') as HTMLCanvasElement
export const context2d = canvas.getContext('2d')

export function getWidth(): number {
  return canvas.width
}

export function getHeight(): number {
  return canvas.height
}

export function setBackgroundColor(color: Color) {
  canvas.style.backgroundColor = color.toString()
}

export function setDimensions(width: number, height: number) {
  canvas.width = width
  canvas.height = height
}

export function rectangle(x: number, y: number, w: number, h: number) {
  return new Rectangle(x, y, w, h)
}
