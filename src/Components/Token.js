import React, { Component } from 'react';
import { Col, Card, Alert } from 'react-bootstrap';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import {
    cutLongString,
    hasDestination,
    loadPath,
    waitSetState,
} from '../helpers.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import modController from 'infinitymint-client/dist/src/classic/modController.js';

class Token extends Component {
    #unmounted = false;

    constructor(props) {
        super(props);

        this.state = {
            renderedToken: <div></div>,
            error: null,
            empty: false,
        };
    }

    async componentDidUpdate() {
        const token = this.props.theToken?.token || this.props.theToken;
        if (Object.values(token).length > 0) {
            try {
                if (this.props.static !== true) {
                    await controller.callUpdateToken(
                        this.state.renderedToken,
                        token,
                        this.props.stickers,
                        this.props.settings
                    );
                }
            } catch (error) {
                if (!this.#unmounted) {
                    this.setState({
                        error,
                    });
                }
            }

            if (this.state.empty === true && !this.#unmounted) {
                this.setState({
                    empty: false,
                });
            }
        } else if (this.state.empty === false && !this.#unmounted) {
            this.setState({
                empty: true,
            });
        }
    }

    async componentDidMount() {
        const token = this.props.theToken?.token || this.props.theToken;
        this.#unmounted = false;
        if (Object.values(token).length > 0) {
            this.setState({
                empty: false,
            });

            try {
                if (!this.#unmounted) {
                    await loadPath(
                        controller.getProjectSettings(),
                        token.pathId
                    );
                }

                if (!this.#unmounted) {
                    await waitSetState(this, {
                        renderedToken: controller.renderToken(
                            token,
                            this.props.stickers,
                            this.props.settings
                        ),
                    });
                }

                if (!this.#unmounted) {
                    await controller.callPostRenderToken(
                        this.state.renderedToken,
                        token,
                        this.props.stickers,
                        this.props.settings
                    );
                }
            } catch (error) {
                controller.log('Could not load path', 'warning');
                controller.log(error);

                if (!this.#unmounted) {
                    this.setState({
                        error,
                    });
                }
            }
        } else {
            this.setState({
                empty: true,
            });
        }
    }

