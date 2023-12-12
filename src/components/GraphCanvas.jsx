import { useEffect, useState, useRef } from 'react';
import { Grid } from '@mui/material';

class Vertex {
    constructor(positionX, positionY) {
        this.x = positionX;
        this.y = positionY;
    }

    draw(ctx, vertexLetter) {
        const radius = 10;

        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.lineWidth = 5;

        ctx.font = '8pt Calibri';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(vertexLetter, this.x, this.y + 3);
    }
}

class Edge {
    constructor(firstVertex, secondVertex) {
        this.vertex_1 = firstVertex;
        this.vertex_2 = secondVertex;
    }

    draw(ctx, color = "black") {
        ctx.beginPath();
        ctx.moveTo(this.vertex_1.x, this.vertex_1.y);
        ctx.lineTo(this.vertex_2.x, this.vertex_2.y);

        ctx.lineWidth = 5;
        ctx.strokeStyle = color;

        ctx.stroke();
    }
}

const MouseState = {
    Idle: 0,
    CreatingEdge: 1,
    Deleting: 2,
    SpawningDot: 3
}

function rndNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function isOnLine(pointX, pointY, vertex1_X, vertex1_Y, vertex2_X, vertex2_Y, maxDistance) {
    var dxL = vertex2_X - vertex1_X, dyL = vertex2_Y - vertex1_Y;
    var dxP = pointX - vertex1_X, dyP = pointY - vertex1_Y; 

    var squareLen = dxL * dxL + dyL * dyL;
    var dotProd   = dxP * dxL + dyP * dyL;
    var crossProd = dyP * dxL - dxP * dyL;

    var distance = Math.abs(crossProd) / Math.sqrt(squareLen);

    return (distance <= maxDistance && dotProd >= 0 && dotProd <= squareLen);
}

