// #region module
export interface Namespace {
    id: string;
    name: string;
    generatedAt: number;
    generatedBy: string;
}


export interface Project {
    id: string;
    name: string;
    generatedAt: number;
    generatedBy: string;
}


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


export interface HypodOwner {
    id: string;

    namespaces: Namespace[];
    projects: Project[];
    imagenes: Imagene[];
}


export interface OwnerToken {
    token: string;
    expires_in: number;
    issued_at: Date;
}
// #endregion module
