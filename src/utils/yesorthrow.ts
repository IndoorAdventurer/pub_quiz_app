
/**
 * If `key` is present in `obj`, this function returns its value. Else it throws
 * an error
 * @param obj Object that should have `key` as an existing key
 * @param key The key that should be present in `obj`
 * @returns `obj[key]`
 * @throws Error if `obj[key] == undefined`
 */
export function yesOrThrow(obj: {[key: string]: any}, key: string): any {
    return obj[key] || (() => {throw new Error(`${key} not specified`)})();
}