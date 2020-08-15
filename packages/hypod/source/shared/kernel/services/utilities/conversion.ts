// #region module
/**
 * Convert from bytes to human-readable format
 * 
 * https://stackoverflow.com/a/23625419
 * 
 * @param bytes 
 */
export const formatBytes = (
    bytes: number,
) => {
    const marker = 1000; // Change to 1024 if required
    const decimal = 2; // Change as required
    const kiloBytes = marker; // One Kilobyte is 1000 bytes
    const megaBytes = kiloBytes * marker; // One MB is 1000 KB
    const gigaBytes = megaBytes * marker; // One GB is 1000 MB
    const teraBytes = gigaBytes * marker; // One TB is 1000 GB


    // return bytes if less than a KB
    if (bytes < kiloBytes) return bytes + " Bytes";
    
    // return KB if less than a MB
    else if (bytes < megaBytes) return (bytes / kiloBytes).toFixed(decimal) + " KB";
    
    // return MB if less than a GB
    else if (bytes < gigaBytes) return( bytes / megaBytes).toFixed(decimal) + " MB";
    
    // return GB if less than a TB
    else if (bytes < teraBytes) return(bytes / gigaBytes).toFixed(decimal) + " GB";
    
    // return TB
    else return(bytes / teraBytes).toFixed(decimal) + " TB";
}
// #endregion module
