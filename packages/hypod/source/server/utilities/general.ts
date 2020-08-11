// #region module
/**
 * Returns a filesystem-friendly filename.
 *
 * @param name
 */
export const cleanFileName = (
    name: string,
) => {
    return name.replace(/\//, '-');
}
// #endregion module
