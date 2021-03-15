/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const LOCALE = 'ru';
  const COLLATOR_OPTIONS = {
    caseFirst: 'upper',
    sensitivity: 'case',
  };

  const sortingArr = [...arr];

  sortingArr.sort(
    (a, b) => {
      if (param === 'desc') {
        [a, b] = [b, a];
      }

      return new Intl.Collator(LOCALE, COLLATOR_OPTIONS).compare(a, b);
    }
  );

  return sortingArr;
}
