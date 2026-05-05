// Parses ?page=&limit= query params, clamps them to safe values,
// and returns { page, limit, skip } ready for use with Mongoose.
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
  const parsedPage = parseInt(query.page, 10);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);

  const parsedLimit = parseInt(query.limit, 10);
  const requested = Number.isNaN(parsedLimit) ? DEFAULT_LIMIT : parsedLimit;
  const limit = Math.min(MAX_LIMIT, Math.max(1, requested));

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildPageMeta = (total, page, limit) => ({
  total,
  page,
  pages: Math.max(1, Math.ceil(total / limit)),
  limit
});

module.exports = { parsePagination, buildPageMeta };
