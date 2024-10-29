// Helper function to extract properties from content enclosed in $...$
function parseProperties(content) {
    console.log("Entering parseProperties");
    const properties = {};
    const regex = /\$(.*?)\$/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const [key, value] = match[1].split('=');
        properties[key.trim()] = value ? value.trim() : true;
    }
    console.log("Exiting parseProperties with properties:", properties);
    return properties;
}

// Function to create a new <tr> element
function createRow() {
    console.log("Entering createRow");
    const row = document.createElement('tr');
    console.log("Exiting createRow with row:", row);
    return row;
}

// Function to create a new <th> element with content and properties
function createHeaderCell(cellDiv, properties) {
    console.log("Entering createHeaderCell with cellDiv:", cellDiv, "and properties:", properties);
    const th = document.createElement('th');

    // Create a <div> inside <th> to maintain structure
    const innerDiv = document.createElement('div');
    innerDiv.innerHTML = cellDiv.innerHTML; // Copy the innerHTML from the source div
    copyAttributes(cellDiv, innerDiv); // Copy attributes from the original div

    th.appendChild(innerDiv);

    // Apply colspan and rowspan if specified
    if (properties['data-colspan']) th.colSpan = properties['data-colspan'];
    if (properties['data-rowspan']) th.rowSpan = properties['data-rowspan'];

    console.log("Exiting createHeaderCell with th:", th);
    return th;
}

// Function to create a new <td> element with content and properties
function createDataCell(cellDiv, properties) {
    console.log("Entering createDataCell with cellDiv:", cellDiv, "and properties:", properties);
    const td = document.createElement('td');

    // Create a <div> inside <td> to maintain structure
    const innerDiv = document.createElement('div');
    innerDiv.innerHTML = cellDiv.innerHTML; // Copy the innerHTML from the source div
    copyAttributes(cellDiv, innerDiv); // Copy attributes from the original div

    td.appendChild(innerDiv);

    // Apply colspan and rowspan if specified
    if (properties['data-colspan']) td.colSpan = properties['data-colspan'];
    if (properties['data-rowspan']) td.rowSpan = properties['data-rowspan'];

    console.log("Exiting createDataCell with td:", td);
    return td;
}

// Function to copy attributes from one element to another
function copyAttributes(source, target) {
    Array.from(source.attributes).forEach(attr => {
        target.setAttribute(attr.name, attr.value);
    });
}

// Function to parse div tables and create rows and cells
function parseDivTable(divTable, parentTable) {
    console.log("Entering parseDivTable with divTable:", divTable);
    const rows = Array.from(divTable.children);

    rows.forEach((rowDiv) => {
        const currentRow = createRow();
        const cells = Array.from(rowDiv.children);

        cells.forEach((cellDiv) => {
            const content = cellDiv.innerHTML.trim();
            if (content === '') return; // Skip empty divs

            console.log("Reading a new cell:", cellDiv);
            const properties = parseProperties(content);
            const cellContent = content.replace(/\$.*?\$/g, '').trim(); // Remove $...$ tags from content

            // Create a cell (either <th> for headers or <td> for regular cells) with an inner <div>
            const cell = properties['data-type'] === 'header' 
                ? createHeaderCell(cellDiv, properties) 
                : createDataCell(cellDiv, properties);

            // Append the cell to the current row
            currentRow.appendChild(cell);
        });

        // Append the row to the table
        parentTable.appendChild(currentRow);
    });

    console.log("Exiting parseDivTable with parentTable:", parentTable);
}

// Main function to convert div-based tables to HTML tables with <tr>, <td>, and <th>
export default async function decorate(block) {
    console.log("Entering decorate function");
    const wrapper = document.querySelector('.table');
    console.log("Reading the EDS generated content in decorate function with table:", wrapper);

    // Check if the wrapper exists
    if (!wrapper) {
        console.error('Wrapper element not found!');
        return; // Exit the function if wrapper is not found
    }

    // Clear any existing tables within the wrapper
    wrapper.innerHTML = ''; // Remove all previous child elements in wrapper

    // Create a new table element
    const table = document.createElement('table');
    
    // Parse div-based structure and populate the newly created table
    parseDivTable(wrapper, table);

    // Append the single parsed table to the wrapper
    wrapper.appendChild(table);

    console.log("Exiting decorate function with table:", table);
}
