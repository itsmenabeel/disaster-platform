const priorityRank = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const getPriorityRank = (priority) => {
  if (!priority) return 0;
  return priorityRank[String(priority).trim().toLowerCase()] || 0;
};

export const sortByPriorityDesc = (items, getPriority, getDate) =>
  [...items].sort((a, b) => {
    const priorityDiff =
      getPriorityRank(getPriority(b)) - getPriorityRank(getPriority(a));

    if (priorityDiff !== 0) return priorityDiff;

    const dateA = new Date(getDate(a) || 0).getTime();
    const dateB = new Date(getDate(b) || 0).getTime();

    return dateB - dateA;
  });
