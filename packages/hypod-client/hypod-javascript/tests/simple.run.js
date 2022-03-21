const runner = require('@plurid/runner').default;

const Hypod = require('../distribution').default;



runner(
    async (
        check,
    ) => {
        const hypod = Hypod(
            'http://localhost:56265/graphql',
            'identonym:private-token',
            {
                log: true,
            },
        );

        const data = await hypod.imagene.identify('foo/boo');
        check('identified', !!data, true);
        if (!data) {
            return;
        }

        const obliterated = await hypod.imagene.obliterate(data.id);
        check('obliterated', obliterated, true);
    },
);
