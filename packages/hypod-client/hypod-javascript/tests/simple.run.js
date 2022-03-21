const runner = require('@plurid/runner').default;

const Hypod = require('../distribution').default;



const hypod = Hypod(
    'http://localhost:56265/graphql',
    'identonym:private-token',
    {
        log: true,
    },
);


// runner(
//     async (
//         check,
//     ) => {
//         const data = await hypod.imagene.identify('foo/boo');
//         check('identified', !!data, true);
//         console.log({data})
//         if (!data) {
//             return;
//         }

//         // const obliterated = await hypod.imagene.obliterate(data.id);
//         // check('obliterated', obliterated, true);
//     },
// );


// runner(
//     async (
//         check,
//     ) => {
//         const data = await hypod.imagene.identifyTag('foo/boo:coo');
//         check('identified', !!data, true);
//         if (!data) {
//             return;
//         }

//         const {
//             imageneID,
//             tagID,
//         } = data;

//         const obliterated = await hypod.imagene.obliterateTag(
//             imageneID,
//             tagID,
//         );
//         check('obliterated', obliterated, true);
//     },
// );


runner(
    async (
        check,
    ) => {
        const data = await hypod.imagene.identify('foo/boo');
        check('identified', !!data, true);
        if (!data) {
            return;
        }

        const isPublic = await hypod.imagene.togglePublic(
            data.id,
            true,
        );
        check('isPublic', isPublic, true);
    },
);
