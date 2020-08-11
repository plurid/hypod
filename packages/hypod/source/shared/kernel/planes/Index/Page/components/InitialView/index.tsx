/** [START] imports */
/** libraries */
import React from 'react';

import {
    PluridPureButton,
} from '@plurid/plurid-ui-react';


/** external */
import hypodLogo from '../../assets/hypod-logo.png';


/** internal */
import {
    StyledInitialView,
} from './styled';
/** [END] imports */



/** [START] component */
export interface InitialViewProperties {
    /** required */
    /** - values */
    /** - methods */
    setView: React.Dispatch<React.SetStateAction<string>>;

    /** optional */
    /** - values */
    /** - methods */
}

const InitialView: React.FC<InitialViewProperties> = (
    properties,
) => {
    /** properties */
    const {
        /** required */
        /** - values */
        /** - methods */
        setView,

        /** optional */
        /** - values */
        /** - methods */
    } = properties;


    /** render */
    return (
        <StyledInitialView>
            <div>
                <img
                    src={hypodLogo}
                    alt="hypod logo"
                    height={250}
                />
            </div>

            <h1>
                hypod
            </h1>

            <h2>
                Cloud-Native Imagene Registry
            </h2>

            <div
                style={{
                    width: '200px',
                    margin: '50px auto',
                }}
            >
                <PluridPureButton
                    text="Initial Setup"
                    atClick={() => {
                        setView('setup')
                    }}
                    level={2}
                />
            </div>
        </StyledInitialView>
    );
}


export default InitialView;
/** [END] component */
