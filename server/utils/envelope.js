const buildPagination = ({ page, perPage, total }) => {
  const safePerPage = Math.max(1, Number(perPage) || 1);
  const safePage = Math.max(1, Number(page) || 1);
  const totalPages = Math.max(1, Math.ceil(total / safePerPage));
  return { page: safePage, perPage: safePerPage, total, totalPages };
};

const wrapList = (data, pagination) => ({
  data,
  meta: { pagination: buildPagination(pagination) },
});

const wrapItem = (data, meta) => {
  const out = { data };
  if (meta) out.meta = meta;
  return out;
};

const error = (message, errors) => {
  const out = { message };
  if (errors) out.errors = errors;
  return out;
};

module.exports = { buildPagination, wrapList, wrapItem, error };
