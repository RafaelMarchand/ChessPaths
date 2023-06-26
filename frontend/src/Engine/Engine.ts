const WORKER_PATH = 'src/engine/stockfish.js'

interface EngineStates {
  off: string
  uciok: string
  readyok: string
  bestMove: string
}

const ENGINE_STATES: EngineStates = {
  off: 'off',
  uciok: 'uciok',
  readyok: 'readyok',
  bestMove: 'bestmove'
}

export default class Engine extends EventTarget {
  evalOn: boolean
  depth: number | null
  position: string | null
  stockfish: Worker | null
  state: string
  lineCount: number | null
  currentLine: number
  lines: string[][]

  constructor(lineCount: number, depth: number, evalOn: boolean) {
    super()
    this.evalOn = evalOn
    this.depth = depth
    this.position = null
    this.lineCount = lineCount
    this.state = ENGINE_STATES.off
    this.stockfish = null
    this.currentLine = 0
    this.lines = []
  }

  run(position: string) {
    this.position = position
    this.stockfish = new Worker(WORKER_PATH)
    //console.log("worker + Evaler :"+ this.evalOn)
    this.stockfish.onmessage = (e) => this.receive(e)
    this.stockfish.postMessage('uci')
  }

  receive(e: any) {
    switch (this.state) {
      case ENGINE_STATES.off:
        if (e.data === 'uciok') {
          this.state = ENGINE_STATES.uciok
          this.stockfish?.postMessage(`setoption name MultiPV value ${this.lineCount}`)
          this.stockfish?.postMessage('isready')
        }
      case ENGINE_STATES.uciok:
        if (e.data === 'readyok') {
          this.state = ENGINE_STATES.readyok
          this.stockfish?.postMessage('ucinewgame')
          this.stockfish?.postMessage(`position fen ${this.position}`)

          if (this.evalOn) {
            this.stockfish?.postMessage('eval')
          } else {
            this.stockfish?.postMessage(`go depth ${this.depth}`)
          }
        }
      case ENGINE_STATES.readyok:
        if (e.data.includes('bestmove')) {
          this.terminate()
        }
        //console.log(e.data)
        if (this.evalOn) {
          this.evaluation(e.data)
        } else {
          this.line(e.data)
        }
    }
  }

  terminate() {
    this.stockfish?.postMessage('quit')
    this.stockfish?.terminate()
    const terminate = new CustomEvent('terminate', { detail: {} })
    this.dispatchEvent(terminate)
  }

  line(data: string): void {
    const dataArray: string[] = data.split(' ')
    const currentDepth = Number(dataArray[2])
    if (dataArray.length >= 17 + currentDepth) {
      const line = dataArray.slice(17, dataArray.length)
      this.lines.push(line)
    }

    if (this.lines.length === this.lineCount) {
      const allLines = new CustomEvent('allLines', { detail: { lines: this.lines } })
      this.dispatchEvent(allLines)
      this.lines = []
    }
  }

  evaluation(data: string): void {
    if (data.includes('Total Evaluation')) {
      const dataArray = data.split(' ')
      const evaluation = parseFloat(dataArray[2])
      const updateEval = new CustomEvent('evaluation', { detail: { evaluation: evaluation } })
      this.dispatchEvent(updateEval)
      this.terminate()
    }
  }
}
