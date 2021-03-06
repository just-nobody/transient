import {ComboSprite} from './combo'
import {GameState} from './game'
import {Judgement, JudgementSprite, judgeTiming, timingWindow} from './judgement'
import {NoteExplosionSprite} from './note-explosion'
import {NoteSprite, NoteState} from './note'
import {ReceptorSprite} from './receptor'
import {Song} from './song-manager'
import * as game from './game'
import * as pixi from 'pixi.js'
import * as resources from './resources'
// import {Howl} from 'howler'

export const receptorPosition = game.viewHeight * 0.889
export const noteSpacing = 300

export class GameplayState implements GameState {
  // game state
  songTime = -2
  loading = true
  song = new Song('frigid')
  audio: Howl

  // rendering stuff
  stage = new pixi.Container()
  receptors = new pixi.Container()
  explosions = new pixi.Container()
  notes = new pixi.Container()
  judgement = new JudgementSprite()
  combo = new ComboSprite()

  async enter() {
    for (const note of this.song.notes) {
      const noteSprite = this.notes.addChild(new NoteSprite(note))
      this.receptors.addChild(new ReceptorSprite(noteSprite.x, receptorPosition, note.time))
    }

    // insert containers manually to ensure proper draw order
    this.stage.addChild(new pixi.Sprite(resources.getTexture('background')))
    this.stage.addChild(this.receptors)
    this.stage.addChild(this.explosions)
    this.stage.addChild(this.notes)
    this.stage.addChild(this.combo)
    this.stage.addChild(this.judgement)

    this.audio = await this.song.loadAudio()
    this.loading = false
  }

  leave() {}

  update(dt: number) {
    if (this.loading) return

    this.songTime += dt

    if (this.songTime >= -this.song.offset && !this.audio.playing()) {
      this.audio.seek(this.songTime + this.song.offset)
      this.audio.play()
    }

    this.notes.y = this.songTime * noteSpacing
    this.checkMisses()

    this.judgement.update(dt)
    this.combo.update(dt)

    for (const exp of this.explosions.children as NoteExplosionSprite[]) {
      exp.update(dt)
    }
    for (const rec of this.receptors.children as ReceptorSprite[]) {
      rec.update(this.songTime)
    }
  }

  render(renderer: pixi.SystemRenderer) {
    renderer.render(this.stage)
  }

  pointerdown(event: pixi.interaction.InteractionEvent) {
    if (this.loading) return

    this.tryTapNote(event.data.global, (note, timing) => {
      const judgement = judgeTiming(timing)
      this.explosions.addChild(new NoteExplosionSprite(note.x, receptorPosition))
      this.judgement.playJudgement(judgement)
      if (judgement < Judgement.bad) {
        this.combo.add(1)
      }
    })
  }

  pointerup() {}

  pointermove() {}

  tryTapNote(touch: pixi.Point, callback: (note: NoteSprite, timing: number) => any) {
    for (const note of this.notes.children as NoteSprite[]) {
      const isActive = note.state === NoteState.active
      const touchDistance = Math.abs(note.x - touch.x)
      const touchTiming = Math.abs(this.songTime - note.time)

      if (isActive && touchDistance < 80 && touchTiming < timingWindow[Judgement.bad]) {
        note.state = NoteState.hit
        note.visible = false
        callback(note, touchTiming)
        break
      }
    }
  }

  checkMisses() {
    let missed = false

    for (const note of this.notes.children as NoteSprite[]) {
      const isActive = note.state === NoteState.active
      const isMissed = this.songTime > note.time + timingWindow[Judgement.bad]
      if (isActive && isMissed) {
        note.state = NoteState.missed
        note.visible = false
        missed = true
      }
    }

    if (missed) {
      this.judgement.playJudgement(Judgement.miss)
    }
  }
}
