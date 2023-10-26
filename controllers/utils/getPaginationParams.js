export const getPaginationParams = (
  limit,
  page,
  minDefault = 10,
  maxDefault = 1000
) => {
  if (0 < limit < minDefault) {
  } else if (limit > maxDefault) {
    limit = maxDefault;
  } else {
    limit = minDefault;
  }

  const skip = limit * (page - 1);

  return { skip, limit };
};
