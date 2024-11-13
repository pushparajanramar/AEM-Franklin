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

function buildCell(isHeader, colElement) {
  const cell = isHeader ? document.createElement('th') : document.createElement('td');
  if (isHeader) cell.setAttribute('scope', 'col');

  // Copy attributes like rowspan and colspan
  if (colElement.hasAttribute('rowspan')) {
      cell.setAttribute('rowspan', colElement.getAttribute('rowspan'));
  }
  if (colElement.hasAttribute('colspan')) {
      cell.setAttribute('colspan', colElement.getAttribute('colspan'));
  }

  cell.innerHTML = colElement.innerHTML;
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

  let isHeaderGroup = true; // Flag to determine when to switch from header to body rows
  children.forEach((child) => {
      const row = document.createElement('tr');
      const isHeader = isHeaderGroup;

      // Add row to thead or tbody based on the isHeader flag
      if (isHeader) {
          thead.append(row);
      } else {
          tbody.append(row);
      }

      [...child.children].forEach((col) => {
          const cell = buildCell(isHeader, col);
          row.append(cell);
      });

      // Check if this row ends the header group (no more th elements)
      if (child.querySelectorAll('[rowspan], [colspan]').length === 0) {
          isHeaderGroup = false;
      }
  });

  // Clear the block and append the newly created table
  block.innerHTML = '';
  block.append(table);
}
