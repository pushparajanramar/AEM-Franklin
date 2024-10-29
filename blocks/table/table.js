// Main function to convert div-based tables to HTML tables with <tr>, <td>, and <th>
export default async function decorate(block) {
    console.log("Entering decorate function" + block);
    const table = createTableFromDivWrapper(block);
    // Clear any existing tables within the wrapper
    block.innerHTML = ''; // Remove all previous child elements in block
    block.appendChild(table);

    const wrappers = block.querySelectorAll('div'); // Select all div elements

    console.log("Exiting decorate function");
}

// Function to parse the div structure and create a table
function createTableFromDivWrapper(divWrapper) {
    console.log("Entering createTableFromDivWrapper");
    const table = document.createElement('table');
    const rows = divWrapper.querySelectorAll('.table.block > div');

    rows.forEach((rowDiv) => {
        const tr = createTableRow(rowDiv);
        table.appendChild(tr);
    });

    console.log("Exiting createTableFromDivWrapper");
    return table;
}

// Function to create a new <tr> element for each row div
function createTableRow(rowDiv) {
    console.log("Entering createTableRow");
    const tr = document.createElement('tr');
    const cells = rowDiv.querySelectorAll('div');

    cells.forEach((cellDiv) => {
        const cell = createTableCell(cellDiv);
        tr.appendChild(cell);
    });

    console.log("Exiting createTableRow");
    return tr;
}

// Function to create a table cell, either <th> or <td>, based on data-type
function createTableCell(cellDiv) {
    console.log("Entering createTableCell");
    const isHeader = checkIfHeader(cellDiv);
    const cell = document.createElement(isHeader ? 'th' : 'td');

    setCellAttributes(cell, cellDiv);
    cell.innerText = cleanCellText(cellDiv.querySelector('p').textContent);

    console.log("Exiting createTableCell");
    return cell;
}

// Helper function to check if a cell is a header based on content
function checkIfHeader(cellDiv) {
    console.log("Entering checkIfHeader");
    const result = cellDiv.querySelector('p').textContent.includes('$data-type=header$');
    console.log("Exiting checkIfHeader with result:", result);
    return result;
}

// Function to set alignment, vertical alignment, and colspan attributes on a cell
function setCellAttributes(cell, cellDiv) {
    console.log("Entering setCellAttributes");
    const align = cellDiv.getAttribute('data-align');
    const valign = cellDiv.getAttribute('data-valign');
    const colspan = getColspan(cellDiv);

    if (align) cell.style.textAlign = align;
    if (valign) cell.style.verticalAlign = valign;
    if (colspan) cell.setAttribute('colspan', colspan);

    console.log("Exiting setCellAttributes");
}

// Function to retrieve colspan from cell content if specified
function getColspan(cellDiv) {
    console.log("Entering getColspan");
    const colspanMatch = cellDiv.querySelector('p').textContent.match(/\$data-colspan=(\d+)\$/);
    const result = colspanMatch ? colspanMatch[1] : null;
    console.log("Exiting getColspan with result:", result);
    return result;
}

// Helper function to clean up cell text by removing special markers
function cleanCellText(text) {
    console.log("Entering cleanCellText");
    const result = text
        .replace(/\$data-type=header\$/, '')
        .replace(/\$data-end=row\$/, '')
        .replace(/\$data-colspan=\d+\$/, '')
        .trim();
    console.log("Exiting cleanCellText with result:", result);
    return result;
}
