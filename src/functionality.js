export function findEdgeColoring(adjacencyMatrix) {
    let adjacencyList = convertToAdjacencyList(adjacencyMatrix);
    let [edges, cols] = convertToEdgesList(adjacencyMatrix);

    for (let [u, v] of edges) {
        let fan = findMaximalFan(u, v, adjacencyList, cols);
        let [c, d] = findColorsCD(u, fan, adjacencyList, cols);

        let CDPathLength = findAndInvertCDPath(u, c, d, adjacencyList, cols);

        let w, wIndex;
        if (CDPathLength) {
            [w, wIndex] = findWInFan(d, fan, adjacencyList, cols);
        }
        else {
            wIndex = fan.length - 1;
            w = fan[wIndex];
        }

        rotateFan(u, fan.slice(0, wIndex + 1), cols);
        cols[u < w ? `${u}_${w}` : `${w}_${u}`] = d;
    }

    return Object.values(cols);
}

function colorIsFreeForVertex(u, color, adjacencyList, edges) {
    for (let neighbour of adjacencyList[u]) {
        let neighbourColor = edges[u < neighbour ? `${u}_${neighbour}` : `${neighbour}_${u}`];

        if (neighbourColor != 0 && color === neighbourColor) {
            return false;
        }
    }

    return true;
}

function convertToAdjacencyList(adjacencyMatrix) {
    let adjacencyList = Array(adjacencyMatrix.length);
    for (let i = 0; i < adjacencyList.length; ++i) {
        adjacencyList[i] = []
    }

    for (let i = 0; i < adjacencyMatrix.length; ++i) {
        for (let j = i; j < adjacencyMatrix.length; ++j) {
            if (adjacencyMatrix[i][j] === 1) {
                adjacencyList[i].push(j);
                adjacencyList[j].push(i);
            }
        }
    }

    return adjacencyList;
}

function convertToEdgesList(adjMatrix) {
    let edges = []
    let colors = {};

    for (let i = 0; i < adjMatrix.length; i++) {
        for (let j = i; j < adjMatrix[i].length; j++) {
            if (adjMatrix[i][j]) {
                edges.push([i, j]);
                colors[`${i}_${j}`] = 0;
            }
        }
    }

    return [ edges, colors ];
}

function findMaximalFan(u, v, adjacencyList, edges) {
    let fan = [ v ];
    let fanIsMaximal = false;
    let uNeighbours = adjacencyList[u];
    let fanLastNode = v;

    while (!fanIsMaximal) {
        fanIsMaximal = true;

        for (let w of uNeighbours) {
            let col = edges[u < w ? `${u}_${w}` : `${w}_${u}`];

            if (!fan.includes(w) && col !== 0 && colorIsFreeForVertex(fanLastNode, col, adjacencyList, edges)) {
                fan.push(w);
                fanLastNode = w;
                fanIsMaximal = false;
            }
        }
    }

    return fan;
}

function rotateFan(u, fan, edges) {
    for (let i = 0; i < fan.length - 1; ++i) {
        let j = i + 1;
        let col = edges[u < fan[j] ? `${u}_${fan[j]}` : `${fan[j]}_${u}`];

        edges[u < fan[i] ? `${u}_${fan[i]}` : `${fan[i]}_${u}`] = col;
    }
}

function findColorsCD(u, fan, adjacencyList, edges) {
    let v = fan[fan.length - 1];

    let colC = 1, colD = 1;

    while (!colorIsFreeForVertex(u, colC, adjacencyList, edges)) ++colC;
    while (!colorIsFreeForVertex(v, colD, adjacencyList, edges)) ++colD;

    return [ colC, colD ];
}

function findAndInvertCDPath(u, colC, colD, adjacencyList, edges) {
    let pathIsMaximal = false;
    let visited = [u];

    while (!pathIsMaximal) {
        pathIsMaximal = true;

        for (let v of adjacencyList[u]) {
            let edge = u < v ? `${u}_${v}` : `${v}_${u}`;

            if (colD === edges[edge] && !visited.includes(v)) {
                edges[edge] = colC;

                [ u, colC, colD ] = [ v, colD, colC ];
                pathIsMaximal = false;
                visited.push(v);

                break;
            }
        }
    }

    return visited.length - 1;
}

function findWInFan(colD, fan, adjacencyList, edges) {
    for (let i = 0; i < fan.length; ++i) {
        if (colorIsFreeForVertex(fan[i], colD, adjacencyList, edges)) {
            return [fan[i], i];
        }
    };

    return [-1, -1]
}