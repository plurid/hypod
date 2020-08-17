// #region imports
    // #region libraries
    import {
        Request,
        Response,
        Application,
    } from 'express';
    // #endregion libraries


    // #region external
    import {
        Imagene,
    } from '../general';

    import {
        HypodLogic,
    } from '../logic';
    // #endregion external
// #endregion imports



// #region module
export interface Context {
    request: HypodRequest;
    response: Response;
    instance: Application;
    imagenes: Imagene[];
}


export type HypodRequest = Request & {
    hypodLogic: HypodLogic | undefined;
    rawBody: string | undefined;
}
// #endregion module
