function buildCell(isHeader) {
  const cell = isHeader ? document.createElement('th') : document.createElement('td');
  if (isHeader) cell.setAttribute('scope', 'col');
  return cell;
}

export default async function decorate(block) {
  // Check if the block contains a single-cell wrapper with another table
  const innerTable = block.querySelector('table');
  if (innerTable) {
    // Create a new table structure to replace the existing one
    const newTable = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const rows = [...innerTable.querySelectorAll('tr')];

    rows.forEach((row, rowIndex) => {
      const newRow = document.createElement('tr');
      const isHeader = rowIndex === 0 || rowIndex === 1; // First two rows are headers

      [...row.children].forEach((cell) => {
        const newCell = buildCell(isHeader);

        // Preserve original cell attributes (e.g., colspan, align)
        [...cell.attributes].forEach((attr) => {
          newCell.setAttribute(attr.name, attr.value);
        });

        newCell.innerHTML = cell.innerHTML;
        newRow.append(newCell);
      });

      // Add row to thead or tbody based on whether it's a header
      if (isHeader) {
        thead.append(newRow);
      } else {
        tbody.append(newRow);
      }
    });

    newTable.append(thead, tbody);

    // Clear the block and replace it with the new table
    block.innerHTML = '';
    block.append(newTable);
    return;
  }

  // Handle other cases (fallback)
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  let headerRowspan = 0;

  [...block.children].forEach((child, rowIndex) => {
    const row = document.createElement('tr');
    const isHeaderRow = headerRowspan > 0 || rowIndex === 0;

    if (isHeaderRow) {
      thead.append(row);
    } else {
      tbody.append(row);
    }

    [...child.children].forEach((col, colIndex) => {
      const isHeader = isHeaderRow || (rowIndex === 0 && colIndex === 0);
      const cell = buildCell(isHeader);

      const rowspan = col.getAttribute('rowspan');
      if (rowIndex === 0 && colIndex === 0 && rowspan) {
        headerRowspan = parseInt(rowspan, 10) - 1;
        cell.setAttribute('rowspan', rowspan);
      }

      cell.innerHTML = col.innerHTML;
      row.append(cell);
    });

    if (headerRowspan > 0) {
      headerRowspan--;
    }
  });

  block.innerHTML = '';
  block.append(table);
}
