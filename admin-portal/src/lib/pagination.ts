import { HateoasPagedModel, PagedResponse } from "@/types";

const defaultSortState = {
  empty: true,
  sorted: false,
  unsorted: true,
} as const;

function buildEmptyPagedResponse<T>(): PagedResponse<T> {
  return {
    content: [],
    pageable: {
      pageNumber: 0,
      pageSize: 0,
      sort: { ...defaultSortState },
      offset: 0,
      paged: true,
      unpaged: false,
    },
    last: true,
    totalElements: 0,
    totalPages: 0,
    size: 0,
    number: 0,
    sort: { ...defaultSortState },
    first: true,
    numberOfElements: 0,
    empty: true,
  };
}

function extractEmbeddedCollection<T>(
  embedded?: Record<string, T[]>
): T[] {
  if (!embedded) {
    return [];
  }

  const firstCollection = Object.values(embedded).find(
    (value): value is T[] => Array.isArray(value)
  );

  return firstCollection ?? [];
}

export function normalizePagedResult<T>(
  data?: PagedResponse<T> | HateoasPagedModel<T>
): PagedResponse<T> {
  if (!data) {
    return buildEmptyPagedResponse<T>();
  }

  if ("content" in data && Array.isArray(data.content)) {
    return data;
  }

  const hateoasPayload = data as HateoasPagedModel<T>;
  const content = extractEmbeddedCollection(hateoasPayload._embedded);
  const page = hateoasPayload.page;
  const pageNumber = page?.number ?? 0;
  const pageSize = page?.size ?? content.length ?? 0;
  const totalPages =
    page?.totalPages ?? (content.length > 0 ? 1 : 0);
  const totalElements = page?.totalElements ?? content.length ?? 0;

  return {
    content,
    pageable: {
      pageNumber,
      pageSize,
      sort: { ...defaultSortState },
      offset: pageNumber * pageSize,
      paged: true,
      unpaged: false,
    },
    last: page ? pageNumber + 1 >= totalPages : true,
    totalElements,
    totalPages,
    size: pageSize,
    number: pageNumber,
    sort: { ...defaultSortState },
    first: pageNumber === 0,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}


