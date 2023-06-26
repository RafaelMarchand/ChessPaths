import Graphology from 'graphology'
import GraphBuilder from './GraphBuilder'

export type UpdateNodeValues = (graph: Graphology, rootNodes: string[]) => void | null

export type UpdateLines = () => void

export type UpdateEvaluation = (graphBuilder: GraphBuilder) => void