    componentWillUnmount() {
        const token = this.props.theToken?.token || this.props.theToken;
        this.#unmounted = true;
        try {
            controller.callTokenUnmount(
                this.state.renderedToken,
                token,
                this.props.stickers,
                this.props.settings
            );
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        const token = this.props.theToken?.token || this.props.theToken;
        const pathId = token?.pathId || 0;
        const tokenId = token?.tokenId || token?.previewId || 0;

        if (storageController.values.tokens[tokenId] !== undefined) {
            token.flags = {
                ...storageController.values.tokens[tokenId]?.flags,
            };
        }

        const pathSettings = controller.getPathSettings(pathId);
        const computedStyle = {
            padding: pathSettings.padding || '0%',
            backgroundColor:
                pathSettings.hideSecondBorder === true
                    ? 'none'
                    : controller.getTokenExtraColour(token, 'border_1'),
        };

        let rarity;
        if (this.props.settings?.showRarity) {
            rarity = controller.getPathRarity(pathId);

            if (rarity === undefined) {
                rarity = 100;
            }
        }

        if (this.props.settings?.noPadding) {
            computedStyle.padding = 0;
        }

        if (this.state.error === null && this.state.empty === false) {
            try {
                return (
                    <Col
                        lg={this.props.width || null}
                        className={this.props.className || ''}
                    >
                        <div style={this.props.style || {}} className={'p-1 '}>
                            <div
                                style={{
                                    position: 'absolute',
                                    opacity: this.props.settings?.opaqueDetails
                                        ? '0.42'
                                        : '1.0',
                                    zIndex: 2,
                                }}
                                hidden={
                                    this.props.settings?.hideAllBadges === true
                                }
                                className="p-3 fullOpacityOnHover"
                            >
                                <span
                                    className="badge bg-light fs-5 me-2 ms-2 mt-2"
                                    hidden={
                                        this.props.settings?.showEditButton !==
                                        true
                                    }
                                    onClick={this.props.onEditClick}
                                >
                                    ✏️
                                </span>
                                {this.props.settings?.hideTokenId !== true ? (
                                    <>
                                        <span className="badge bg-dark text-white fs-5 mt-2 ms-2 text-center">
                                            <span
                                                style={{
                                                    fontSize: 10,
                                                    paddingRight: 6,
                                                }}
                                            >
                                                tokenid:{' '}
                                            </span>
                                            {tokenId}
                                        </span>
                                    </>
                                ) : (
                                    <> </>
                                )}
                                {this.props?.hidePathName !== true &&
                                this.props?.settings?.hidePathName !== true ? (
                                    <>
                                        <br />
                                        <span className="badge bg-dark text-white fs-5 ms-2 mt-2">
                                            {cutLongString(
                                                pathSettings.name,
                                                this.props?.settings
                                                    ?.pathNameCutLength || 64
                                            )}
                                        </span>
                                    </>
                                ) : (
                                    <></>
                                )}

                                {this.props.settings?.hideModBadges !== true &&
                                modController.isModEnabled('marketplace') &&
                                token.owner === controller.accounts[0] &&
                                token?.tokenId !== undefined ? (
                                    <>
                                        <br />
                                        <span className="badge bg-info text-white fs-6 me-2 ms-2 mt-2">
                                            {storageController.values.tokens[
                                                tokenId
                                            ] !== undefined
                                                ? storageController.values
                                                      .tokens[tokenId].offers
                                                      ?.length || 0
                                                : 0}{' '}
                                            Offers
                                        </span>
                                    </> // Stops previews from showing offers
                                ) : (
                                    <></>
                                )}
                                {this.props?.children}
                                {this.props.settings?.hideLinkBadges !==
                                true ? (
                                    <>
                                        <br />
                                        {!hasDestination(token, 0) ? (
                                            <span className="badge bg-danger text-white fs-6 me-2 ms-2 mt-2">
                                                ❌ Wallet
                                            </span>
                                        ) : (
                                            <span className="badge bg-success text-white fs-6 me-2 ms-2 mt-2">
                                                ✔️ Wallet
                                            </span>
                                        )}
                                        {!hasDestination(token, 1) ? (
                                            <span className="badge bg-danger text-white fs-6 me-2 ms-2 mt-2">
                                                ❌ EADS
                                            </span>
                                        ) : (
                                            <span className="badge bg-success text-white fs-6 me-2 ms-2 mt-2">
                                                ✔️ EADS
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <></>
                                )}
                            </div>
                            <div
                                className="d-grid "
                                onClick={this.props?.onClick || null}
                                style={{
                                    filter: this.props?.disabled
                                        ? 'brightness(50%)'
                                        : 'brightness(100%)',
                                }}
                            >
                                {React.isValidElement(
                                    this.state.renderedToken
                                ) ? (
                                    <div
                                        className="d-grid renderedToken"
                                        style={computedStyle}
                                    >
                                        {this.state.renderedToken}
                                    </div>
                                ) : (
                                    <div
                                        className="d-grid renderedToken"
                                        style={computedStyle}
                                        dangerouslySetInnerHTML={{
                                            __html: this.state.renderedToken,
                                        }}
                                    ></div>
                                )}
                            </div>
                        </div>
                        {this.props.settings?.hideDescription !== true ? (
                            <Card
                                body
                                style={{ minHeight: 120 }}
                                className={
                                    'mt-2 pt-2 ' +
                                    (this.props?.settings?.noBorder
                                        ? 'border-0'
                                        : '')
                                }
                            >
                                <h1
                                    className="fs-5 mt-2 pb-2 text-center text-wrap"
                                    hidden={this.props?.settings?.hideName}
                                >
                                    {token.name}
                                </h1>
                                {this.props?.settings?.hideAllTags !== true ? (
                                    <>
                                        {controller.accounts[0] ===
                                        token.owner ? (
                                            <span className="badge bg-success">
                                                Owner
                                            </span>
                                        ) : (
                                            <></>
                                        )}
                                        {this.props?.settings
                                            ?.extraPathNameBadge === true ? (
                                            <span className="badge bg-info ms-1 me-1">
                                                {cutLongString(
                                                    pathSettings.name,
                                                    16
                                                )}
                                            </span>
                                        ) : (
                                            <></>
                                        )}
                                        {controller.accounts[0] ===
                                            token.owner &&
                                        token?.flags?.emptyTokenURI ? (
                                            <span
                                                className="badge bg-danger me-1"
                                                style={{
                                                    textDecoration: 'underline',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => {
                                                    window.location.href =
                                                        '/edit/' +
                                                        tokenId +
                                                        '/tokenuri';
                                                }}
                                            >
                                                Empty TokenURI
                                            </span>
                                        ) : (
                                            <></>
                                        )}
                                        {controller.accounts[0] ===
                                            token.owner &&
                                        token?.flags?.tokenURI === false ? (
                                            <span
                                                className="badge bg-danger me-1"
                                                style={{
                                                    textDecoration: 'underline',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => {
                                                    window.location.href =
                                                        '/edit/' +
                                                        tokenId +
                                                        '/tokenuri';
                                                }}
                                            >
                                                Default TokenURI
                                            </span>
                                        ) : (
                                            <></>
                                        )}
                                        {controller.accounts[0] ===
                                            token.owner &&
                                        token?.flags?.checkedTokenURI ===
                                            false ? (
                                            <span className="badge bg-warning me-1">
                                                Unchecked TokenURI
                                            </span>
                                        ) : (
                                            <></>
                                        )}
                                        {this.props?.settings?.showRarity ===
                                        true ? (
                                            <span className="badge bg-dark ms-1 me-1">
                                                {rarity}% Rarity
                                            </span>
                                        ) : (
                                            <></>
                                        )}
                                    </>
                                ) : (
                                    <></>
                                )}
                                {this.props.element || <></>}
                            </Card>
                        ) : (
                            <></>
                        )}
                    </Col>
                );
            } catch (error) {
                controller.log('[😞] Invalid Apperance', 'error');
                controller.log(error);
                this.setState({ error });
            }
        } else if (this.state.error !== null) {
            return (
                <Col>
                    <div className="d-grid">
                        <Alert variant="danger">
                            <p className="fs-1 mb-2 text-center">🤢</p>
                            <p className="text-center mb-0">
                                <span className="badge bg-danger fs-6 ">
                                    ERROR!
                                </span>
                            </p>
                            <p className="fs-4 text-center">
                                {this.state?.error?.message}
                            </p>
                            <h3 className="fs-5 mt-3 text-center">
                                Raw Token Data
                                <br />
                                <span
                                    className="badge bg-danger"
                                    style={{ fontSize: 12 }}
                                >
                                    tokenId {tokenId}
                                </span>
                            </h3>
                            <code className="mt-3">
                                <pre
                                    style={{ height: 120 }}
                                    className="bg-dark force-white p-2 mt-3"
                                >
                                    {JSON.stringify(
                                        this.props.theToken,
                                        null,
                                        2
                                    )}
                                </pre>
                            </code>
                        </Alert>
                    </div>
                </Col>
            );
        } else {
            return (
                <Col>
                    <div className="d-grid">
                        <Alert variant="danger" className="text-center">
                            <p className="fs-2">Empty</p>
                            Token Component is empty and has not been
                            initialized correctly
                        </Alert>
                    </div>
                </Col>
            );
        }
    }
}

export default Token;
