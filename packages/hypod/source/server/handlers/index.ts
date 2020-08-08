import multer from 'multer';

import PluridServer from '@plurid/plurid-react-server';

import setupGraphQLServer from './graphql';


const upload = multer(
    { dest: __dirname + '/uploads/' }
);


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

    // instance.post('*', (request, response, next) => {
    //     console.log(request.body);

    //     response.setHeader('Content-Type', 'application/json');
    //     response.end(
    //         JSON.stringify(
    //             { status: true },
    //         ),
    //     );
    // });

    instance.post('*', upload.single('hypod'), (request, response, next) => {
        console.log('-------')
        console.log('POST');
        console.log(request);
        console.log('-------')
        console.log(request.body);
        console.log('-------')
        console.log(request.file);
        console.log('-------')

        response.setHeader('Content-Type', 'application/json');
        response.end(
            JSON.stringify(
                { status: true },
            ),
        );
    });

    instance.put('*', upload.single('hypod'), (request, response, next) => {
        console.log('-------')
        console.log('PUT');
        console.log(request);
        console.log('-------')
        console.log(request.body);
        console.log('-------')
        console.log(request.file);
        console.log('-------')

        response.setHeader('Content-Type', 'application/json');
        response.end(
            JSON.stringify(
                { status: true },
            ),
        );
    });

    setupGraphQLServer(instance);
}
