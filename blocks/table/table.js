function parseProperties(content) {
    const properties = {};
    const regex = /\$(.*?)\$/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const [key, value] = match[1].split('=');
        properties[key.trim()] = value ? value.trim() : true;
    }
    return properties;
}

function decorateTable(container, outputContainer) {
    if (!container) {
        console.error("Container not found:", container);
        return;
    }

    const table = document.createElement('table');
    parseDivTable(container, table);
    outputContainer.appendChild(table);
}

// Function to parse div tables and create rows and cells
function parseDivTable(divTable, parentTable) {
    const rows = Array.from(divTable.children);

    rows.forEach((rowDiv) => {
        const currentRow = document.createElement('tr');
        const cells = Array.from(rowDiv.children);

        cells.forEach((cellDiv) => {
            const content = cellDiv.innerHTML.trim();
            if (content === '') return; // Skip empty divs

            const properties = parseProperties(content);
            const cellContent = content.replace(/\$.*?\$/g, '').trim(); // Remove $...$ tags from content

            // Create a cell (either <th> for headers or <td> for regular cells)
            const cell = properties['data-type'] === 'header' ? document.createElement('th') : document.createElement('td');
            cell.innerHTML = cellContent; // Set innerHTML to retain any HTML content

            // Apply colspan and rowspan if specified
            if (properties['data-colspan']) cell.colSpan = properties['data-colspan'];
            if (properties['data-rowspan']) cell.rowSpan = properties['data-rowspan'];

            // Append the cell to the current row
            currentRow.appendChild(cell);
        });

        // Append the row to the table
        parentTable.appendChild(currentRow);
    });
}

export default async function decorate(block) {
    console.log("(block) is working");
    const wrapper = document.querySelector('.table-wrapper');

    // Check if the wrapper exists
    if (!wrapper) {
        console.error('Wrapper element not found!');
        return; // Exit the function if wrapper is not found
    }

    const tableDivs = document.querySelectorAll(".table div");
    var newDiv = document.createElement('div');

    // Filter out empty divs before appending
    [...tableDivs].forEach((div) => {
        if (div.innerHTML.trim() !== "") { // Check if div is not empty
            newDiv.appendChild(div.cloneNode(true)); // Clone and append the non-empty divs
        }
    });

    const customID = document.createElement('div');
    customID.id = 'newDivId'; // Set a unique ID for the output div
    wrapper.insertAdjacentElement('afterend', customID);

    const outputContainer = document.getElementById('newDivId');
    outputContainer.innerHTML = ''; // Clear any previous output

    // Log for debugging
    console.log("New Div Content:", newDiv.innerHTML); // Log to see what's being processed

    // Call the decorateTable function to create the table
    decorateTable(newDiv, outputContainer);
}