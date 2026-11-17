export type HeartCell = { x: number; y: number };

/** Forty distinct positions: every personal photo has its own place. */
export function createHeartLayout(photoCount: number) {
  if (photoCount <= 40) {
    const rows = [
      [1, 2, 5, 6],
      [0, 1, 2, 3, 4, 5, 6, 7],
      [0, 1, 2, 3, 4, 5, 6, 7],
      [.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5],
      [1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5],
      [3, 4],
      [3.5],
    ];
    return { columns: 8, rows: 8, cells: rows.flatMap((row, y) => row.map(x => ({ x, y }))) };
  }
  let columns = Math.ceil(Math.sqrt(photoCount)) + 2;
  while (true) {
    const cells: HeartCell[] = [];
    const middle = (columns - 1) / 2;
    for (let row = 0; row < columns; row++) {
      for (let col = 0; col < columns; col++) {
        const x = (col - middle) / (middle * .9);
        const y = (middle - row) / (middle * .92);
        if ((x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0) cells.push({ x: col, y: row });
      }
    }
    if (cells.length >= photoCount) return {
      columns, rows: columns,
      cells: Array.from({ length: photoCount }, (_, i) => cells[Math.round(i * (cells.length - 1) / (photoCount - 1))]),
    };
    columns++;
  }
}
