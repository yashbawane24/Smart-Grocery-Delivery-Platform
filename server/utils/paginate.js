const paginate = (req, defaultLimit = 20, maxLimit = 100) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || defaultLimit, 1),
    maxLimit
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

module.exports = paginate;
