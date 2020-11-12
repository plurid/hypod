// #region imports
    // #region libraries
    import {
        PluridPreserve,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region external
    import {
        PRIVATE_USAGE,
    } from '#server/data/constants';
    // #endregion external
// #endregion imports



// #region module
const preserves: PluridPreserve<any>[] = [
    {
        serve: '*',
        onServe: async (
            transmission,
        ) => {
            const {
                response,
                context,
            } = transmission;


            if (PRIVATE_USAGE) {
                // check if user is logged in
                // console.log('context', context);

                // response.status(404).end();

                // return {
                //     responded: true,
                // };
            }

            return;
        },
    },
];


export default preserves;
// #endregion module
