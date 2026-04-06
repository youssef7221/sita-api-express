export function getPagination(query: any) {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const perPage = Math.min(Math.max(parseInt(query.perPage) || 10, 1), 50);

  const skip = (page - 1) * perPage;

  return { page, perPage, skip };
}