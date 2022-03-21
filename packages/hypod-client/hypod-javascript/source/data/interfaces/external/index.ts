// #region module
export interface HypodOptions {
    log: boolean;
}

export interface Imagene {
    id: string;
    generatedAt: number;
    name: string;
    latest: string;
    tags: ImageneTag[];
    isPublic: boolean;
}

export interface ImageneTag {
    id: string;
    generatedAt: number;
    name: string;
    size: number;
    digest: string;
}
// #endregion module
