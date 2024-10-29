
function createTableFromDivWrapper(divWrapper) {
    const table = document.createElement('table');
    const rows = divWrapper.querySelectorAll('.table.block > div');
  
    rows.forEach((rowDiv) => {
      const tr = createTableRow(rowDiv);
      table.appendChild(tr);
    });
  
    return table;
  }
  
  function createTableRow(rowDiv) {
    const tr = document.createElement('tr');
    const cells = rowDiv.querySelectorAll('div');
  
    cells.forEach((cellDiv) => {
      const cell = createTableCell(cellDiv);
      tr.appendChild(cell);
    });
  
    return tr;
  }
  
  function createTableCell(cellDiv) {
    const isHeader = checkIfHeader(cellDiv);
    const cell = document.createElement(isHeader ? 'th' : 'td');
  
    setCellAttributes(cell, cellDiv);
    cell.innerText = cleanCellText(cellDiv.querySelector('p').textContent);
  
    return cell;
  }
  
  function checkIfHeader(cellDiv) {
    return cellDiv.querySelector('p').textContent.includes('$data-type=header$');
  }
  
  function setCellAttributes(cell, cellDiv) {
    const align = cellDiv.getAttribute('data-align');
    const valign = cellDiv.getAttribute('data-valign');
    const colspan = getColspan(cellDiv);
  
    if (align) cell.style.textAlign = align;
    if (valign) cell.style.verticalAlign = valign;
    if (colspan) cell.setAttribute('colspan', colspan);
  }
  
  function getColspan(cellDiv) {
    const colspanMatch = cellDiv.querySelector('p').textContent.match(/\$data-colspan=(\d+)\$/);
    return colspanMatch ? colspanMatch[1] : null;
  }
  
  function cleanCellText(text) {
    return text
      .replace(/\$data-type=header\$/, '')
      .replace(/\$data-end=row\$/, '')
      .replace(/\$data-colspan=\d+\$/, '')
      .trim();
  }
  
  
  
// Helper function to extract properties from content enclosed in $...$
function parseProperties(content) {
    console.log("Entering parseProperties with content:", content);
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
    const innerDiv = document.createElement('div');
    innerDiv.innerHTML = cellDiv.innerHTML.replace(/\$.*?\$/g, '').trim(); // Remove $...$ tags
    copyAttributes(cellDiv, innerDiv);
    th.appendChild(innerDiv);

    if (properties['data-colspan']) th.colSpan = properties['data-colspan'];
    if (properties['data-rowspan']) th.rowSpan = properties['data-rowspan'];

    console.log("Exiting createHeaderCell with th:", th);
    return th;
}

// Function to create a new <td> element with content and properties
function createDataCell(cellDiv, properties) {
    console.log("Entering createDataCell with cellDiv:", cellDiv, "and properties:", properties);
    const td = document.createElement('td');
    const innerDiv = document.createElement('div');
    innerDiv.innerHTML = cellDiv.innerHTML.replace(/\$.*?\$/g, '').trim(); // Remove $...$ tags
    copyAttributes(cellDiv, innerDiv);
    td.appendChild(innerDiv);

    if (properties['data-colspan']) td.colSpan = properties['data-colspan'];
    if (properties['data-rowspan']) td.rowSpan = properties['data-rowspan'];

    console.log("Exiting createDataCell with td:", td);
    return td;
}

// Function to copy attributes from one element to another
function copyAttributes(source, target) {
    console.log("Entering copyAttributes with source:", source, "and target:", target);
    Array.from(source.attributes).forEach(attr => {
        target.setAttribute(attr.name, attr.value);
    });
    console.log("Exiting copyAttributes with target:", target);
}

// Function to parse div tables and create rows and cells
function parseDivTable(divTable, parentTable) {
    console.log("Entering parseDivTable with divTable:", divTable);
    const rows = Array.from(divTable.children);

    rows.forEach((rowDiv, rowIndex) => {
        const currentRow = createRow();
        const cells = Array.from(rowDiv.children);

        cells.forEach((cellDiv, cellIndex) => {
            const content = cellDiv.innerHTML.trim();
            if (content === '') return; // Skip empty divs

            console.log(`Reading cell at row ${rowIndex + 1}, column ${cellIndex + 1}:`, cellDiv);
            const properties = parseProperties(content);
            const cell = properties['data-type'] === 'header' 
                ? createHeaderCell(cellDiv, properties) 
                : createDataCell(cellDiv, properties);

            currentRow.appendChild(cell);

            // Append the row immediately if data-end=row is found
            if (properties['data-end'] === 'row') {
                console.log("Appending row to table due to data-end=row");
                parentTable.appendChild(currentRow);
            }
        });

        // Append row to the table if it hasn't been appended yet
        if (!parentTable.contains(currentRow)) {
            console.log("Appending row to table");
            parentTable.appendChild(currentRow);
        }
    });

    console.log("Exiting parseDivTable with parentTable:", parentTable);
}

// Main function to convert div-based tables to HTML tables with <tr>, <td>, and <th>
export default async function decorate(block) {
    console.log("Entering decorate function");
    const wrappers = document.querySelectorAll('.table'); // Select all .table elements
    console.log("Number of .table elements found:", wrappers.length);

    wrappers.forEach((wrapper, index) => {
        console.log(`Processing .table wrapper ${index + 1}:`, wrapper);
        
        // Clear any existing tables within the wrapper
        //wrapper.innerHTML = ''; // Remove all previous child elements in wrapper

        // Create a new table element
        //const table = document.createElement('table');

        // Parse div-based structure and populate the newly created table
        //parseDivTable(wrapper, table);

        // Usage example
      
        const table = createTableFromDivWrapper(wrapper);

        // Append the single parsed table to the wrapper
        wrapper.appendChild(table);

        console.log("Appended table to wrapper:", wrapper);
    });

    console.log("Exiting decorate function");
}
