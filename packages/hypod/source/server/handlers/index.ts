import multer from 'multer';

import PluridServer from '@plurid/plurid-react-server';

import setupGraphQLServer from './graphql';



export const setRouteHandlers = (
    server: PluridServer,
) => {
    const handler = server.handle();
    const instance = server.instance();

    handler.post('/service-check/health', (request, response, next) => {
        response.setHeader('Content-Type', 'application/json');
        response.end(
            JSON.stringify(
                { status: true },
            ),
        );
    });

    instance.post('*', (request, response, next) => {
        console.log(request.body);

        response.setHeader('Content-Type', 'application/json');
        response.end(
            JSON.stringify(
                { status: true },
            ),
        );
    });

    setupGraphQLServer(instance);
}