export default function GraphCanvas({ adjMatrix, updAdjMatrix, mouseState, edgeColors }) {
    const [width, height] = [1000, 700];

    let [graphInfo, setGraphInfo] = useState({ vertexes: [], edges: [], mouseState: mouseState, stateHelpVar: null, colors: [] });;

    const canvasRef = useRef();

    useEffect(() => {
        graphInfo.colors = [];
        getVertexesAndEdges();
    }, [adjMatrix])

    useEffect(() => {
        graphInfo.colors = edgeColors
    }, [edgeColors]);

    useEffect(() => {
        setInterval(redrawCanvas, 20);
    }, [])

    function getVertexesAndEdges() {
        let vertexes = graphInfo.vertexes;

        if (vertexes.length !== adjMatrix.length) {
            if (vertexes.length > adjMatrix.length) {
                graphInfo.vertexes.splice(adjMatrix.length, vertexes.length - adjMatrix.length);
            }
            else {
                let len = vertexes.length;
                for (let i = 0; i < (adjMatrix.length - len); ++i) {
                    let flag = true;
                    let x, y;

                    while (flag) {
                        flag = false;

                        x = rndNumber(100, width - 100);
                        y = rndNumber(100, height - 100);
            
                        for (let elem of vertexes) {
                            if (Math.sqrt(Math.pow(x - elem.posX, 2) + Math.pow(y - elem.posY, 2)) <= 50) {
                                flag = true;
                                break;
                            }
                        }
                    }
            
                    vertexes.push(new Vertex(x, y))
                }
            }
        }
    
        graphInfo.edges = [];
        for (let i in adjMatrix) {
            for (let j in adjMatrix[i]) {
                if (adjMatrix[i][j]) {
                    if (!graphInfo.edges.find((edge) => ((edge.vertex_1 === vertexes[i] && edge.vertex_2 === vertexes[j]) || (edge.vertex_1 === vertexes[j] && edge.vertex_2 === vertexes[i])))){
                        graphInfo.edges.push(new Edge(vertexes[i], vertexes[j]));
                    }
                }
            }
        }
    }

    function handleMouseDown(e) {
        let canvRect = e.target.getBoundingClientRect();
    
        let posX = e.clientX - canvRect.x;
        let posY = e.clientY - canvRect.y;

        for (let i in graphInfo.vertexes) {
            if (Math.sqrt(Math.pow(posX - graphInfo.vertexes[i].x, 2) + Math.pow(posY - graphInfo.vertexes[i].y, 2)) <= 10) {
                if (mouseState === MouseState.Deleting) {
                    graphInfo.vertexes.splice(i, 1);

                    let copy = Array.from(adjMatrix);

                    copy.splice(i, 1);
                    for (let idx in copy) {
                        copy[idx].splice(i, 1);
                    }

                    updAdjMatrix(copy);
                }
                else if (mouseState === MouseState.Idle) {
                    graphInfo.stateHelpVar = i;
                }
                else if (mouseState === MouseState.CreatingEdge) {
                    if (graphInfo.stateHelpVar !== null && graphInfo.stateHelpVar !== graphInfo.vertexes[i]) {
                        graphInfo.edges.push(new Edge(graphInfo.vertexes[graphInfo.stateHelpVar], graphInfo.vertexes[i]));
                        
                        let copy = Array.from(adjMatrix);
                        copy[graphInfo.stateHelpVar][i] = copy[i][graphInfo.stateHelpVar] = 1;
                        updAdjMatrix(copy);
                        
                        graphInfo.stateHelpVar = null;
                    }
                    else {
                        graphInfo.stateHelpVar = i;
                    }
                }

                return;
            }
        }

        if (mouseState === MouseState.Deleting) {
            for (let i in graphInfo.edges) {
                if (isOnLine(
                        posX, 
                        posY, 
                        graphInfo.edges[i].vertex_1.x,
                        graphInfo.edges[i].vertex_1.y,
                        graphInfo.edges[i].vertex_2.x,
                        graphInfo.edges[i].vertex_2.y,
                        5)) 
                    {
                    let copy = Array.from(adjMatrix);

                    let idx_1 = graphInfo.vertexes.indexOf(graphInfo.edges[i].vertex_1);
                    let idx_2 = graphInfo.vertexes.indexOf(graphInfo.edges[i].vertex_2);
                    copy[idx_1][idx_2] = copy[idx_2][idx_1] = 0;

                    updAdjMatrix(copy);
                }
            }
        }

        if (mouseState === MouseState.SpawningDot) {
            graphInfo.vertexes.push(new Vertex(posX, posY));
            setGraphInfo(graphInfo);

            let copy = Array.from(adjMatrix);
            for (let row of copy) {
                row.push(0);
            }
            copy.push(Array(adjMatrix.length + 1).fill(0));
            
            updAdjMatrix(copy);
        }
    }

    function handleMouseMove(e) {
        if (mouseState === MouseState.Idle && graphInfo.stateHelpVar !== null) {
            let canvRect = e.target.getBoundingClientRect();
            graphInfo.vertexes[Number(graphInfo.stateHelpVar)].x = e.clientX - canvRect.x;
            graphInfo.vertexes[Number(graphInfo.stateHelpVar)].y = e.clientY - canvRect.y;
        }
    }
    
    function handleMouseUp(e) {
        if (mouseState === MouseState.Idle) {
            graphInfo.stateHelpVar = null;
        }
    }

    function handleMouseLeave(e) {
        if (mouseState === MouseState.Idle) {
            graphInfo.stateHelpVar = null;
        }
    }

    function redrawCanvas() {
        let canv = canvasRef.current;

        let ctx = canv.getContext("2d");
        let canvRect = canv.getBoundingClientRect();

        ctx.clearRect(0, 0, canvRect.x, canvRect.y);
        ctx.fillStyle = "#def5ff";
        ctx.fillRect(0, 0, width, height);    

        let { vertexes, edges, colors } = graphInfo;

        for (let i in edges) {
            if (colors.length) {
                edges[i].draw(ctx, colors[i]);
            }
            else {
                edges[i].draw(ctx);
            }
            
        }

        for (let idx = 0; idx < vertexes.length; ++idx) {
            let char = String.fromCharCode('A'.charCodeAt(0) + idx);
            vertexes[idx].draw(ctx, char)
        }
    }

    return (
        <Grid container>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            />
        </Grid>
    );
}