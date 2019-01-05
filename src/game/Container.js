/**
 * 
 * @description 
 * 
 * @export
 * @class Container
 * @extends PIXI.Container
 *   
 */

export default class Container extends PIXI.Container {
  constructor(renderer, stage) {
    super();
    this._renderer = renderer;
    this._stage = stage;
  }
}
