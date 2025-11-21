/**
 * @param array to shuffle.
 * @returns shuffled list.
 */
export function shuffle<T>(array: T[]): T[] {
  for (let i: number = array.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
