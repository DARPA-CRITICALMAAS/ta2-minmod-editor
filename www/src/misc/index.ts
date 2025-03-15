export function join<T>(arr: T[], separator: (index: number) => T): T[] {
  if (arr.length === 0) {
    return [];
  }

  const result: T[] = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    result.push(separator(i));
    result.push(arr[i]);
  }
  return result;
}

// Validate the input reference whether an URl or not
export function isValidUrl(inputURL: string): boolean {
  if (!inputURL.trim()) return false;
  if (inputURL === "") return false;
  try {
    new URL(inputURL);
    return !/\s/.test(inputURL);
  } catch (err) {
    return false;
  }
}
