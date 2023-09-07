import React, { Component } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import NavigationLink from '../Components/NavigationLink.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Config from '../config.js';
import { loadToken, loadStickers, waitSetState } from '../helpers.js';
import StickerController from 'infinitymint-client/dist/src/classic/stickerController.js';
import Sticker from '../Components/Sticker.js';
import PreviewTokenModal from '../Modals/PreviewTokenModal.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import Box from '../Components/Box.js';

class StickerControlPanel extends Component {
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
            isValid: false,
            location: '',
            stickerPrice: 0,
            stickers: [],
            hasRequests: false,
            requestedStickers: [],
            showPreviewModal: false,
            previewStickers: [],
            hasStickers: false,
        };
    }

    async getRequestedStickers() {
        try {
            // Lets get our requests
            const requestedStickers = await StickerController.getRequests();

            if (requestedStickers.length > 0) {
                this.setState({
                    hasRequests: true,
                    requestedStickers,
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    async componentDidMount() {
        // Load the token
        await loadToken(this);
        // Load the stickers
        await loadStickers(this);

        if (this.state.token.owner !== controller.accounts[0]) {
            this.setState({
                location: '/view/' + this.state.tokenId,
            });
        } else {
            await this.getRequestedStickers();
        }
    }

    setError(error) {
        this.setState({
            error: error[0]?.message || error.message,
            errorTimeout: Date.now() + Config.settings.errorTimeout,
        });
    }

    render() {
        if (this.state.location !== '') {
            return <Redirect to={'/view/' + this.state.tokenId} />;
        }

        const addrCount = {};

        return (
            <>
                <Container className="p-4 lg: w-75 xl: w-75 sm: p-0 sm: w-100">
                    <Row>
                        <Col className="text-center justify-content-center align-items-center">
                            <h1 className="display-3 test-primary glow">
                                <span className="">
                                    🌎 Sticker Control Center{' '}
                                </span>
                                <br />
                                <span className="badge bg-dark fs-6">
                                    {this.state.token.names?.[0]}
                                </span>
                            </h1>
                            <Box
                                tag={'🪙'}
                                className="fs-5 ms-2 mt-2"
                                variant="success"
                            >
                                Here you can accept and deny new sticker
                                requests as well as see your profits.
                            </Box>
                        </Col>
                    </Row>
                    <Row className="gy-4">
                        <Col lg={4} xl={4} md={4} sm={12}>
                            <Card body>
                                <Alert
                                    variant="dark"
                                    className="text-center fs-4"
                                >
                                    <p className="fs-6">Price Of Utility</p>
                                    💵 {this.state.stickerPrice}{' '}
                                    {Config.getNetwork().token}
                                </Alert>
                                <Alert
                                    variant="dark"
                                    className="text-center fs-4"
                                >
                                    <p className="fs-6">Profits</p>
                                    🤑 0.000
                                    <p className="fs-6 small mt-2">
                                        {
                                            controller.getProjectSettings()
                                                .deployment.stickerSplit
                                        }
                                        % Fee
                                    </p>
                                </Alert>
                                <p className="fs-4">
                                    <span className="badge bg-success">
                                        {this.state.stickers.length} Stickers
                                    </span>{' '}
                                    <span className="badge bg-danger">
                                        {this.state.requestedStickers.length}{' '}
                                        Requests
                                    </span>
                                </p>
                                <div className="d-grid mt-2 gap-2">
                                    <Button variant="light" disabled>
                                        Set Sticker Price
                                    </Button>
                                    <Button variant="light" disabled>
                                        Update Stickers
                                    </Button>
                                    <br />
                                    <Button variant="light" disabled>
                                        🔗 Sticker Contract
                                    </Button>
                                    <Button variant="light" disabled>
                                        🔗 Profit Contract
                                    </Button>
                                    <br />
                                    <Button variant="light" disabled>
                                        Share Sticker Link
                                    </Button>
                                    <br />
                                    <NavigationLink
                                        location={'/view/' + this.state.tokenId}
                                        text={resources.$.UI.Action.ViewToken}
                                        variant="success"
                                    />
                                    <NavigationLink
                                        location={'/sticker/creator'}
                                        text={
                                            resources.$.UI.Action.CreateSticker
                                        }
                                    />
                                    <NavigationLink
                                        location={
                                            '/advertise/' + this.state.tokenId
                                        }
                                        text={
                                            resources.$.UI.Action.PlaceSticker
                                        }
                                    />
                                    <NavigationLink
                                        location={'/mytokens'}
                                        text={resources.$.UI.Action.MyTokens}
                                    />
                                </div>
                            </Card>
                        </Col>
                        <Col lg>
                            {this.state.hasStickers ? (
                                <Row>
                                    <Col>
                                        <Card>
                                            <Card.Header className="fs-4">
                                                ✈️ Live Stickers{' '}
                                                <span className="badge bg-success">
                                                    {this.state.stickers
                                                        ?.length || 0}
                                                </span>
                                            </Card.Header>
                                            <Card.Body>
                                                <Row className="gy-4 gx-4 row-cols-3">
                                                    {this.state.stickers.map(
                                                        (sticker) => {
                                                            if (
                                                                !sticker.verified
                                                            ) {
                                                                return (
                                                                    <Col>
                                                                        <Card
                                                                            body
                                                                        >
                                                                            This
                                                                            sticker
                                                                            has
                                                                            not
                                                                            been
                                                                            verified!
                                                                        </Card>
                                                                    </Col>
                                                                );
                                                            }

                                                            return (
                                                                <Col>
                                                                    <Card body>
                                                                        <Row>
                                                                            <Sticker
                                                                                hideButtons={
                                                                                    true
                                                                                }
                                                                                showExtra={
                                                                                    true
                                                                                }
                                                                                sticker={
                                                                                    sticker.sticker
                                                                                }
                                                                                onClick={() => {}}
                                                                            />
                                                                        </Row>
                                                                    </Card>
                                                                </Col>
                                                            );
                                                        }
                                                    )}
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            ) : (
                                <>
                                    <Alert
                                        variant="light"
                                        className="text-center mt-2"
                                    >
                                        No Stickers Found...
                                    </Alert>
                                </>
                            )}
                            {this.state.hasRequests ? (
                                <Card className="mt-2">
                                    <Card.Header className="fs-4">
                                        🌠 Sticker Requests{' '}
                                        <span className="badge bg-success">
                                            {this.state.requestedStickers
                                                ?.length || 0}
                                        </span>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="gy-4 gx-4 row-cols-3">
                                            {this.state.requestedStickers.map(
                                                (sticker) => {
                                                    if (!sticker.verified) {
                                                        return false;
                                                    }

                                                    if (
                                                        addrCount[
                                                            sticker.address
                                                        ] === undefined
                                                    ) {
                                                        addrCount[
                                                            sticker.address
                                                        ] = 0;
                                                    } else {
                                                        addrCount[
                                                            sticker.address
                                                        ] =
                                                            addrCount[
                                                                sticker.address
                                                            ] + 1;
                                                    }

                                                    return (
                                                        <Col>
                                                            <Card body>
                                                                <Row>
                                                                    <Sticker
                                                                        buttonText={
                                                                            resources
                                                                                .$
                                                                                .UI
                                                                                .Action
                                                                                .Accept
                                                                        }
                                                                        buttonVariant="success"
                                                                        showExtra={
                                                                            true
                                                                        }
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
                                                                                            .Preview
                                                                                    }
                                                                                </Button>
                                                                                <Button
                                                                                    variant="danger"
                                                                                    onClick={async () => {
                                                                                        try {
                                                                                            await StickerController.denyRequest(
                                                                                                sticker.address,
                                                                                                addrCount[
                                                                                                    sticker
                                                                                                        .address
                                                                                                ]
                                                                                            );
                                                                                            const requests =
                                                                                                this.state.requestedStickers.filter(
                                                                                                    (
                                                                                                        thatSticker
                                                                                                    ) =>
                                                                                                        thatSticker
                                                                                                            .request
                                                                                                            .sticker
                                                                                                            .id !==
                                                                                                        sticker
                                                                                                            .request
                                                                                                            .sticker
                                                                                                            .id
                                                                                                );

                                                                                            if (
                                                                                                addrCount[
                                                                                                    sticker
                                                                                                        .address
                                                                                                ] -
                                                                                                    1 <=
                                                                                                0
                                                                                            ) {
                                                                                                delete addrCount[
                                                                                                    sticker
                                                                                                        .address
                                                                                                ];
                                                                                            } else {
                                                                                                addrCount[
                                                                                                    sticker.address
                                                                                                ] =
                                                                                                    addrCount[
                                                                                                        sticker
                                                                                                            .address
                                                                                                    ] -
                                                                                                    1;
                                                                                            }

                                                                                            await waitSetState(
                                                                                                this,
                                                                                                {
                                                                                                    requestedStickers:
                                                                                                        requests,
                                                                                                    hasRequests:
                                                                                                        requests.length >
                                                                                                        0,
                                                                                                }
                                                                                            );
                                                                                        } catch (error) {
                                                                                            this.setError(
                                                                                                error
                                                                                            );
                                                                                            controller.log(
                                                                                                error
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        resources
                                                                                            .$
                                                                                            .UI
                                                                                            .Action
                                                                                            .Reject
                                                                                    }
                                                                                </Button>
                                                                            </>
                                                                        }
                                                                        sticker={
                                                                            sticker
                                                                                .request
                                                                                .sticker
                                                                        }
                                                                        onClick={async () => {
                                                                            try {
                                                                                await StickerController.acceptRequest(
                                                                                    sticker.address,
                                                                                    addrCount[
                                                                                        sticker
                                                                                            .address
                                                                                    ]
                                                                                );
                                                                                const requests =
                                                                                    this.state.requestedStickers.filter(
                                                                                        (
                                                                                            thatSticker
                                                                                        ) =>
                                                                                            thatSticker
                                                                                                .request
                                                                                                .sticker
                                                                                                .id !==
                                                                                            sticker
                                                                                                .request
                                                                                                .sticker
                                                                                                .id
                                                                                    );
                                                                                const stickers =
                                                                                    [
                                                                                        ...this
                                                                                            .state
                                                                                            .stickers,
                                                                                    ];
                                                                                stickers.push(
                                                                                    {
                                                                                        ...sticker,
                                                                                        loading: true,
                                                                                    }
                                                                                );
                                                                                if (
                                                                                    addrCount[
                                                                                        sticker
                                                                                            .address
                                                                                    ] -
                                                                                        1 <=
                                                                                    0
                                                                                ) {
                                                                                    delete addrCount[
                                                                                        sticker
                                                                                            .address
                                                                                    ];
                                                                                } else {
                                                                                    addrCount[
                                                                                        sticker.address
                                                                                    ] =
                                                                                        addrCount[
                                                                                            sticker
                                                                                                .address
                                                                                        ] -
                                                                                        1;
                                                                                }

                                                                                await waitSetState(
                                                                                    this,
                                                                                    {
                                                                                        requestedStickers:
                                                                                            requests,
                                                                                        hasRequests:
                                                                                            requests.length >
                                                                                            0,
                                                                                    }
                                                                                );
                                                                            } catch (error) {
                                                                                this.setError(
                                                                                    error
                                                                                );
                                                                                controller.log(
                                                                                    error
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
                                    </Card.Body>
                                </Card>
                            ) : (
                                <>
                                    <Alert
                                        variant="light"
                                        className="text-center mt-2"
                                    >
                                        No Requests Found...
                                    </Alert>
                                </>
                            )}
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <br />
                </Container>
                <PreviewTokenModal
                    selectedPreview={this.state.token}
                    stickers={this.state.previewStickers}
                    show={this.state.showPreviewModal}
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
            </>
        );
    }
}

StickerControlPanel.url = '/edit/:tokenId/stickers';
StickerControlPanel.id = 'StickerControlPanel';
StickerControlPanel.settings = {
    requireWallet: true,
};

export default StickerControlPanel;
