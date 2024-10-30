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
// Updated function to create a table cell, handling nested HTML
// Function to create a table cell, ensuring header cells are generated as <th>
// Function to create a table cell, ensuring header cells are generated as <th>
function createTableCell(cellDiv) {
    console.log("Entering createTableCell with cellDiv:", cellDiv);
    const isHeader = checkIfHeader(cellDiv);
    const cell = document.createElement(isHeader ? 'th' : 'td');  // Create <th> or <td> based on header status

    setCellAttributes(cell, cellDiv);

    // Use innerHTML to preserve nested elements and cleaned-up content
    cell.innerHTML = cleanCellText(cellDiv.innerHTML);

    console.log("Exiting createTableCell with cell type:", isHeader ? 'th' : 'td', "and content:", cell.innerHTML);
    return cell;
}

// Helper function to check if a cell is a header based on content
// Updated function to check if a cell is a header based on content, handling whitespaces and variations
// Function to check if any <p> tag in a cell contains the header marker
function checkIfHeader(cellDiv) {
    console.log("Entering checkIfHeader with cellDiv:", cellDiv);
    const paragraphs = cellDiv.querySelectorAll('p');
    let isHeader = false;

    // Loop through all <p> tags to check for the header marker
    paragraphs.forEach((p) => {
        if (/\$data-type=header\$/i.test(p.innerHTML)) {
            isHeader = true;
        }
    });

    console.log("Exiting checkIfHeader with result:", isHeader);
    return isHeader;
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
// Updated helper function to clean up cell text by removing special markers, keeping HTML intact
// Updated helper function to clean up cell text by removing special markers only, leaving other content intact
// Updated helper function to clean up cell text by removing special markers, leaving other content intact
function cleanCellText(htmlContent) {
    console.log("Entering cleanCellText with content:", htmlContent);

    // Remove $...$ markers only, keeping all other HTML content intact
    const result = htmlContent
        .replace(/\$data-type=header\$/g, '')  // Remove header marker
        .replace(/\$data-end=row\$/g, '')      // Remove row end marker
        .replace(/\$data-colspan=\d+\$/g, '')  // Remove colspan marker
        .trim();

    console.log("Exiting cleanCellText with result:", result);
    return result;
}