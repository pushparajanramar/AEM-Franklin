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

    // Create thead and tbody if not already structured
    const tbody = innerTable.querySelector('tbody');
    const thead = document.createElement('thead');
    const newTbody = document.createElement('tbody');

    // Iterate through the rows of the tbody
    [...tbody.rows].forEach((row, rowIndex) => {
      if (rowIndex < 2) {
        // First two rows are headers
        const headerRow = document.createElement('tr');
        [...row.children].forEach((cell) => {
          const th = document.createElement('th');
          th.innerHTML = cell.innerHTML;
          th.setAttribute('scope', 'col');
          if (cell.hasAttribute('colspan')) {
            th.setAttribute('colspan', cell.getAttribute('colspan'));
          }
          if (cell.hasAttribute('align')) {
            th.setAttribute('align', cell.getAttribute('align'));
          }
          headerRow.append(th);
        });
        thead.append(headerRow);
      } else {
        // Remaining rows are body rows
        const bodyRow = document.createElement('tr');
        [...row.children].forEach((cell) => {
          const td = document.createElement('td');
          td.innerHTML = cell.innerHTML;
          if (cell.hasAttribute('colspan')) {
            td.setAttribute('colspan', cell.getAttribute('colspan'));
          }
          if (cell.hasAttribute('align')) {
            td.setAttribute('align', cell.getAttribute('align'));
          }
          bodyRow.append(td);
        });
        newTbody.append(bodyRow);
      }
    });

    // Replace tbody with thead and new tbody
    innerTable.innerHTML = '';
    innerTable.append(thead, newTbody);

    block.innerHTML = '';
    block.append(innerTable);
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
