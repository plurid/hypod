// #region imports
    // #region libraries
    import React, {
        useState,
    } from 'react';

    import { AnyAction } from 'redux';
    import { connect } from 'react-redux';
    import { ThunkDispatch } from 'redux-thunk';

    import {
        universal,
    } from '@plurid/plurid-ui-components-react';
    // #endregion libraries


    // #region external
    import hypodLogo from '../../assets/hypod-logo.png';

    import client from '~kernel-services/graphql/client';
    import {
        LOGIN,
    } from '~kernel-services/graphql/mutate';

    import {
        getNamespaces,
        getProjects,
        getImagenes,
    } from '~kernel-services/logic/queries';

    import { AppState } from '~kernel-services/state/store';
    import StateContext from '~kernel-services/state/context';
    import selectors from '~kernel-services/state/selectors';
    import actions from '~kernel-services/state/actions';
    // #endregion external


    // #region internal
    import {
        StyledPrivateView,
        StyledLoginButtons,
        StyledLoginButton,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const {
    buttons: {
        PureButton: PluridPureButton,
    },
    inputs: {
        InputLine: PluridInputLine,
    },
} = universal;


export interface PrivateViewOwnProperties {
    // #region required
        // #region values
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

export interface PrivateViewStateProperties {
}

export interface PrivateViewDispatchProperties {
    dispatchSetViewType: typeof actions.view.setViewType;
    dispatchViewOwnerID: typeof actions.view.setViewOwnerID;
    dispatchSetData: typeof actions.data.setData;
}

export type PrivateViewProperties = PrivateViewOwnProperties
    & PrivateViewStateProperties
    & PrivateViewDispatchProperties;

const PrivateView: React.FC<PrivateViewProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional

        // #region dispatch
        dispatchSetViewType,
        dispatchViewOwnerID,
        dispatchSetData,
        // #endregion dispatch
    } = properties;
    // #endregion properties


    // #region state
    const [
        identonym,
        setIdentonym
    ] = useState('');
    const [
        key,
        setKey
    ] = useState('');
    const [
        error,
        setError
    ] = useState('');
    // #endregion state


    // #region handlers
    const login = async () => {
        try {
            setError('');

            if (!identonym || !key) {
                setError('identonym and key required.');
                return;
            }

            const input = {
                identonym,
                key,
            };

            const mutation = await client.mutate({
                mutation: LOGIN,
                variables: {
                    input,
                },
            });

            const response = mutation.data.login;

            if (!response.status) {
                setError('something is wrong. try again.');
                return;
            }

            const owner = response.data;

            getNamespaces(dispatchSetData);
            getProjects(dispatchSetData);
            getImagenes(dispatchSetData);

            dispatchViewOwnerID(owner.id);
            dispatchSetViewType({
                type: 'indexView',
                value: 'general',
            });
        } catch (error) {
            return;
        }
    }

    const handleEnter = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            login();
        }
    }
    // #endregion handlers


    // #region render
    return (
        <StyledPrivateView>
            <div>
                <img
                    src={hypodLogo}
                    alt="hypod logo"
                    height={250}
                />
            </div>

            <h1>
                hypod private usage
            </h1>

            <StyledLoginButtons>
                <PluridInputLine
                    name="identonym"
                    text={identonym}
                    atChange={(event) => setIdentonym(event.target.value)}
                    atKeyDown={handleEnter}
                />

                <PluridInputLine
                    name="key"
                    text={key}
                    atChange={(event) => setKey(event.target.value)}
                    atKeyDown={handleEnter}
                    type="password"
                />

                <div
                    style={{
                        minHeight: '30px'
                    }}
                >
                    {error}
                </div>
            </StyledLoginButtons>

            <StyledLoginButton>
                <PluridPureButton
                    text="Login"
                    atClick={() => login()}
                    level={2}
                />
            </StyledLoginButton>
        </StyledPrivateView>
    );
    // #endregion render
}


const mapStateToProperties = (
    state: AppState,
): PrivateViewStateProperties => ({
});


const mapDispatchToProperties = (
    dispatch: ThunkDispatch<{}, {}, AnyAction>,
): PrivateViewDispatchProperties => ({
    dispatchSetViewType: (
        payload,
    ) => dispatch(
        actions.view.setViewType(payload),
    ),
    dispatchViewOwnerID: (
        payload,
    ) => dispatch(
        actions.view.setViewOwnerID(payload),
    ),
    dispatchSetData: (
        payload,
    ) => dispatch(
        actions.data.setData(payload),
    ),
});
// #endregion module



// #region exports
export default connect(
    mapStateToProperties,
    mapDispatchToProperties,
    null,
    {
        context: StateContext,
    },
)(PrivateView);
// #endregion exports
