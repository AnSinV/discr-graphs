import { Container, Grid, Paper } from '@mui/material';
import GraphContainer from './components/GraphContainer';
import InputForm from './components/InputForm';
import { useState } from 'react';

export default function App() {
  let [adjMatrix, setAdjMatrix] = useState([
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 0]
  ]);

  let [colors, setColors] = useState([]);

  return (
    <Container maxWidth="xl">
      
        <Grid container justifyContent="space-between">
          <Grid item>
            <GraphContainer adjMatrix={ adjMatrix } updAdjMatrix={ setAdjMatrix } colors={colors}/>
          </Grid>
          <Grid item>
            <InputForm adjMatrix={ adjMatrix } updAdjMatrix={ setAdjMatrix } updColors={setColors}/>
          </Grid>
        </Grid>
    </Container>
  );
}