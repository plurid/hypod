// #region imports
import express from 'express';
// #endregion imports



// #region module
export const getBufferData = (
    request: express.Request,
) => {
    const bufferData = Buffer.from(
        (request as any).rawBody.toString('binary'),
        'binary',
    );

    return bufferData;
}
// #endregion module
