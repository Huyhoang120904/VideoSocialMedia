export default interface Page<T> {
  content: T[];
  number: number;
  totalPages: number;
  totalElements: number;
  size: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}
