function buildCell(isHeader) {
  const cell = isHeader ? document.createElement('th') : document.createElement('td');
  if (isHeader) cell.setAttribute('scope', 'col');
  return cell;
}

export default async function decorate(block) {
  // Check if the block contains a single cell with another table
  if (
    block.children.length === 1 && // Only one child
    block.firstElementChild.children.length === 1 && // Single child of that child
    block.firstElementChild.firstElementChild.tagName === 'TABLE' // Child contains a table
  ) {
    // Replace the block with the inner table
    const innerTable = block.firstElementChild.firstElementChild;

    // Ensure first row cells are rendered as th
    const firstRow = innerTable.querySelector('tr:first-child');
    if (firstRow) {
      [...firstRow.children].forEach((cell) => {
        const th = document.createElement('th');
        th.innerHTML = cell.innerHTML;
        th.setAttribute('scope', 'col');
        cell.replaceWith(th);
      });
    }

    block.innerHTML = '';
    block.append(innerTable);
    return;
  }

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
