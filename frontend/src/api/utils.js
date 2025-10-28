export const normalizePaginatedResponse = (data) => {
  if (Array.isArray(data)) {
    return {
      conteo: data.length,
      count: data.length,
      siguiente: null,
      next: null,
      anterior: null,
      previous: null,
      resultados: data,
      results: data,
    };
  }

  const count = data?.conteo ?? data?.count ?? data?.total ?? data?.meta?.total ?? 0;
  const next = data?.siguiente ?? data?.next ?? null;
  const previous = data?.anterior ?? data?.previous ?? null;
  const results = data?.resultados ?? data?.results ?? data?.items ?? [];

  return {
    ...data,
    conteo: count,
    count,
    siguiente: next,
    next,
    anterior: previous,
    previous,
    resultados: results,
    results,
  };
};
