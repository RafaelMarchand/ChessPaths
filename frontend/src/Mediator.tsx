import Board from './Board'
import GraphBuilder from './GraphBuilder'

export default class Mediator extends EventTarget {
  board: Board
  graphBuilder: GraphBuilder
  hoverOverNode: boolean
  updateLines: any
  updateEvaluation: any

  constructor() {
    super()
    this.graphBuilder = new GraphBuilder(this)
    this.board = new Board(this)
    this.hoverOverNode = false
    this.updateLines = null
    this.updateEvaluation = null
    this.addEventListener('evaluation', (e) => {
      this.graphBuilder.drawGraph()
      this.updateEvaluation(this.graphBuilder.getEvaluation())
    })
    this.addEventListener('line', (e) => {
      this.updateLines(this.graphBuilder.getLines())
    })
    this.addEventListener('boardMove', (e: any) => {
      this.graphBuilder.setCurrentPosition(e.detail.position)
      this.graphBuilder.drawGraph()
      this.updateLines(this.graphBuilder.getLines())
    })
  }

  addGame(pgn: string) {
    const finalPosition = this.graphBuilder.addGameFromPGN(pgn)
    if (finalPosition) {
      this.board.update(finalPosition)
    } else {
      // handel invalid game
    }
  }

  nodeOnClick(key: string) {
    this.graphBuilder.setFocus(key)
    this.updateLines(this.graphBuilder.getLines())
    this.updateEvaluation(this.graphBuilder.getEvaluation())
    this.board.update(this.graphBuilder.getPosition(key))
  }

  hoverOnNode(key: string) {
    if (key !== undefined) {
      if (key === String(this.graphBuilder.nodeFocus)) return
      this.hoverOverNode = true
      const position: string = this.graphBuilder.getPosition(key)
      this.board.update(position)
    } else {
      this.hoverOverNode = false
      const position: string = this.graphBuilder.getPosition(String(this.graphBuilder.nodeFocus))
      this.board.update(position)
    }
  }

  addEngineMove(key: number) {
    const position = this.graphBuilder.addEngineMove(key)
    this.board.update(position)
  }
}
