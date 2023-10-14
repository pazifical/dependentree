class LibraryDependencies {
    constructor(dependencies, devDependencies) {
        this.dependencies = dependencies;
        this.devDependencies = devDependencies;
    }
}

async function fetchLibraryData(name) {
    const response = await fetch(`https://registry.npmjs.org/${name}/latest`);
    const data = await response.json();
    return data;
}

async function showDependencies() {
    const libraryName = document.getElementById("library-name").value;
    const maxDepth = document.getElementById("max-depth").value;
    const data = await fetchLibraryData(libraryName);
    const dependencyMap = await createDependecyMap(libraryName, maxDepth);

    // renderLibrary(data);
    renderDependencyMap(dependencyMap);
}

function extractDependencies(library) {
    const dependencies = [];
    if (!library.dependencies) {
        return dependencies;
    }
    for (const [lib, version] of Object.entries(library.dependencies)) {
        dependencies.push(lib);
    }
    return dependencies;
}
function extractDevDependencies(library) {
    const dependencies = [];
    if (!library.devDependencies) {
        return dependencies;
    }
    for (const [lib, version] of Object.entries(library.devDependencies)) {
        dependencies.push(lib);
    }
    return dependencies;
}

async function createDependecyMap(libraryName, maxDepth) {
    const dependencyMap = new Map();
    await addDepencencies(libraryName, dependencyMap, 0, maxDepth);
    return dependencyMap;
}

async function addDepencencies(libraryName, dependencyMap, depth, maxDepth) {
    if (depth >= maxDepth) {
        return dependencyMap;
    }
    const library = await fetchLibraryData(libraryName);
    const dependencies = extractDependencies(library);
    const devDependencies = extractDevDependencies(library);
    dependencyMap.set(libraryName, new LibraryDependencies(dependencies, devDependencies));

    for (const name of dependencies) {
        if (dependencyMap.has(name)) {
            continue;
        }
        await addDepencencies(name, dependencyMap, depth + 1, maxDepth);
    }
    for (const name of devDependencies) {
        if (dependencyMap.has(name)) {
            continue;
        }
        await addDepencencies(name, dependencyMap, depth + 1, maxDepth);
    }
}

function renderLibrary(library) {
    console.log(library);
    const dependencies = extractDependencies(library);
    const dependencyList = dependencies.map(d => `<li>${d}</li>`).join("");

    const element = document.getElementById("result");
    element.innerHTML = `
    <h1>${library.name}<sub>${library.version}</sub></h1>
    <p>${library.description}</p>
    <ul>${dependencyList}</ul>`;

    renderNetwork(library);
}

function renderDependencyMap(dependencyMap) {
    console.log(dependencyMap);

    const nodeIDMap = new Map();
    let nodeID = 0;
    for (const [key, value] of dependencyMap.entries()) {
        nodeIDMap.set(key, nodeID);
        nodeID += 1;
    }
    console.log("nodeIDMap");
    console.log(nodeIDMap);

    const nodes = [];
    for (const [key, value] of dependencyMap.entries()) {
        nodes.push({ id: nodeIDMap.get(key), label: key });
    }
    console.log("nodes");
    console.log(nodes);

    const edges = [];
    for (const node of nodes) {
        const lib = dependencyMap.get(node.label);
        console.log(node);
        for (const name of lib.dependencies) {
            const from = nodeIDMap.get(node.label)
            const to = nodeIDMap.get(name);
            if (from === undefined || to === undefined) {
                continue;
            }
            edges.push({
                from: from,
                to: to,
            });
        }
        for (const name of lib.devDependencies) {
            const from = nodeIDMap.get(node.label)
            const to = nodeIDMap.get(name);
            if (from === undefined || to === undefined) {
                continue;
            }
            edges.push({
                from: from,
                to: to,
            });
        }
    }
    console.log("edges");
    console.log(edges);

    const visNodes = new vis.DataSet(nodes);
    const visEdges = new vis.DataSet(edges);

    const container = document.getElementById("network");
    const data = {
        nodes: visNodes,
        edges: visEdges
    };
    const options = {};
    if (edges.length > 300) {
        options.physics = { enabled: false };
    }
    const network = new vis.Network(container, data, options);
}

function renderNetwork(library) {
    const nodes = [{ id: 0, label: library.name }]

    let i = 1;
    for (const name of Object.keys(library.dependencies)) {
        nodes.push({ id: i, label: name });
        i += 1;
    }

    const visNodes = new vis.DataSet(nodes);

    const edges = [];
    for (let j = 1; j < i; j++) {
        edges.push({ from: 0, to: j });
    }

    const visEdges = new vis.DataSet(edges);

    const container = document.getElementById("network");
    const data = {
        nodes: visNodes,
        edges: visEdges
    };
    const options = {};
    const network = new vis.Network(container, data, options);
}