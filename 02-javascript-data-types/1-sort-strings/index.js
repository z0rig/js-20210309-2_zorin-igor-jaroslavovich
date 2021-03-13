/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sortingArr = [...arr];

  sortingArr.sort((a, b) => {
    const caseFirst = param === 'asc' ? 'upper' : 'lower';

    return a
      .localeCompare(
        b,
        'ru',
        {
          sensitivity: 'case',
          caseFirst: caseFirst
        }
      );
  });

  if (param === 'desc') {
    return sortingArr.reverse();
  }
  return sortingArr;
}
