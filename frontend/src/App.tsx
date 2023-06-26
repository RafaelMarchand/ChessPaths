import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField
} from '@mui/material'
import Chessground from '@react-chess/chessground'
import 'chessground/assets/chessground.base.css'
import 'chessground/assets/chessground.brown.css'
import 'chessground/assets/chessground.cburnett.css'
import { useEffect, useState } from 'react'
import { Config } from '../node_modules/chessground/config'
import EvalBar from './EvalBar'
import Graph from './Graph'
import Mediator from './Mediator'

const mediator = new Mediator()

function App() {
  const [chessGame, setChessGame] = useState<string>('')
  const [config, setConfig] = useState<Config>(mediator.board.config)
  const [updateBoard, setUpdateBoard] = useState<number>(0)
  const [lines, setLines] = useState<string[][]>([])
  const [depth, setDepth] = useState<string>(String(mediator.graphBuilder.depth))
  const [lineCount, setLineCount] = useState<string>(String(mediator.graphBuilder.lineCount))
  const [evaluation, setEvaluation] = useState<number>(0.0)

  function onChangeDepth(event: SelectChangeEvent) {
    setDepth(event.target.value)
    mediator.graphBuilder.depth = parseInt(event.target.value)
  }

  function onChangeLines(event: SelectChangeEvent) {
    setLineCount(event.target.value)
    mediator.graphBuilder.lineCount = parseInt(event.target.value)
  }

  useEffect(() => {
    mediator.updateLines = setLines
    mediator.updateEvaluation = setEvaluation
  }, [])

  useEffect(() => {
    if (mediator.board.reRender) {
      setConfig(mediator.board.getConfig())
    } else {
      mediator.board.reRender = setUpdateBoard
    }
  }, [updateBoard])

  useEffect(() => {
    if (mediator.graphBuilder.graphDrawer !== null) {
      mediator.addGame(chessGame)
    }
  }, [chessGame])

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '30px 50vh 1fr', gridTemplateRows: '50vh 1fr' }}>
      <Box sx={{ gridColumn: '1', gridRow: '1', height: '99%' }}>
        <EvalBar evaluation={evaluation} />
      </Box>
      <Box sx={{ gridColumn: '2', gridRow: '1' }}>
        <Chessground key={String(updateBoard)} config={config} contained></Chessground>
      </Box>
      <Box sx={{ gridColumn: '3', gridRow: '1' }}>
        {lines.map((line: string[], index) => (
          <Grid key={String(index)} item>
            <Button onClick={(event) => mediator.addEngineMove(index)} variant="contained">
              {line[0]}
            </Button>
          </Grid>
        ))}
        <Grid item>
          <TextField
            variant="filled"
            onChange={(event) => {
              setChessGame(event.target.value)
            }}
          />
        </Grid>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Select value={depth} onChange={onChangeDepth}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={16}>16</MenuItem>
              <MenuItem value={18}>18</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={22}>22</MenuItem>
              <MenuItem value={99}>99</MenuItem>
            </Select>
            <FormHelperText>Maximum Depth</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <Select value={lineCount} onChange={onChangeLines}>
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={4}>4</MenuItem>
              <MenuItem value={5}>5</MenuItem>
            </Select>
            <FormHelperText>Lines</FormHelperText>
          </FormControl>
        </Grid>
      </Box>

      <Box sx={{ gridColumn: '1 / 3', gridRow: '2' }}>
        <Graph mediator={mediator} />
      </Box>
    </Box>
  )
}
export default App
