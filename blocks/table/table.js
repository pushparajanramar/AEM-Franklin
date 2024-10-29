// Helper function to extract properties from content enclosed in $...$
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

// Function to create a new <tr> element
function createRow() {
    return document.createElement('tr');
}

// Function to create a new <th> element with content and properties
function createHeaderCell(content, properties) {
    const th = document.createElement('th');
    th.innerHTML = content; // Set innerHTML to retain any HTML content

    // Apply colspan and rowspan if specified
    if (properties['data-colspan']) th.colSpan = properties['data-colspan'];
    if (properties['data-rowspan']) th.rowSpan = properties['data-rowspan'];

    return th;
}

// Function to create a new <td> element with content and properties
function createDataCell(content, properties) {
    const td = document.createElement('td');
    td.innerHTML = content; // Set innerHTML to retain any HTML content

    // Apply colspan and rowspan if specified
    if (properties['data-colspan']) td.colSpan = properties['data-colspan'];
    if (properties['data-rowspan']) td.rowSpan = properties['data-rowspan'];

    return td;
}

// Function to parse div tables and create rows and cells
function parseDivTable(divTable, parentTable) {
    const rows = Array.from(divTable.children);

    rows.forEach((rowDiv) => {
        const currentRow = createRow();
        const cells = Array.from(rowDiv.children);

        cells.forEach((cellDiv) => {
            const content = cellDiv.innerHTML.trim();
            if (content === '') return; // Skip empty divs

            const properties = parseProperties(content);
            const cellContent = content.replace(/\$.*?\$/g, '').trim(); // Remove $...$ tags from content

            // Create a cell (either <th> for headers or <td> for regular cells)
            const cell = properties['data-type'] === 'header' 
                ? createHeaderCell(cellContent, properties) 
                : createDataCell(cellContent, properties);

            // Append the cell to the current row
            currentRow.appendChild(cell);
        });

        // Append the row to the table
        parentTable.appendChild(currentRow);
    });
}

// Main function to convert div-based tables to HTML tables with <tr>, <td>, and <th>
export default async function decorate(block) {
    const wrapper = document.querySelector('.table-wrapper');

    // Check if the wrapper exists
    if (!wrapper) {
        console.error('Wrapper element not found!');
        return; // Exit the function if wrapper is not found
    }

    const table = document.createElement('table');
    parseDivTable(wrapper, table);
    wrapper.appendChild(table);
}
