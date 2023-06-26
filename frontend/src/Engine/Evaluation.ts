import { Chess } from 'chess.js'
import Engine from './Engine'
import Line from './Line'

export default class Evaluation extends EventTarget {
  position: string
  lines: Line[]
  evaluation: number
  depth: number
  lineCount: number

  constructor(position: string, depth: number, lineCount: number) {
    super()
    this.position = position
    this.evaluation = 0
    this.lineCount = lineCount
    this.depth = depth
    this.lines = []
  }

  evaluate() {
    let currentLines: string[][] = []
    const engine = new Engine(this.lineCount, this.depth, false)
    engine.addEventListener('terminate', (e: any) => {
      const terminate = new CustomEvent('terminate', { detail: { evaluation: this } })
      this.dispatchEvent(terminate)
    })
    engine.addEventListener('allLines', async (linesEvent: any) => {
      currentLines = linesEvent.detail.lines
      Promise.all(
        linesEvent.detail.lines.map(
          (line: string[]) => new Promise<number>((resolve) => {
              const evaler = new Engine(this.lineCount, this.depth, true)
              evaler.addEventListener('evaluation', (evalEvent: any) => {
                resolve(evalEvent.detail.evaluation)
              })
              evaler.run(this.getEndPosition(line))
            })
        )
      ).then((evaluations) => {
        this.resolveLine(evaluations, currentLines)
      })
    })
    engine.run(this.position)
  }

  resolveLine(evaluations: number[], currentLines: string[][]) {
    this.lines = evaluations.map((evaluation, index) => new Line(evaluation, currentLines[index]))
    this.setEvaluation()
    const engineUpdate = new CustomEvent('engineUpdate', {})
    this.dispatchEvent(engineUpdate)
  }

  setEvaluation() {
    this.lines.forEach((line) => {
      if (this.evaluation < Math.abs(line.evaluation)) {
        this.evaluation = line.evaluation
      }
    })
  }

  getLines(): string[][] {
    return this.lines.map((line) => line.line)
  }

  getEndPosition(line: string[]): string {
    const chess = new Chess()
    chess.load(this.position)
    for (const move in line) {
      chess.move(move)
    }
    return chess.fen()
  }
}
