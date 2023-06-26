import { ThemeProvider } from '@emotion/react'
import Mediator from '../Mediator'
import Evaluation from './Evaluation'

const MAX_EVALUATIONS_RUNNING = 2
const RENDER_DELAY = 500

export default class EngineHandler {
  evaluationsPending: Evaluation[]
  evaluationsDone: Evaluation[]
  mediator: Mediator
  evaluationsRunning: Evaluation[]
  setTimeOutCalled: boolean
  delay: number

  constructor(mediator: Mediator) {
    this.mediator = mediator
    this.evaluationsRunning = []
    this.evaluationsDone = []
    this.evaluationsPending = []
    this.setTimeOutCalled = false
    this.delay = 0
  }

  addEvaluation(position: string, depth: number, lineCount: number): Evaluation {
    const evaluation = new Evaluation(position, depth, lineCount)
    evaluation.addEventListener('terminate', (e: any) => {
      this.done(e.detail.evaluation)
    })
    evaluation.addEventListener('engineUpdate', (e) => {
      if (!this.setTimeOutCalled) {
        this.setTimeOutCalled = true
        setTimeout(() => this.updateUI(), this.delay)
      }
    })
    this.evaluationsPending.push(evaluation)
    this.regulateWorkers()
    return evaluation
  }

  done(evaluation: Evaluation) {
    const index = this.evaluationsRunning.indexOf(evaluation)
    if (index != -1) {
      this.evaluationsRunning.splice(index, 1)
    }
    this.evaluationsDone.push(evaluation)
  }

  regulateWorkers() {
    if (this.evaluationsRunning.length < MAX_EVALUATIONS_RUNNING && this.evaluationsPending.length !== 0) {
      const evaluation = this.evaluationsPending.pop()
      if (evaluation) {
        evaluation.evaluate()
        this.evaluationsRunning.push(evaluation)
      }
    }
  }

  updateUI() {
    this.setTimeOutCalled = false
    this.delay = RENDER_DELAY
    const engineUpdate = new CustomEvent('engineUpdate', {})
    this.mediator.dispatchEvent(engineUpdate)
    this.regulateWorkers()
  }
}
