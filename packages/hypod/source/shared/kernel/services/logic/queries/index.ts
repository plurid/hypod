// #region imports
    // #region libraries
    import { AnyAction } from 'redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        graphql,
    } from '@plurid/plurid-functions';
    // #endregion libraries

    // #region external
    import client from '#kernel-services/graphql/client';
    import {
        GET_IMAGENES,
        GET_CURRENT_OWNER,
        GET_USAGE_TYPE,
    } from '#kernel-services/graphql/query';

    import actions from '#kernel-services/state/actions';
    // #endregion external
// #endregion imports



// #region module
const getImagenes = async (
    setImagenes: typeof actions.data.setImagenes,
) => {
    const query = await client.query({
        query: GET_IMAGENES,
        fetchPolicy: 'no-cache',
    });

    const response = query.data.getImagenes;

    if (response.status) {
        const imagenes = graphql.deleteTypenames(
            response.data,
        );

        setImagenes(imagenes);
    }
}


/**
 * Get current owner and return true if set.
 *
 * @param setViewOwnerID
 */
const getCurrentOwner = async (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
) => {
    const dispatchSetData: typeof actions.data.setData = (
        payload,
    ) => dispatch(
        actions.data.setData(payload),
    );
    const dispatchSetViewOwnerID: typeof actions.view.setViewOwnerID = (
        id,
    ) => dispatch(
        actions.view.setViewOwnerID(id),
    );


    const query = await client.query({
        query: GET_CURRENT_OWNER,
    });

    const response = query.data.getCurrentOwner;

    if (response.status) {
        const owner = graphql.deleteTypenames(
            response.data,
        );

        const {
            id,
            namespaces,
            projects,
            imagenes,
        } = owner;

        dispatchSetData({
            type: 'namespaces',
            data: namespaces,
        });

        dispatchSetData({
            type: 'projects',
            data: projects,
        });

        dispatchSetData({
            type: 'imagenes',
            data: imagenes,
        });

        dispatchSetViewOwnerID(id);

        return true;
    }

    return;
}


/**
 * Get current owner and return true if set.
 *
 * @param setViewOwnerID
 */
const getUsageType = async (
    setViewUsageType: typeof actions.view.setViewUsageType,
) => {
    const query = await client.query({
        query: GET_USAGE_TYPE,
    });

    const response = query.data.getUsageType;

    if (response.status) {
        const usageType = response.data;
        setViewUsageType(usageType);

        switch (usageType) {
            case 'PRIVATE_USAGE':
                return 'private';
        }
    }

    return;
}
// #endregion module



// #region exports
export {
    getImagenes,
    getCurrentOwner,
    getUsageType,
};
// #endregion exports
