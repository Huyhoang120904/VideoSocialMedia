export default interface Page<T> {
  page: Pagination;
  content: T[];
}

interface Pagination {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}
