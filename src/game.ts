import * as pixi from 'pixi.js'

export const viewWidth = 540
export const viewHeight = 960
export const noteSpacing = 300 // pixels per second
export const trackMargin = 80
export const receptorPosition = viewHeight * 0.82

export class Game {
  input = new pixi.interaction.InteractionManager(this.renderer)

  constructor(public renderer: pixi.WebGLRenderer | pixi.CanvasRenderer, public state: GameState) {
    this.input.on('pointerdown', (event: pixi.interaction.InteractionEvent) => this.state.pointerdown(event))
    this.input.on('pointerup', (event: pixi.interaction.InteractionEvent) => this.state.pointerup(event))
    this.input.on('pointermoved', (event: pixi.interaction.InteractionEvent) => this.state.pointermoved(event))
  }

  update(dt: number) {
    this.state.update(dt)
    this.state.render(this.renderer)
  }
}

export abstract class GameState {
  update(dt: number): void {}
  render(renderer: pixi.WebGLRenderer | pixi.CanvasRenderer): void {}
  pointerdown(event: pixi.interaction.InteractionEvent): void {}
  pointerup(event: pixi.interaction.InteractionEvent): void {}
  pointermoved(event: pixi.interaction.InteractionEvent): void {}
}
