/**
 * @template T
 * @param {unknown} value
 * @param {T[]} [fallback]
 * @returns {T[]}
 */
export const arrayFromTranslation = (value, fallback = []) => (
  Array.isArray(value) ? value : fallback
);

/**
 * @param {unknown} value
 * @param {Record<string, any>} fallback
 * @returns {Record<string, any>}
 */
export const objectFromTranslation = (value, fallback) => (
  value && typeof value === 'object' && !Array.isArray(value) ? /** @type {Record<string, any>} */ (value) : fallback
);

/**
 * @param {unknown} value
 * @param {string} [fallback]
 * @returns {string}
 */
export const textFromTranslation = (value, fallback = '') => (
  typeof value === 'string' ? value : fallback
);
