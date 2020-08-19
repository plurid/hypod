// #region module
const registerNamespace = async (
    name: string,
) => {
    // const id = uuid.generate();

    // const project: Namespace = {
    //     id,
    //     name,
    // };

    // const projectPath = path.join(
    //     projectsPath,
    //     id + '.json',
    // );

    // await fs.writeFile(
    //     projectPath,
    //     JSON.stringify(project, null, 4),
    // );
}


const deregisterNamespace = async (
    id: string,
) => {
    try {
        // const projectPath = path.join(
        //     projectsPath,
        //     id + '.json',
        // );

        // if (!fs.existsSync(projectPath)) {
        //     return;
        // }

        // fs.promises.unlink(projectPath);
    } catch (error) {
        return;
    }
}
// #endregion module



// #region exports
export {
    registerNamespace,
    deregisterNamespace,
};
// #endregion exports
