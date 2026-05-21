import { type Member } from '../data/initialData';

/** Nomor absen efektif (DB kadang 0 — pakai sort_order sebagai cadangan) */
export const resolveAbsen = (m: Pick<Member, 'absen' | 'order'>): number => {
  if (typeof m.absen === 'number' && m.absen > 0) return m.absen;
  if (m.order > 0) return m.order;
  return 0;
};

export const formatAbsen = (m: Pick<Member, 'absen' | 'order'>): string => {
  const n = resolveAbsen(m);
  return n > 0 ? String(n) : '—';
};

/** Isi nomor absen yang hilang/0 dari urutan roster */
export const ensureMembersHaveAbsen = (members: Member[]): Member[] => {
  if (members.length === 0) return members;

  const withDerived = members.map((m) => {
    const absen = resolveAbsen(m);
    return absen > 0 ? { ...m, absen } : m;
  });

  if (!withDerived.some((m) => resolveAbsen(m) <= 0)) return withDerived;

  const ordered = [...withDerived].sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name)
  );
  return renumberAbsenList(ordered);
};

export const sortByAbsen = (members: Member[]): Member[] =>
  [...members].sort(
    (a, b) => resolveAbsen(a) - resolveAbsen(b) || a.name.localeCompare(b.name)
  );

export const getNextAbsenNumber = (members: Member[]): number => {
  if (members.length === 0) return 1;
  return Math.max(0, ...members.map((m) => resolveAbsen(m))) + 1;
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
