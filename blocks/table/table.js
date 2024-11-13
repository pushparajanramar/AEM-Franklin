function buildCell(rowIndex, colElement, isHeaderRow) {
  // If the row is part of the header (rowIndex === 0 or explicitly marked as header row), use <th>
  const cellType = isHeaderRow ? 'th' : 'td';
  const cell = document.createElement(cellType);

  if (cellType === 'th') {
      // Add scope attribute for header cells
      cell.setAttribute('scope', 'col'); // Default to column headers
      if (colElement.hasAttribute('rowspan')) {
          cell.setAttribute('rowspan', colElement.getAttribute('rowspan'));
      }
      if (colElement.hasAttribute('colspan')) {
          cell.setAttribute('colspan', colElement.getAttribute('colspan'));
      }
  }

  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  [...block.children].forEach((child, rowIndex) => {
      const row = document.createElement('tr');

      // Check if it's a header row (first row or if headers span multiple rows)
      const isHeaderRow = rowIndex === 0 || [...child.children].some((col) => col.hasAttribute('rowspan'));

      // Append to the appropriate section
      if (isHeaderRow) thead.append(row);
      else tbody.append(row);

      [...child.children].forEach((col) => {
          const cell = buildCell(rowIndex, col, isHeaderRow);
          cell.innerHTML = col.innerHTML;
          row.append(cell);
      });
  });

  // Replace the block's content with the generated table directly
  block.innerHTML = ''; // Clear the outer block
  block.replaceWith(table); // Replace the outer block (div) with the table
}
