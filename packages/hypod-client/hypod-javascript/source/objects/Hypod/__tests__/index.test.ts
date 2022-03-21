// #region imports
    // #region external
    import Hypod from '../index';
    // #endregion external
// #endregion imports



// #region module
xdescribe('Hypod', () => {
    it('works', (done) => {
        const hypod = new Hypod(
            'localhost:56265',
            '__TEST_MODE__',
        );
    });
});
// #endregion module
