// #region imports
import express from 'express';
// #endregion imports



// #region module
export interface Context {
    request: express.Request;
    response: express.Response;
    instance: express.Application;
}


export type StorageType =
    | 'filesystem'
    | 'amazon'
    | 'google';


export type DockerEntityMatchType =
    | 'name'
    | 'reference'
    | 'digest'
    | 'uuid';
// #endregion module
