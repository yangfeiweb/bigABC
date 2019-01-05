import * as PIXI from 'pixi.js'

export class Sprite extends PIXI.Sprite {
  constructor (options) {
    super(options.texture)
    this.x = options.x
    this.y = options.y
    options.width && (this.width = options.width)
    options.height && (this.height = options.height)
  }
}
