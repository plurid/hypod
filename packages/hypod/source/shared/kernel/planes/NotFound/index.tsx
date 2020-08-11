// #region imports
// #region libraries
import React, {
    useRef,
} from 'react';
// #endregion libraries


// #region internal
import {
    StyledNotFound,
} from './styled';

import faces from './faces';
// #endregion internal
// #endregion imports



// #region module
export interface NotFoundProperties {
}

const NotFound: React.FC<NotFoundProperties> = () => {
    // #region properties
    const faceIndex = useRef(Math.floor(Math.random() * faces.length));
    const face = useRef(faces[faceIndex.current]);
    // #endregion properties


    // #region render
    return (
        <StyledNotFound>
            <h1>
                {face.current}
            </h1>

            <p>
                you searched and it's not here
            </p>
        </StyledNotFound>
    );
    // #endregion render
}


export default NotFound;
// #endregion module
