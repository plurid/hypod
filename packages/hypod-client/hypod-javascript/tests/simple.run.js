const runner = require('@plurid/runner').default;

const Hypod = require('../distribution').default;



runner(
    async (
        check,
    ) => {
        const hypod = new Hypod(
            'localhost:56265',
            '__TEST_MODE__',
        );

        const obliterated = await hypod.imagene.obliterate('some-imagene');

        check(obliterated, true);
    },
);
