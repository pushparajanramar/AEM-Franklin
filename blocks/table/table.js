/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */

/**
 * Removes all empty divs from the block.
 * @param {HTMLElement} block - The block element to clean up.
 */
function removeEmptyDivs(block) {
  [...block.children].forEach((child) => {
      if (child.tagName === 'DIV' && child.children.length === 0 && child.textContent.trim() === '') {
          child.remove();
      }
  });
}

/**
* Strips the outer div if it contains only one child div after cleanup.
* @param {HTMLElement} block - The block element to check and unwrap.
* @returns {HTMLElement} - The unwrapped child element or the original block.
*/
function stripOuterDiv(block) {
  removeEmptyDivs(block); // Clean up empty divs
  if (block.children.length === 1 && block.firstElementChild.tagName === 'DIV') {
      return block.firstElementChild; // Return the single child div
  }
  return block; // Return the original block if no unwrapping is needed
}

function buildCell(rowIndex, isHeader) {
  const cell = isHeader ? document.createElement('th') : document.createElement('td');
  if (isHeader) cell.setAttribute('scope', 'col');
  return cell;
}

export default async function decorate(block) {
  // Strip the outer div if applicable after removing empty divs
  block = stripOuterDiv(block);

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
