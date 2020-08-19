// #region module
export interface Imagene {
    id: string;
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


export interface Project {
    id: string;
    name: string;
}


export interface HypodOwner {
    id: string;
}


export interface OwnerToken {
    token: string;
    expires_in: number;
    issued_at: Date;
}
// #endregion module
