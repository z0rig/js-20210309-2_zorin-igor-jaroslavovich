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

// const data = [
//   'Соска (пустышка) NUK 10729357',
//   'ТВ тюнер D-COLOR  DC1301HD',
//   'Детский велосипед Lexus Trike Racer Trike',
//   'Соска (пустышка) Philips SCF182/12',
//   'Powerbank аккумулятор Hiper SP20000'
// ];

// const expectedAsc = [
//   'Детский велосипед Lexus Trike Racer Trike',
//   'Соска (пустышка) NUK 10729357',
//   'Соска (пустышка) Philips SCF182/12',
//   'ТВ тюнер D-COLOR  DC1301HD',
//   'Powerbank аккумулятор Hiper SP20000'
// ];

// const expectedDesc = [
//   'Powerbank аккумулятор Hiper SP20000',
//   'ТВ тюнер D-COLOR  DC1301HD',
//   'Соска (пустышка) Philips SCF182/12',
//   'Соска (пустышка) NUK 10729357',
//   'Детский велосипед Lexus Trike Racer Trike'
// ];

// console.log('asc', sortStrings(data));
// console.log('desc', sortStrings(data, 'desc'));
