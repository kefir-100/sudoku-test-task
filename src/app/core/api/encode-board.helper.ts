import type { RawBoard } from '../../models/raw-board';

export const encodeBoardParam = (board: RawBoard): string =>
  encodeURIComponent(board.map((row) => `[${row.join(',')}]`).join(','));

export const encodeFormUrlEncoded = (params: Record<string, RawBoard>): string =>
  Object.entries(params)
    .map(([key, board]) => `${key}=%5B${encodeBoardParam(board)}%5D`)
    .join('&');
