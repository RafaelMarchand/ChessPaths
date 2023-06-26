import { Chess } from 'chess.js'
import GraphDrawer from 'graph-drawer'
import Graphology from 'graphology'
import EngineHandler from './Engine/EngineHandler'
import Evaluation from './Engine/Evaluation'
import Mediator from './Mediator'

const STARTING_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export interface NodeAttributes {
  position: string
  evaluation: Evaluation
}

export default class GraphBuilder {
  graph: Graphology<NodeAttributes>
  graphDrawer: GraphDrawer
  currentNodeKey: number
  rootNodes: number[]
  nodeFocus: number
  lineCount: number
  depth: number
  engineHandler: EngineHandler

  constructor(mediator: Mediator) {
    this.graph = new Graphology()
    this.graphDrawer = null
    this.lineCount = 1
    this.depth = 18
    this.rootNodes = []
    this.nodeFocus = 0
    this.currentNodeKey = 0
    this.engineHandler = new EngineHandler(mediator)
  }

  setGraphAttributes(): void {
    const rootNodes = this.rootNodes.map((nodeKey: number) => String(nodeKey))
    this.graph.setAttribute('rootNodes', rootNodes)
    this.graph.setAttribute('focus', String(this.nodeFocus))
  }

  getRootNodes() {
    return this.rootNodes.map((nodeKey: number) => String(nodeKey))
  }

  getLines(): string[][] {
    if (this.graph.hasNode(String(this.nodeFocus))) {
      return this.graph.getNodeAttribute(String(this.nodeFocus), 'evaluation').getLines()
    } else {
      return []
    }
  }

  addEngineMove(lineKey: number) {
    const chess = new Chess()
    const origPosition = this.getPosition(String(this.nodeFocus))
    chess.load(origPosition)
    chess.move(this.getLines()[lineKey][0], { sloppy: true })
    this.addNode(chess.fen())
    const key = this.getNodeKey(chess.fen())
    if (key !== undefined) {
      this.setFocus(key)
    }
    return chess.fen()
  }

  addNode(position: string) {
    const nodeKey: string | undefined = this.graph.findNode((key: string) => {
      if (this.getPosition(key) === position) {
        return true
      }
    })
    if (!nodeKey) {
      this.graph.addNode(String(this.currentNodeKey), {
        position: position,
        evaluation: this.engineHandler.addEvaluation(position, this.depth, this.lineCount)
      })
      this.graph.addEdge(String(this.nodeFocus), String(this.currentNodeKey))
      this.nodeFocus = this.currentNodeKey
      this.currentNodeKey++
      this.drawGraph()
    }
  }

  addRootNode(position: string) {
    this.graph.addNode(String(this.currentNodeKey), {
      position: position,
      evaluation: this.engineHandler.addEvaluation(position, this.depth, this.lineCount)
    })
    this.rootNodes.push(this.currentNodeKey)
    this.nodeFocus = this.currentNodeKey
    this.currentNodeKey++
    this.drawGraph()
  }

  getPosition(key: string): string {
    return this.graph.getNodeAttribute(key, 'evaluation').position
  }

  getEvaluation(): number | undefined {
    return this.graph.getNodeAttribute(String(this.nodeFocus), 'evaluation').evaluation
  }

  setFocus(key: string): void {
    this.nodeFocus = parseInt(key)
    this.drawGraph()
  }

  setCurrentPosition(position: string): void {
    const key = this.getNodeKey(position)
    if (key !== undefined) {
      this.setFocus(key)
    } else {
      if (this.graph.nodes().length === 0) {
        this.addRootNode(STARTING_POSITION)
      }
      this.addNode(position)
    }
  }

  getNodeKey(position: string): string | undefined {
    return this.graph.findNode(
      (nodeKey: string, attributes: NodeAttributes) => attributes.evaluation.position === position
    )
  }

  addGameFromPGN(pgn: string): string | null {
    const chess = new Chess()
    const positions: string[] = []
    if (chess.loadPgn(pgn)) {
      this.graph = new Graphology()
      this.currentNodeKey = 0
      positions.push(chess.fen())
      while (chess.fen() !== STARTING_POSITION) {
        chess.undo()
        positions.push(chess.fen())
      }
      this.addRootNode(positions[positions.length - 1])
      for (let i = positions.length - 2; i >= 0; i--) {
        this.addNode(positions[i])
      }
      return positions[0]
    }
    return null
  }

  drawGraph() {
    this.setGraphAttributes()
    this.graphDrawer.drawGraph(this.graph, this.getRootNodes())
  }
}
