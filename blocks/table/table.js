/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

function buildCell(rowIndex, isHeader) {
  const cell = isHeader ? document.createElement('th') : document.createElement('td');
  if (isHeader) cell.setAttribute('scope', 'col');
  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  const children = [...block.children];

  // Determine the number of header rows from the first cell's rowspan
  const headerRowCount = parseInt(
      children[0]?.children[0]?.getAttribute('rowspan') || 1,
      10
  );

  children.forEach((child, rowIndex) => {
      const row = document.createElement('tr');
      
      if (rowIndex < headerRowCount) {
          // Render these rows in thead as headers
          thead.append(row);
      } else {
          // Render remaining rows in tbody
          tbody.append(row);
      }

      [...child.children].forEach((col) => {
          const isHeaderRow = rowIndex < headerRowCount;
          const cell = buildCell(rowIndex, isHeaderRow);
          
          // Copy attributes like rowspan/colspan if present
          if (col.hasAttribute('rowspan')) {
              cell.setAttribute('rowspan', col.getAttribute('rowspan'));
          }
          if (col.hasAttribute('colspan')) {
              cell.setAttribute('colspan', col.getAttribute('colspan'));
          }

          cell.innerHTML = col.innerHTML;
          row.append(cell);
      });
  });

  // Clear the block and append the newly created table
  block.innerHTML = '';
  block.append(table);
}
