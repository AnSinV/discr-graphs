import { useState } from "react"
import GraphCanvas from "./GraphCanvas"
import { Grid, Tooltip, Button } from "@mui/material";
import AdsClickTwoToneIcon from '@mui/icons-material/AdsClickTwoTone';

const MouseState = {
    Idle: 0,
    CreatingEdge: 1,
    Deleting: 2,
    SpawningDot: 3
}

export default function GraphContainer({ adjMatrix, updAdjMatrix, colors }) {
    let [ mouseState, setMouseState ] = useState(MouseState.Idle);

    function clearMatrix() {
        updAdjMatrix([ [0, 0], [0, 0] ]);
    }

    return (
        <Grid container direction="column">
            <Grid item>
                <Grid container justifyContent="space-around" alignItems="center">
                    <Grid item>
                        <Tooltip title="Перетащить вершину" arrow>
                            <Button 
                                color="info" 
                                onClick={() => {setMouseState(MouseState.Idle)}} 
                                variant={(mouseState === MouseState.Idle) ? "contained" : "outlined"}
                            >
                                <AdsClickTwoToneIcon/>
                            </Button>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Tooltip title="Создать новую вершину" arrow>
                            <Button 
                                color="success" 
                                onClick={() => {setMouseState(MouseState.SpawningDot)}} 
                                variant={(mouseState === MouseState.SpawningDot) ? "contained" : "outlined"}
                            >
                                Новая вершина
                            </Button>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Tooltip title="Создать новое ребро" arrow>
                            <Button 
                                color="success" 
                                onClick={() => {setMouseState(MouseState.CreatingEdge)}} 
                                variant={(mouseState === MouseState.CreatingEdge) ? "contained" : "outlined"}
                            >
                                Новое ребро
                            </Button>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Tooltip title="Удалить вершину или ребро" arrow>
                            <Button 
                                color="error" 
                                onClick={() => {setMouseState(MouseState.Deleting)}}
                                variant={(mouseState === MouseState.Deleting) ? "contained" : "outlined"}
                            >
                                Удалить
                            </Button>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Tooltip title="Оставить только две вершины" arrow variant="outlined">
                            <Button color="secondary" onClick={clearMatrix}>Очистить</Button>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <GraphCanvas adjMatrix={adjMatrix} updAdjMatrix={updAdjMatrix} mouseState={mouseState} edgeColors={colors}/>
            </Grid>
        </Grid>
    );
}