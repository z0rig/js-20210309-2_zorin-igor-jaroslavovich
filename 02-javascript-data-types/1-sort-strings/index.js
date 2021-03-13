/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sortingArr = [...arr];

  sortingArr.sort((a, b) => {
    if ((a !== b) && (a.toLowerCase() === b.toLowerCase())) {
      if (param === 'asc') {
        return -1;
      }
      return 1;
    }
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  if (param === 'desc') {
    return sortingArr.reverse();
  }
  return sortingArr;
}
