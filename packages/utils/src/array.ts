/**
 * Splits an array into chunks of the specified size
 * @param arr Array to chunk
 * @param size Size of each chunk
 * @returns Array of chunks
 */
export const chunk = <T>(arr: T[], size: number): T[][] => {
  if (!arr.length || size <= 0) return [];
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
};

/**
 * Returns a new array with unique values
 * @param arr Array to filter
 * @returns Array with unique values
 */
export const unique = <T>(arr: T[]): T[] => {
  return Array.from(new Set(arr));
};

/**
 * Returns a new array with unique values by a specified key
 * @param arr Array of objects
 * @param key Key to use for uniqueness
 * @returns Array with unique values by key
 */
export const uniqueBy = <T, K extends keyof T>(arr: T[], key: K): T[] => {
  const seen = new Set<T[K]>();
  return arr.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Returns a shuffled copy of the array
 * @param arr Array to shuffle
 * @returns Shuffled array
 */
export const shuffle = <T>(arr: T[]): T[] => {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Groups array items by a specified key
 * @param arr Array to group
 * @param key Key to group by
 * @returns Object with groups
 */
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

/**
 * Returns the first n items from an array
 * @param arr Array to take from
 * @param n Number of items to take
 * @returns First n items
 */
export const take = <T>(arr: T[], n: number): T[] => {
  if (n <= 0) return [];
  return arr.slice(0, n);
};

/**
 * Sorts an array by a specified key
 * @param arr Array to sort
 * @param key Key to sort by
 * @param order Sort order (asc or desc)
 * @returns Sorted array
 */
export const sortBy = <T>(
  arr: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc',
): T[] => {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filters an array by a predicate function
 * @param arr Array to filter
 * @param predicate Function to test each item
 * @returns Filtered array
 */
export const filterBy = <T>(arr: T[], predicate: (item: T) => boolean): T[] => {
  return arr.filter(predicate);
};
