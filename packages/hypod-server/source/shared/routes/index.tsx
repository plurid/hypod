// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridReactRoute,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import IndexPlane from '../kernel/planes/Index';
    import ImagenePlane from '../kernel/planes/Imagene';
    import NotFoundPlane from '../kernel/planes/NotFound';

    import Head from '../kernel/components/Head';

    import Home from '~kernel-containers/Home';
    // #endregion external
// #endregion imports



// #region module
const indexRoute: PluridReactRoute = {
    value: '/',
    exterior: Home,
    planes: [
        {
            value: '/plane',
            component: IndexPlane,
        },
        {
            value: '/imagene/:id',
            component: ImagenePlane,
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


const notFoundRoute: PluridReactRoute = {
    value: '/not-found',
    exterior: () => (
        <Head
            title="not found · hypod"
        />
    ),
    planes: [
        [ '/not-found', NotFoundPlane ],
    ],
    view: [
        '/not-found',
    ],
};


const routes: PluridReactRoute[] = [
    indexRoute,
    notFoundRoute,
];
// #endregion module



// #region exports
export default routes;
// #endregion exports
