function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');
  return cell;
}

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  // Generate the table content
  [...block.children].forEach((child, i) => {
      const row = document.createElement('tr');
      if (i) tbody.append(row);
      else thead.append(row);
      [...child.children].forEach((col) => {
          const cell = buildCell(i);
          cell.innerHTML = col.innerHTML;
          row.append(cell);
      });
  });

  // Replace the block's content with the generated table directly
  block.innerHTML = ''; // Clear the outer block
  block.replaceWith(table); // Replace the outer block (div) with the table
}
