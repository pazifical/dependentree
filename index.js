async function fetchLibraryData(name) {
    const response = await fetch(`https://registry.npmjs.org/${name}/latest`);
    const data = await response.json();
    return data;
}

async function showDependencies() {
    const libraryName = document.getElementById("library-name").value;
    const data = await fetchLibraryData(libraryName);
    renderLibrary(data);
}

function renderLibrary(library) {
    console.log(library);
    let dependencies = "";
    for (const [lib, version] of Object.entries(library.dependencies)) {
        dependencies += `<li>${lib}: ${version}</li>`;
    }

    const element = document.getElementById("result");
    element.innerHTML = `
    <h1>${library.name}<sub>${library.version}</sub></h1>
    <p>${library.description}</p>
    <ul>${dependencies}</ul>`;

    renderNetwork(library);
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