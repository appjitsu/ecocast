export const chunk = <T>(arr: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
};

export const unique = <T>(arr: T[]): T[] => {
  return Array.from(new Set(arr));
};

export const shuffle = <T>(arr: T[]): T[] => {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> => {
  return arr.reduce(
    (groups, item) => {
      const value = String(item[key]);
      return {
        ...groups,
        [value]: [...(groups[value] || []), item],
      };
    },
    {} as Record<string, T[]>,
  );
};
