import * as pixi from 'pixi.js'

import {viewWidth, trackMargin, noteSpacing} from './constants'
import {RectangleSprite} from './rect'
import {Glow} from './pixi-utils'
import * as util from './util'

const noteSize = 50

export const enum NoteState { active, hit, missed, holding }

export class NoteData {
  constructor(public time: number, public position: number) {}

  getScreenPosition() {
    const x = util.lerp(trackMargin, viewWidth - trackMargin, this.position)
    const y = util.lerp(0, -noteSpacing, this.time)
    return new pixi.Point(x, y)
  }
}

export class NoteSprite extends pixi.Container {
  state = NoteState.active

  data: NoteData

  constructor(time: number, position: number) {
    super()
    this.addChild(new RectangleSprite('fill', 0, 0, noteSize - 10))
    this.addChild(new RectangleSprite('line', 0, 0, noteSize))
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

export class NoteHitSprite extends pixi.Container {
  body = this.addChild(new RectangleSprite('fill', 0, 0, noteSize))
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
      return true
    }
    this.position.y = this.origin.y + util.tween(0, 100, 0, 0.8, this.time, t => t ** 2.5)
    this.alpha = util.tween(1, 0, 0, 0.8, this.time, util.easeQuadIn)
    this.glow.blurFilter.blur = util.tween(30, 10, 0, 0.4, this.time)
    return false
  }
}

export class NoteReceptorSprite extends pixi.Container {
  body = this.addChild(new RectangleSprite('line', 0, 0, noteSize, undefined, undefined, undefined, 2))

  constructor(x: number, y: number) {
    super()
    this.position.set(x, y)
    this.rotation = util.radians(45)
  }

  update(note: NoteSprite) {
    const notePos = note.getGlobalPosition()
    if (note.state === NoteState.active && notePos.y < this.y) {
      const delta = util.delta(notePos.y, this.y, this.y - 300)
      this.alpha = util.lerp(1, 0, util.clamp(delta, 0, 1))
    } else {
      this.alpha = 0
    }
  }
}
