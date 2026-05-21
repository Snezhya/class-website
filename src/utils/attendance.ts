import { type Member } from '../data/initialData';

export const sortByAbsen = (members: Member[]): Member[] =>
  [...members].sort((a, b) => a.absen - b.absen || a.name.localeCompare(b.name));

export const getNextAbsenNumber = (members: Member[]): number => {
  if (members.length === 0) return 1;
  return Math.max(0, ...members.map((m) => m.absen)) + 1;
};

/** Setelah ubah urutan: absen 1..n sesuai posisi */
export const renumberAbsenList = (ordered: Member[]): Member[] =>
  ordered.map((m, i) => ({ ...m, absen: i + 1 }));

export const swapAbsenInList = (
  sorted: Member[],
  index: number,
  direction: 'up' | 'down'
): Member[] => {
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= sorted.length) return sorted;
  const next = [...sorted];
  const tmp = next[index].absen;
  next[index] = { ...next[index], absen: next[target].absen };
  next[target] = { ...next[target], absen: tmp };
  return next.sort((a, b) => a.absen - b.absen);
};
