export type PageNumberItem = number | '...';

export function getPageNumbers(current: number, total: number): PageNumberItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: PageNumberItem[] = [1];

  if (current > 4) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 3) pages.push('...');

  pages.push(total);
  return pages;
}
