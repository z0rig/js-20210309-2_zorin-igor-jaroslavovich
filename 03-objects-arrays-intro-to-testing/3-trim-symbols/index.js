/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size = Infinity) {
  const chars = string.split('');

  let matchCounter = 0;
  let prevChar = '';

  const trimChars = chars.map((char) => {
    if (char === prevChar) {
      ++matchCounter;
    } else {
      matchCounter = 0;
    }

    prevChar = char;

    return matchCounter >= size ? '' : char;
  });

  return trimChars.join('');
}
