const storageDownload = async (
    filename: string,
) => {
 
}


const storageUpload = async (
    filename: string,
) => {
    
}


const storageObliterate = async (
    filename: string,
) => {
  
}


const filesystemStorage = {
    download: storageDownload,
    upload: storageUpload,
    obliterate: storageObliterate,
};


export default filesystemStorage;
