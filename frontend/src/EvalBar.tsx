import { Box } from '@mui/material'
import React from 'react'

interface Props {
  evaluation: number
}

export default function EvalBar({ evaluation }: Props) {
  let barHeight = 50 - evaluation * 5
  if (barHeight > 100) {
    barHeight = 100
  } else if (barHeight < 0) {
    barHeight = 0
  }

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'red',
          marginBottom: '18%',
          marginRight: '10%',
          height: `${100}%`
        }}
      >
        <Box
          sx={{
            backgroundColor: 'blue',
            height: `${barHeight}%`
          }}
        />
      </Box>
    </>
  )
}
