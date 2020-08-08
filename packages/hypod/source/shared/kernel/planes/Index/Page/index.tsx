import React, {
    useState,
    useEffect,
} from 'react';

import { AnyAction } from 'redux';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';


import { AppState } from '#kernel-services/state/store';
import selectors from '#kernel-services/state/selectors';
import actions from '#kernel-services/state/actions';

import {
    StyledPage,
} from './styled';



export interface PageOwnProperties {
}

export interface PageStateProperties {
}

export interface PageDispatchProperties {
}

export type PageProperties = PageOwnProperties
    & PageStateProperties
    & PageDispatchProperties;

const Page: React.FC<PageProperties> = (
    properties,
) => {
    /** properties */
    // const {
    //     // plurid,

    //     /** state */
    // } = properties;


    /** state */
    const [
        view,
        setView,
    ] = useState('');


    /** render */
    let renderView = (<></>);

    // switch (view) {
    // }

    return (
        <StyledPage>
            {renderView}
        </StyledPage>
    );
}


const mapStateToProperties = (
    state: AppState,
): PageStateProperties => ({
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PageDispatchProperties => ({
});


export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
)(Page);
