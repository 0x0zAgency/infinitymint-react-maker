import React, { Component } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Token from '../Components/Token.js';
import NavigationLink from '../Components/NavigationLink.js';
import {
    delay,
    loadToken,
    loadStickers,
    waitSetState,
    call,
} from '../helpers.js';
import FindStickerModal from '../Modals/FindStickerModal.js';
import Config from '../config.js';
import Sticker from '../Components/Sticker.js';
import stickerController from '../stickerController.js';
import PreviewTokenModal from '../Modals/PreviewTokenModal.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import GasMachine from '../Components/GasMachine.js';
import Loading from '../Components/Loading.js';
import Box from '../Components/Box.js';

let _errorTimeout;
class Sponsor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tokenId: this?.props?.match?.params?.tokenId || 0,
            tokenData: {},
            token: {
                pathSize: 13,
                colours: [],
            },
            tags: {},
            stickers: [],
            hasStickers: false,
            stickerPrice: 0,
            error: undefined,
            success: false,
            hasRequests: false,
            requestedStickers: [],
            isValid: false,
            hasSelectedSticker: false,
            selectedSticker: {},
            previewStickers: [],
            showFindStickerModal: false,
            errorTimeout: 40,
        };
    }

    async componentDidMount() {
        await this.start();
    }

    async start() {
        try {
            // Load the token
            await loadToken(this);
            // Load the stickers
            await loadStickers(this);
        } catch {
            this.setState({
                isValid: false,
            });
        }

        // Get my stickers
        await this.getMyRequestedStickers();
    }

    cleanupError(seconds = 5) {
        clearTimeout(_errorTimeout);
        return new Promise((resolve, reject) => {
            _errorTimeout = setTimeout(() => {
                this.setState({
                    error: undefined,
                });
            }, seconds * 1000);
        });
    }

    setError(error) {
        this.setState({
            error: error.message || error[0] || error,
        });
        this.cleanupError(5);
    }

    async getMyRequestedStickers() {
        try {
            // Lets get our requests
            let requestedStickers =
                await stickerController.getMyRequestedStickers();

            if (
                requestedStickers.length === 0 &&
                storageController?.values?.requests[this.state.tokenId] !==
                    undefined
            ) {
                requestedStickers = Object.values(
                    storageController.values?.requests[this.state.tokenId]
                );
            }

            if (requestedStickers.length > 0) {
                this.setState({
                    hasRequests: true,
                    requestedStickers,
                });
            }
        } catch (error) {
            controller.log('[😞] Error', 'error');
            controller.log(error);
        }
    }

    async submitSticker() {
        if (!this.state.hasSelectedSticker) {
            return;
        }

        stickerController.checkSticker(
            this.state.selectedSticker.id,
            true,
            true
        ); // Throws

        await stickerController.sendRequest(this.state.selectedSticker.id);
        const price = await stickerController.getStickerPrice();
        const requestStickers = [...(this.state.requestedStickers || [])];
        requestStickers.push({
            address: controller.accounts[0],
            price,
            request: {
                sticker: {
                    ...storageController.values.stickers[
                        this.state.selectedSticker.id
                    ].final,
                },
                checksum:
                    storageController.values.stickers[
                        this.state.selectedSticker.id
                    ].final.checksum,
                verified: true,
            },
            waiting: true,
            verified: true,
        });
        await waitSetState(this, {
            hasRequests: true,
            requestedStickers: requestStickers,
            success: true,
        });
    }

    render() {
        const copyStickers = [...this.state.stickers];
        if (this.state.hasSelectedSticker) {
            copyStickers.push(this.state.selectedSticker);
        }

        return (
            <>
                {this.state.isValid ? (
                    <Container className>
                        <Row className="mt-5">
                            <Col className="text-center text-white">
                                <h1 className="fs-1 force-white header-text">
                                    Create OnToken Sponsorship{' '}
                                </h1>

                                <p className="fs-6">
                                    Place an Ethereum Ad Service Sponsorship
                                    Sticker (EADS.eth) product onto your{' '}
                                    {resources.token()}
                                </p>
                            </Col>
                        </Row>
                        {this.state.hasRequests ? (
                            <Row>
                                <Col>
                                    <Alert variant="success">
                                        <p className="fs-2">
                                            {resources.$.UI.Responses.Success}
                                        </p>
                                        You currently have an open request.
                                    </Alert>
                                </Col>
                            </Row>
                        ) : null}
                        {this.state.error !== undefined &&
                        this.state.error !== null ? (
                            <Row className="mt-2">
                                <Col>
                                    <Alert variant="danger">
                                        {this.state.error?.message ||
                                            this.state.error}
                                    </Alert>
                                </Col>
                            </Row>
                        ) : (
                            <></>
                        )}
                        {this.state.success === true ? (
                            <Row className="mt-3">
                                <Col>
                                    <Alert variant="success">
                                        <p clasName="fs-2">
                                            {resources.$.UI.Responses.Success}
                                        </p>
                                        Please give it a few minutes to
                                        update... Please do not reissue a
                                        transaction as you will get a revert.
                                        Please try refreshing the web page.
                                    </Alert>
                                </Col>
                            </Row>
                        ) : (
                            <></>
                        )}
                        {this.state.loading ? (
                            <Loading />
                        ) : (
                            <>
                                <Row className="justify-content-center mt-4">
                                    <Col sm={12} md={5} lg={5} xl={5} xxl={5}>
                                        <Token
                                            theToken={this.state.token}
                                            stickers={copyStickers}
                                            settings={{
                                                hideAllBadges: true,
                                                hideDescription: true,
                                                enableThreeJS: false,
                                                downsampleRate3D: 1,
                                                cameraFOV: 69,
                                                cameraPositionZ: 90,
                                                cameraPositionX: 0,
                                                cameraPositionY: 180,
                                                selectable3D: false,
                                                disableFloor3D: true,
                                                //ForceBackground: ModelBackground,
                                                showHelpers3D: false,
                                                lightIntensity3D: 50,
                                                lightColour3D: 0xff_ff_ff,
                                                ambientLightIntensity3D: 99,
                                                ambientLightColour3D: 0xff_ff_ff,
                                                rotationSpeed3D: 0.03,
                                            }}
                                        />
                                    </Col>
                                
                                    <Col
                                        style={{
                                            marginTop: '1rem',
                                        }}
                                    >
                                        <Card body>
                                            <div className="d-grid gap-2">
                                                <Button
                                                    disabled={
                                                        !this.state
                                                            .hasSelectedSticker
                                                    }
                                                    onClick={() => {
                                                        this.setState({
                                                            previewStickers: [
                                                                ...this.state
                                                                    .stickers,
                                                                this.state
                                                                    .selectedSticker,
                                                            ],
                                                            showPreviewModal: true,
                                                        });
                                                    }}
                                                    variant="light"
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .InspectSticker
                                                    }
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        this.setState({
                                                            error: null,
                                                            showFindStickerModal: true,
                                                        });
                                                    }}
                                                    variant="success"
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .Select
                                                    }
                                                </Button>
                                            </div>
                                        </Card>
                                        {this.state.hasSelectedSticker ? (
                                            <>
                                                <Card body>
                                                    <Row className="mt-4 mb-4">
                                                        <Col lg={4}>
                                                            <Sticker
                                                                buttonVariant="primary"
                                                                onClick={async () => {
                                                                    try {
                                                                        this.setState(
                                                                            {
                                                                                error: null,
                                                                                loading: true,
                                                                            }
                                                                        );
                                                                        await this.submitSticker();

                                                                        this.setState(
                                                                            {
                                                                                success: true,
                                                                                hasSelectedSticker: false,
                                                                            }
                                                                        );
                                                                    } catch (error) {
                                                                        this.setError(
                                                                            error
                                                                        );
                                                                        this.setState(
                                                                            {
                                                                                success: false,
                                                                            }
                                                                        );
                                                                    } finally {
                                                                        this.setState(
                                                                            {
                                                                                loading: false,
                                                                            }
                                                                        );
                                                                    }
                                                                }}
                                                                buttonText={
                                                                    'Submit For Approval'
                                                                }
                                                                sticker={
                                                                    this.state
                                                                        .selectedSticker
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            </>
                                        ) : (
                                            <Row>
                                                <Col className="p-4">
                                                    <Alert
                                                        variant="light"
                                                        className="mt-4 text-center"
                                                    >
                                                        Please select a sticker
                                                    </Alert>
                                                </Col>
                                            </Row>
                                        )}
                                        {this.state.error !== null &&
                                        this.state.errorTimeout > Date.now() ? (
                                            <Row>
                                                <Col>
                                                    <Alert
                                                        variant="danger"
                                                        className="text-center"
                                                    >
                                                        <p className="display-2">
                                                            😨
                                                        </p>
                                                        {this.state.error
                                                            ?.message ||
                                                            this.state.error}
                                                    </Alert>
                                                </Col>
                                            </Row>
                                        ) : (
                                            <></>
                                        )}

                                    <Row>
                                    <Col className="text-center text-white">
                                        <h1 className="fs-1 display-5">
                                            Your Sponsorship Requests
                                        </h1>
                                        <p className="fs-6">
                                            They are waiting to be accepted by
                                            the owner
                                        </p>
                                    </Col>
                                </Row>
                                    </Col>
                                </Row>

                                
                                <Row className="mt-2 gy-4 gx-4 row-cols-1">
                                    {this.state.requestedStickers.length ===
                                    0 ? (
                                        <Col>
                                            <Card body>
                                                You have no requests open!
                                            </Card>
                                        </Col>
                                    ) : (
                                        <></>
                                    )}

                                    {this.state.requestedStickers.map(
                                        (sticker, index) => {
                                            if (!sticker.verified) {
                                                return false;
                                            }

                                            return (
                                                <Col>
                                                    <Card body>
                                                        <Row>
                                                            <Sticker
                                                                buttonText={
                                                                    resources.$
                                                                        .UI
                                                                        .Action
                                                                        .Withdraw
                                                                }
                                                                buttonVariant="danger"
                                                                extraButtons={
                                                                    <>
                                                                        <Button
                                                                            variant="light"
                                                                            onClick={() => {
                                                                                this.setState(
                                                                                    {
                                                                                        previewStickers:
                                                                                            [
                                                                                                ...this
                                                                                                    .state
                                                                                                    .stickers,
                                                                                                sticker
                                                                                                    .request
                                                                                                    .sticker,
                                                                                            ],
                                                                                        showPreviewModal: true,
                                                                                    }
                                                                                );
                                                                            }}
                                                                        >
                                                                            {
                                                                                resources
                                                                                    .$
                                                                                    .UI
                                                                                    .Action
                                                                                    .PreviewSticker
                                                                            }
                                                                        </Button>

                                                                        {sticker.waiting !==
                                                                            undefined &&
                                                                        sticker.waiting ? (
                                                                            <Alert variant="warning">
                                                                                Still
                                                                                waiting
                                                                                to
                                                                                be
                                                                                reflected
                                                                                properly.
                                                                                Please
                                                                                wait
                                                                                for
                                                                                it
                                                                                to
                                                                                appear
                                                                                fully.
                                                                            </Alert>
                                                                        ) : (
                                                                            <>

                                                                            </>
                                                                        )}
                                                                    </>
                                                                }
                                                                sticker={
                                                                    sticker
                                                                        .request
                                                                        .sticker
                                                                }
                                                                onClick={async () => {
                                                                    try {
                                                                        this.setState(
                                                                            {
                                                                                loading: true,
                                                                            }
                                                                        );
                                                                        await stickerController.withdrawRequest(
                                                                            index
                                                                        );

                                                                        if (
                                                                            storageController
                                                                                .values
                                                                                .requests[
                                                                                this
                                                                                    .state
                                                                                    .token
                                                                                    .tokenId
                                                                            ] !==
                                                                                undefined &&
                                                                            storageController
                                                                                .values
                                                                                .requests[
                                                                                this
                                                                                    .state
                                                                                    .token
                                                                                    .tokenId
                                                                            ][
                                                                                sticker
                                                                                    .request
                                                                                    .sticker
                                                                                    .id
                                                                            ] !==
                                                                                undefined
                                                                        ) {
                                                                            delete storageController
                                                                                .values
                                                                                .requests[
                                                                                this
                                                                                    .state
                                                                                    .token
                                                                                    .tokenId
                                                                            ][
                                                                                sticker
                                                                                    .request
                                                                                    .sticker
                                                                                    .id
                                                                            ];
                                                                        }

                                                                        storageController.saveData();

                                                                        if (
                                                                            Object.values(
                                                                                storageController
                                                                                    .values
                                                                                    ?.requests[
                                                                                    this
                                                                                        .state
                                                                                        .token
                                                                                        .tokenId
                                                                                ] ||
                                                                                    {}
                                                                            )
                                                                                .length ===
                                                                            0
                                                                        ) {
                                                                            this.setState(
                                                                                {
                                                                                    hasRequests: false,
                                                                                }
                                                                            );
                                                                        }

                                                                        this.setState(
                                                                            {
                                                                                requestedStickers:
                                                                                    Object.values(
                                                                                        this
                                                                                            .state
                                                                                            .requestedStickers ||
                                                                                            {}
                                                                                    ).filter(
                                                                                        (
                                                                                            _sticker
                                                                                        ) =>
                                                                                            _sticker
                                                                                                .request
                                                                                                .sticker
                                                                                                .id !==
                                                                                            sticker
                                                                                                .request
                                                                                                .sticker
                                                                                                .id
                                                                                    ),
                                                                                selectedSticker:
                                                                                    {},
                                                                                hasSelectedSticker: false,
                                                                                success: true,
                                                                            }
                                                                        );
                                                                    } catch (error) {
                                                                        console.log(
                                                                            error
                                                                        );
                                                                        this.setError(
                                                                            error
                                                                        );
                                                                        this.setState(
                                                                            {
                                                                                success: false,
                                                                            }
                                                                        );
                                                                    } finally {
                                                                        this.setState(
                                                                            {
                                                                                loading: false,
                                                                            }
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        </Row>
                                                    </Card>
                                                </Col>
                                            );
                                        }
                                    )}
                                </Row>
                            </>
                        )}
                        <Row>
                            <Col>
                                <Card body>
                                    <div className="d-grid mt-2 gap-2">
                                        <NavigationLink
                                            location={'/sticker/creator'}
                                            text="🎨 Sticker Editor"
                                        />
                                        <NavigationLink
                                            location={
                                                '/view/' + this.state.tokenId
                                            }
                                            text={resources.$.UI.Action.Back}
                                        />
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                        <br />
                        <br />
                        <br />
                    </Container>
                ) : (
                    <Container>
                        <Row className="mt-5">
                            <Col className="text-center">
                                <h1 className="fs-1">Hmmm</h1>
                                <p className="fs-5">
                                    It doesn't appear this token exists....
                                </p>
                                <div className="d-grid mt-2">
                                    <NavigationLink
                                        location="/mint"
                                        text="Mint Token"
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Container>
                )}
                <PreviewTokenModal
                    selectedPreview={this.state.token}
                    stickers={this.state.previewStickers}
                    show={this.state.showPreviewModal}
                    tokenSettings={{
                        hideDescription: true,
                    }}
                    buttonElements={
                        <>
                            <Button
                                variant="light"
                                onClick={() => {
                                    this.setState({
                                        showPreviewModal: false,
                                    });
                                }}
                            >
                                Close
                            </Button>
                        </>
                    }
                    onHide={() => {
                        this.setState({
                            showPreviewModal: false,
                        });
                    }}
                />
                <FindStickerModal
                    onSelected={(sticker) => {
                        let flag = false;
                        if (this.state.requestedStickers.length > 0) {
                            for (const value of this.state.requestedStickers) {
                                if (
                                    value.request.checksum === sticker.checksum
                                ) {
                                    flag = true;
                                }
                            }
                        }

                        if (this.state.stickers.length > 0) {
                            for (const value of this.state.stickers) {
                                if (
                                    value.sticker.checksum === sticker.checksum
                                ) {
                                    flag = true;
                                }
                            }
                        }

                        if (flag === true) {
                            this.setError(
                                new Error('Sticker has already been submitted.')
                            );
                            this.setState({
                                hasSelectedSticker: false,
                                selectedSticker: {},
                                showFindStickerModal: false,
                            });
                        } else {
                            this.setState({
                                hasSelectedSticker: true,
                                selectedSticker: sticker,
                                showFindStickerModal: false,
                            });
                        }
                    }}
                    show={this.state.showFindStickerModal}
                    onHide={() => {
                        this.setState({
                            showFindStickerModal: false,
                        });
                    }}
                />
            </>
        );
    }
}

Sponsor.url = '/advertise/:tokenId';
Sponsor.id = 'Sponsor';
Sponsor.settings = {
    requireWallet: true,
};
export default Sponsor;
