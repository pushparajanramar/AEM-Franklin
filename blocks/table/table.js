
function buildCell(rowIndex, colElement, isHeaderRow) {
  // Decide whether the cell should be <th> or <td>
  const cellType = isHeaderRow ? 'th' : 'td';
  const cell = document.createElement(cellType);

  if (cellType === 'th') {
    cell.setAttribute('scope', 'col'); // Set scope for header cells
  }

  // Copy content and attributes from the source column
  cell.innerHTML = colElement.innerHTML;

  if (colElement.hasAttribute('rowspan')) {
    cell.setAttribute('rowspan', colElement.getAttribute('rowspan'));
  }
  if (colElement.hasAttribute('colspan')) {
    cell.setAttribute('colspan', colElement.getAttribute('colspan'));
  }

  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  // Determine the number of header rows based on the block's class
  const hasTwoHeaderRows = block.classList.contains('two');
  const hasOneHeaderRow = block.classList.contains('one');
  const headerRowsCount = hasTwoHeaderRows ? 2 : hasOneHeaderRow ? 1 : 0;

  [...block.children].forEach((child, rowIndex) => {
    const row = document.createElement('tr');

    // Check if the current row is a header row based on the detected header row count
    const isHeaderRow = rowIndex < headerRowsCount;

    if (isHeaderRow) {
      // Append to <thead>
      thead.append(row);
    } else {
      // Append to <tbody>
      tbody.append(row);
    }

    [...child.children].forEach((col) => {
      const cell = buildCell(rowIndex, col, isHeaderRow);
      row.append(cell);
    });
  });

  // Process nested tables if any
  const nestedTable = table.querySelector('table');
  if (nestedTable) {
    fixNestedTableStructure(nestedTable, headerRowsCount);
  }

  // Replace the block's content with the generated table directly
  block.innerHTML = ''; // Clear the outer block
  block.replaceWith(table); // Replace the outer block (div) with the table
}

function fixNestedTableStructure(nestedTable, headerRowsCount) {
  const tbody = nestedTable.querySelector('tbody');
  if (tbody) {
    // Split rows into headers and body rows based on headerRowsCount
    const rows = [...tbody.children];
    const theadRows = rows.slice(0, headerRowsCount); // Dynamic header row count
    const bodyRows = rows.slice(headerRowsCount); // Remaining rows are body rows

    // Create <thead> and move header rows into it
    const thead = document.createElement('thead');
    theadRows.forEach((row) => thead.appendChild(row));

    // Clear the original <tbody> and move body rows into it
    tbody.innerHTML = '';
    bodyRows.forEach((row) => tbody.appendChild(row));

    // Insert <thead> before <tbody>
    nestedTable.insertBefore(thead, tbody);
  }
}
