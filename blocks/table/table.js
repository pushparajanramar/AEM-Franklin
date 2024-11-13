/*
 * Table Block
 * Recreate a table
 * https://www.hlx.live/developer/block-collection/table
 */


  function buildCell(isHeader) {
    const cell = isHeader ? document.createElement('th') : document.createElement('td');
    if (isHeader) cell.setAttribute('scope', 'col');
    return cell;
  }
  
  export default async function decorate(block) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.append(thead, tbody);
  
    // Track rowspan information
    let headerRowspan = 0;
  
    // Iterate through rows
    [...block.children].forEach((child, rowIndex) => {
      const row = document.createElement('tr');
  
      // Check if this row is within the rowspan range
      const isHeaderRow = headerRowspan > 0 || rowIndex === 0;
  
      // Append to thead or tbody based on header status
      if (isHeaderRow) {
        thead.append(row);
      } else {
        tbody.append(row);
      }
  
      // Build cells for each column
      [...child.children].forEach((col, colIndex) => {
        const isHeader = isHeaderRow || (rowIndex === 0 && colIndex === 0); // Treat rows in rowspan as headers
        const cell = buildCell(isHeader);
  
        // Check and handle rowspan
        const rowspan = col.getAttribute('rowspan');
        if (rowIndex === 0 && colIndex === 0 && rowspan) {
          headerRowspan = parseInt(rowspan, 10) - 1; // Subtract 1 because the current row is already handled
          cell.setAttribute('rowspan', rowspan);
        }
  
        cell.innerHTML = col.innerHTML;
        row.append(cell);
      });
  
      // Decrease headerRowspan for subsequent rows
      if (headerRowspan > 0) {
        headerRowspan--;
      }
    });
  
    // Clear the block and append the new table
    block.innerHTML = '';
    block.append(table);
  }
  