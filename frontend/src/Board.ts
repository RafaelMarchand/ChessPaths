import { Chess } from 'chess.js'
import { Config } from 'chessground/config'
import * as cg from 'chessground/types'
import Mediator from './Mediator'

const STARTING_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export default class Board {
  mediator: Mediator
  config: Config
  position: string
  reRender: any

  constructor(mediator: Mediator) {
    this.mediator = mediator
    this.reRender = null
    this.position = STARTING_POSITION
    this.config = {
      fen: this.getFen(STARTING_POSITION),
      events: {
        move: (orig: cg.Key, dest: cg.Key) => {
          this.validateMove(orig, dest)
        }
      }
    }
  }

  getConfig(): Config {
    this.config.fen = this.getFen(this.position)
    return this.config
  }

  update(position: string) {
    this.position = position
    this.reRender((lastVal: number) => lastVal + 1)
  }

  validateMove(orig: cg.Key, dest: cg.Key) {
    const chess: Chess = new Chess(this.position)
    if (chess.move({ from: orig, to: dest })) {
      this.position = chess.fen()
      const boardMove = new CustomEvent('boardMove', {
        detail: {
          position: this.position
        }
      })
      this.mediator.dispatchEvent(boardMove)
    }
    this.reRender((lastVal: number) => lastVal + 1)
  }

  getFen(fen: string): string {
    const index = fen.indexOf(' ')
    if (index !== -1) {
      return fen.slice(0, index)
    }
    return fen
  }
}
