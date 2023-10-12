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
}