import { Button, Grid, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import AddCircleOutlineTwoToneIcon from '@mui/icons-material/AddCircleOutlineTwoTone';

import { findEdgeColoring } from "../functionality";

export default function InputForm({ adjMatrix, updAdjMatrix, updColors }) {
    function addNewVertex() {
        let copy = Array.from(adjMatrix);

        for (let row of copy) {
            row.push(0);
        }
        copy.push(Array(copy.length + 1).fill(0));

        updAdjMatrix(copy);
    }

    function changeValue(e) {
        let [i, j] = e.target.dataset.cellid.split("_").map(Number);

        let copy = Array.from(adjMatrix);
        copy[j][i] = copy[i][j] = Number(!copy[i][j]);

        updAdjMatrix(copy);
    }

    function runAlgorithm() {
        function generateRandomColor(){
            let maxVal = 0xFFFFFF;
            let randomNumber = Math.random() * maxVal; 
            randomNumber = Math.floor(randomNumber);
            randomNumber = randomNumber.toString(16);
            let randColor = randomNumber.padStart(6, 0);   
            return `#${randColor.toUpperCase()}`
        }

        let colors = findEdgeColoring(adjMatrix);
        
        let colorDict = {};
        for (let val of colors) {
            if (!colorDict.hasOwnProperty(val)) {
                colorDict[val.toString()] = generateRandomColor();
            }
        }

        for (let i in colors) {
            colors[i] = colorDict[colors[i]];
        }

        updColors(colors);
    }

    return (
        <Grid container direction="column">
            <Grid item>
                <TableContainer>
                    <Table component={Paper}>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                {adjMatrix.map((val, idx) => (<TableCell align="center">{String.fromCharCode("A".charCodeAt(0) + idx)}</TableCell>))}
                                <TableCell align="center" onClick={addNewVertex}>
                                    <AddCircleOutlineTwoToneIcon/>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {adjMatrix.map((val, idx_1) => (
                                <TableRow
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell align="center" >{String.fromCharCode("A".charCodeAt(0) + idx_1)}</TableCell>
                                    {val.map((elem, idx_2) => (
                                        <TableCell align="center" data-cellid={`${idx_1}_${idx_2}`} onClick={(changeValue)}>{elem}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell align="center" onClick={addNewVertex}>
                                    <AddCircleOutlineTwoToneIcon/>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid item>
                <Grid container  justifyContent="space-around" alignItems="center">
                    <Button color="success" variant="contained" onClick={() => runAlgorithm()}>Запустить алгоритм</Button>
                </Grid>
            </Grid>
        </Grid>
    );
}
