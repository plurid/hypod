import express from 'express';



export const cleanFileName = (
    name: string,
) => {
    return name.replace(/\//, '-');
}



export const getRoutes = (
    instance: express.Express,
) => {
    const routes = instance._router.stack           // registered routes
                    .filter((r: any) => r.route)    // take out all the middleware
                    .map((r: any) => r.route.path)  // get all the paths

    return routes;
}
