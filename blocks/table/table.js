/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

function buildCell(rowIndex, colElement) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');

  // Check for rowspan or other attributes in the original element
  if (colElement.hasAttribute('rowspan')) {
      cell.setAttribute('rowspan', colElement.getAttribute('rowspan'));
  }
  if (colElement.hasAttribute('colspan')) {
      cell.setAttribute('colspan', colElement.getAttribute('colspan'));
  }

  return cell;
}

export default async function decorate(block) {
  // Check if the block contains only one child div
  if (block.children.length === 1 && block.firstElementChild.tagName === 'DIV') {
      block = block.firstElementChild; // Ignore the outer div
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  [...block.children].forEach((child, i) => {
      const row = document.createElement('tr');
      if (i === 0) thead.append(row); // First row goes into the table header
      else tbody.append(row);

      [...child.children].forEach((col) => {
          const cell = buildCell(i, col);
          cell.innerHTML = col.innerHTML;
          row.append(cell);
      });
  });

  // Clear the block and append the newly created table
  block.innerHTML = '';
  block.append(table);
}
