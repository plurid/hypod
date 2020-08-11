import React from 'react';

import {
    PluridRoute,
} from '@plurid/plurid-data';

import IndexPlane from '../kernel/planes/Index';
import NotFoundPlane from '../kernel/planes/NotFound';

import Head from '../kernel/components/Head';

import Home from '#kernel-containers/Home';



const indexRoute: PluridRoute = {
    value: '/',
    exterior: {
        kind: 'react',
        element: Home,
    },
    planes: [
        {
            value: '/plane',
            component: {
                kind: 'react',
                element: IndexPlane,
            },
        },
    ],
    view: [
        '/plane',
    ],
    defaultConfiguration: {
        elements: {
            plane: {
                controls: {
                    show: false,
                },
                // width: 0.7,
            },
        },
    },
};


const notFoundRoute: PluridRoute = {
    value: '/not-found',
    exterior: {
        kind: 'react',
        element: () => (
            <Head
                title="not found · performer"
            />
        ),
    },
    spaces: [
        {
            value: 'default',
            universes: [
                {
                    value: 'default',
                    clusters: [
                        {
                            value: 'default',
                            planes: [
                                {
                                    value: '/',
                                    component: {
                                        kind: 'react',
                                        element: NotFoundPlane,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};


const routes: PluridRoute[] = [
    indexRoute,
    notFoundRoute,
];


export default routes;
