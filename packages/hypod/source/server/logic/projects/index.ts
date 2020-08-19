// #region module
const registerProject = async (
    name: string,
) => {
    // const id = uuid.generate();

    // const project: Project = {
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


const deregisterProject = async (
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
    registerProject,
    deregisterProject,
};
// #endregion exports
