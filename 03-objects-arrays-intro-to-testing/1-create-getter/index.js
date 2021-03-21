/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
const PATH_SEPARATOR = '.';

export function createGetter(path) {
  return (obj) => {
    const pathParts = path.split(PATH_SEPARATOR);

    return pathParts
      .reduce(
        (
          currentValue,
          currentPathChunk
        ) => currentValue?.[currentPathChunk], obj);
  };
}
