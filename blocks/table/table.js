function buildCell(rowIndex, colElement) {
  // Determine whether to use a <th> or <td>
  const cellType = rowIndex === 0 || (colElement.hasAttribute('rowspan') && rowIndex <= parseInt(colElement.getAttribute('rowspan'), 10)) ? 'th' : 'td';
  const cell = document.createElement(cellType);

  if (cellType === 'th') cell.setAttribute('scope', 'row'); // Add scope for accessibility
  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  // Generate table rows and cells
  [...block.children].forEach((child, rowIndex) => {
      const row = document.createElement('tr');
      if (rowIndex === 0) thead.append(row);
      else tbody.append(row);

      [...child.children].forEach((col) => {
          const cell = buildCell(rowIndex, col);
          cell.innerHTML = col.innerHTML;

          // Handle rowspan if present
          if (col.hasAttribute('rowspan')) {
              const rowspan = parseInt(col.getAttribute('rowspan'), 10);
              cell.setAttribute('rowspan', rowspan);
          }

          row.append(cell);
      });
  });

  // Replace the block's content with the generated table directly
  block.innerHTML = ''; // Clear the outer block
  block.replaceWith(table); // Replace the outer block (div) with the table
}
