import * as pixi from 'pixi.js'

import {viewWidth} from './game'
import {trackMargin, noteSpacing} from './gameplay'
import {RectangleFillSprite, RectangleLineSprite} from './rect'
import {Glow} from './pixi-utils'
import * as util from './util'

export enum NoteState { active, hit, missed, holding }

export class NoteData {
  constructor(public time: number, public position: number) {}

  getScreenPosition() {
    const x = util.lerp(trackMargin, viewWidth - trackMargin, this.position)
    const y = util.lerp(0, -noteSpacing, this.time)
    return new pixi.Point(x, y)
  }
}

export class Note extends pixi.Container {
  state = NoteState.active

  data: NoteData

  constructor(time: number, position: number) {
    super()
    this.addChild(new RectangleFillSprite(0, 0, 40))
    this.addChild(new RectangleLineSprite(0, 0, 50))
    this.data = new NoteData(time, position)
    this.position = this.data.getScreenPosition()
    this.rotation = util.radians(45)
  }

  setState(state: NoteState) {
    if (state === NoteState.hit) {
      this.alpha = 0
    }
    this.state = state
  }
}

export class NoteHitAnimation extends pixi.Container {
  body = this.addChild(new RectangleFillSprite(0, 0, 50))
  glow = this.addChild(new Glow(this.body, 20))
  time = 0

  origin: pixi.Point

  constructor(x: number, y: number) {
    super()
    this.origin = new pixi.Point(x, y)
    this.position = this.origin
    this.rotation = util.radians(45)
  }

  update(dt: number) {
    this.time += dt / 0.4
    if (this.time >= 1) {
      this.destroy()
    } else {
      this.position.y = this.origin.y + util.tween(0, 100, 0, 0.8, this.time, t => t ** 2.5)
      this.alpha = util.tween(1, 0, 0, 0.8, this.time, util.easeQuadIn)
      this.glow.blurFilter.blur = util.tween(30, 10, 0, 0.4, this.time)
    }
  }
}