// Main function to convert div-based tables to HTML tables with <tr>, <td>, <th>
export default async function decorate(block) {
  const table = createTableFromDivWrapper(block);
  block.innerHTML = ''; // Clear all previous child elements in block
  block.appendChild(table);
}

// Function to parse the div structure and create a table
function createTableFromDivWrapper(divWrapper) {
  const table = document.createElement('table');
  const rows = divWrapper.querySelectorAll('.table.block > div');
  const maxColumns = calculateMaxColumns(rows);
  let isHeaderSection = true;
  let hasBoundaryRow = false;
  // Check if there's a boundary row with "***" or "$data-end=row$" marker to stop treating rows as headers
  rows.forEach((rowDiv) => {
      const cellTexts = Array.from(rowDiv.querySelectorAll('div')).map(cell => cell.innerText.trim());
      if (cellTexts.includes("***") || cellTexts.some(text => /\$data-end=row\$/.test(text))) {
          hasBoundaryRow = true;
      }
  });

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  rows.forEach((rowDiv) => {
      const cellTexts = Array.from(rowDiv.querySelectorAll('div')).map(cell => cell.innerText.trim());
      if (hasBoundaryRow && (cellTexts.includes("***") || cellTexts.some(text => /\$data-end=row\$/.test(text)))) {
          isHeaderSection = false; // Stop treating rows as headers after the "***" or "$data-end=row$" marker row
          return; // Skip the "***" or "$data-end=row$" row from rendering
      }
      const tr = createTableRow(rowDiv, isHeaderSection, maxColumns);
      // Append the row to the correct section (thead or tbody)
      if (isHeaderSection) {
          thead.appendChild(tr);
      } else {
          tbody.appendChild(tr);
      }
  });

  // Append both thead and tbody to the table
  table.appendChild(thead);
  table.appendChild(tbody);
  return table;
}

// Function to create a new <tr> element for each row div
function createTableRow(rowDiv, isHeaderSection, maxColumns) {
  const tr = document.createElement('tr');
  const cells = rowDiv.querySelectorAll('div');
  cells.forEach((cellDiv) => {
      const cell = createTableCell(cellDiv, isHeaderSection, maxColumns);
      tr.appendChild(cell);
  });
 return tr;
}

// Function to create a table cell, ensuring header cells are generated as <th> when in header section
function createTableCell(cellDiv, isHeaderSection, maxColumns) {
  const cellContent = cellDiv.innerText.trim();
  const isFullWidth = cellContent === "---"; // Check if cell should span entire row
  const isExplicitHeader = cellContent.includes('$data-type=header$'); // Check for $data-type=header$ marker
  const isHeader = isHeaderSection || isExplicitHeader; // Treat as header if in header section or marked explicitly
  const cell = document.createElement(isHeader ? 'th' : 'td');  // Create <th> or <td> based on header status
  if (isFullWidth) {
      cell.setAttribute('colspan', maxColumns); // Set colspan to maximum columns if marked with ---
      cell.innerHTML = ""; // Clear the content as it's a full-width spacer row
  } else {
      setCellAttributes(cell, cellDiv);
      cell.innerHTML = cleanCellText(cellDiv.innerHTML);
      // Check if this is a header cell and has a colspan, then align it to center
      if (isHeader && getColspan(cellDiv)) {
          cell.style.textAlign = 'center';
      }
      // Check for nested tables within this cell
      const nestedTables = cell.querySelectorAll('table');
      nestedTables.forEach(nestedTable => applyNestedTableHeaders(nestedTable));
  }
  return cell;
}

// Function to set alignment, vertical alignment, and colspan attributes on a cell
function setCellAttributes(cell, cellDiv) {
  const align = cellDiv.getAttribute('data-align');
  const valign = cellDiv.getAttribute('data-valign');
  const colspan = getColspan(cellDiv);
  if (align) cell.style.textAlign = align;
  if (valign) cell.style.verticalAlign = valign;
  if (colspan) cell.setAttribute('colspan', colspan);
}

// Function to retrieve colspan from cell content if specified
function getColspan(cellDiv) {
  let result = null; // Declare result
  const colspanMatch = cellDiv.querySelectorAll('p');
  colspanMatch.forEach((p) => {
      const match = p.innerHTML.match(/\$data-colspan=(\d+)\$/i); // Match and capture the number
      if (match) {
          result = match[1]; // Extract the number from the match
      }
  });
  return result; // Return result
}

// Helper function to clean up cell text by removing special markers
function cleanCellText(htmlContent) {
  // Remove $...$ markers only, keeping all other HTML content intact
  const result = htmlContent
      .replace(/\$data-type=header\$/g, '')  // Remove header marker
      .replace(/\$data-end=row\$/g, '')      // Remove row end marker
      .replace(/\$data-colspan=\d+\$/g, '')  // Remove colspan marker
      .trim();
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
  return maxColumns;
}

// Function to apply header row formatting to the first row of a nested table
function applyNestedTableHeaders(nestedTable) {
 const firstRow = nestedTable.querySelector('tr');
  if (firstRow) {
      const cells = firstRow.children;
      Array.from(cells).forEach(cell => {
          // Convert <td> to <th> if it’s not already <th>
          if (cell.tagName.toLowerCase() === 'td') {
              const th = document.createElement('th');
              th.innerHTML = cell.innerHTML;
              firstRow.replaceChild(th, cell);
          }
      });
  }
}
