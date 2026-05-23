import type { SudokuBoard } from '../../../models/sudoku-board';

type GroupKind = 'row' | 'column' | 'box';

export const computeConflictCellIds = (board: SudokuBoard): ReadonlySet<number> => {
  const conflicts = new Set<number>();
  const groups: Record<GroupKind, Map<number, number[]>> = {
    row: new Map(),
    column: new Map(),
    box: new Map(),
  };
  for (const cell of board.cells) {
    if (cell.userValue === 0) {
      continue;
    }
    const trackers: [GroupKind, number][] = [
      ['row', cell.row],
      ['column', cell.column],
      ['box', cell.boxIndex],
    ];
    for (const [kind, group] of trackers) {
      const map = groups[kind];
      const key = group * 10 + cell.userValue;
      const bucket = map.get(key) ?? [];
      bucket.push(cell.id);
      map.set(key, bucket);
    }
  }
  for (const map of Object.values(groups)) {
    for (const ids of map.values()) {
      if (ids.length > 1) {
        for (const id of ids) {
          conflicts.add(id);
        }
      }
    }
  }
  return conflicts;
};
