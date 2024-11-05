// Main function to convert div-based tables to HTML tables with <tr>, <td>, and <th>
export default async function decorate(block) {
    console.log("Entering decorate function" + block);
    const table = createTableFromDivWrapper(block);
    block.innerHTML = ''; // Clear all previous child elements in block
    block.appendChild(table);
    console.log("Exiting decorate function");
}

// Function to parse the div structure and create a table
function createTableFromDivWrapper(divWrapper) {
    console.log("Entering createTableFromDivWrapper");
    const table = document.createElement('table');
    const rows = divWrapper.querySelectorAll('.table.block > div');
    const maxColumns = calculateMaxColumns(rows);
    let isHeaderSection = true;
    let hasBoundaryRow = false;

    // Check if there's a boundary row with "***" to stop treating rows as headers
    rows.forEach((rowDiv) => {
        const cellTexts = Array.from(rowDiv.querySelectorAll('div')).map(cell => cell.innerText.trim());
        if (cellTexts.includes("***")) {
            hasBoundaryRow = true;
        }
    });

    rows.forEach((rowDiv) => {
        const cellTexts = Array.from(rowDiv.querySelectorAll('div')).map(cell => cell.innerText.trim());

        if (hasBoundaryRow && cellTexts.includes("***")) {
            isHeaderSection = false; // Stop treating rows as headers after the "***" marker row
            return; // Skip the "***" row from rendering
        }

        const tr = createTableRow(rowDiv, isHeaderSection, maxColumns);
        table.appendChild(tr);
    });

    console.log("Exiting createTableFromDivWrapper");
    return table;
}

// Function to create a new <tr> element for each row div
function createTableRow(rowDiv, isHeaderSection, maxColumns) {
    console.log("Entering createTableRow");
    const tr = document.createElement('tr');
    const cells = rowDiv.querySelectorAll('div');

    cells.forEach((cellDiv) => {
        const cell = createTableCell(cellDiv, isHeaderSection, maxColumns);
        tr.appendChild(cell);
    });

    console.log("Exiting createTableRow");
    return tr;
}

// Function to create a table cell, ensuring header cells are generated as <th> when in header section
function createTableCell(cellDiv, isHeaderSection, maxColumns) {
    console.log("Entering createTableCell with cellDiv:", cellDiv);
    const cellContent = cellDiv.innerText.trim();
    const isFullWidth = cellContent === "---"; // Check if cell should span entire row
    const isExplicitHeader = cellContent.includes('$data-type=header$'); // Check for $data-type=header$ marker
    const isHeader = isHeaderSection || isExplicitHeader; // Treat as header if in header section or marked explicitly

    const cell = document.createElement(isHeader ? 'th' : 'td');  // Create <th> or <td> based on header status

    if (isFullWidth) {
        cell.setAttribute('colspan', maxColumns); // Set colspan to maximum columns if marked with ---
        cell.innerHTML = cleanCellText(cellDiv.innerHTML);
    } else {
        setCellAttributes(cell, cellDiv);
        cell.innerHTML = cleanCellText(cellDiv.innerHTML);
    }

    console.log("Exiting createTableCell with cell type:", isHeader ? 'th' : 'td', "and content:", cell.innerHTML);
    return cell;
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
    const colspanMatch = cellDiv.querySelector('p')?.textContent.match(/\$data-colspan=(\d+)\$/);
    const result = colspanMatch ? colspanMatch[1] : null;
    console.log("Exiting getColspan with result:", result);
    return result;
}

// Helper function to clean up cell text by removing special markers
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

// Function to calculate the maximum number of columns in the table
function calculateMaxColumns(rows) {
    let maxColumns = 0;
    rows.forEach(row => {
        const cellCount = row.querySelectorAll('div').length;
        if (cellCount > maxColumns) {
            maxColumns = cellCount;
        }
    });
    console.log("Max columns calculated:", maxColumns);
    return maxColumns;
}
