const paginate = (items, { page = 1, perPage = 12 } = {}) => {
  const safePerPage = Math.max(1, Number(perPage) || 12);
  const safePage = Math.max(1, Number(page) || 1);
  const total = items.length;
  const start = (safePage - 1) * safePerPage;
  const slice = items.slice(start, start + safePerPage);
  return {
    items: slice,
    pagination: {
      page: safePage,
      perPage: safePerPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / safePerPage)),
    },
  };
};

module.exports = { paginate };
