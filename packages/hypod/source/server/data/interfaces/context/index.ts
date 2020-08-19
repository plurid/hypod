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
        Namespace,
        Project,
        Imagene,
    } from '../general';

    import {
        HypodLogic,
    } from '../logic';

    import {
        Logger,
        LogLevels,
    } from '../logger';
    // #endregion external
// #endregion imports



// #region module
export interface Context {
    request: HypodRequest;
    response: Response;

    instance: Application;

    namespaces: Namespace[];
    projects: Project[];
    imagenes: Imagene[];

    customLogicUsage: boolean;

    privateUsage: boolean;
    privateOwnerIdentonym: string | undefined;

    logger: Logger;
    logLevel: number;
    logLevels: LogLevels;
}


export type HypodRequest = Request & {
    hypodLogic: HypodLogic | undefined;
    rawBody: string | undefined;
}
// #endregion module
