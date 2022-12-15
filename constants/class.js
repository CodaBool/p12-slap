export class Player {
  constructor(name, uid) {
    this.name = name
    this.id   = null
    this.uid  = uid
    this.turn = false
    this.deck = []
  }
}