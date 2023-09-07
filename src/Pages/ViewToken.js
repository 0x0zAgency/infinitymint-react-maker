import React, { Component } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Alert,
    ListGroup,
} from 'react-bootstrap';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import NavigationLink from '../Components/NavigationLink.js';
import Config from '../config.js';
import Token from '../Components/Token.js';
import {
    loadToken,
    loadStickers,
    hasDestination,
    connectWallet,
    tryDecodeURI,
} from '../helpers.js';
import Resources from 'infinitymint-client/dist/src/classic/resources.js';
import TokenURIModal from '../Modals/TokenURIModal.js';
import Loading from '../Components/Loading.js';
import PageController from 'infinitymint-client/dist/src/classic/pageController.js';
import ModController from 'infinitymint-client/dist/src/classic/modController.js';
import ModelBackground from '../Images/bg.jpg';

let _errorTimeout;
class ViewToken extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tokenId: this?.props?.match?.params?.tokenId || 0,
            tokenData: {},
            token: {
                pathSize: 16,
                colours: [],
            },
            stickers: [],
            hasStickers: false,
            tags: {},
            loading: true,
            modChildren: [],
            hasStickerContract: false,
            loadingInterval: null,
            loadingReason: 'Preparing Loading Reasons...',
            loadingReasons: [...Config.loadReasons],
            isValid: false,
            flags: {},
            error: undefined,
            errorTimeout: 30,
            showTokenURIModal: false,
        };
    }

    cleanupError(seconds = 5) {
        clearTimeout(_errorTimeout);
        return new Promise((_resolve, _reject) => {
            _errorTimeout = setTimeout(() => {
                this.setState({
                    error: undefined,
                });
            }, seconds * 1000);
        });
    }

    setError(error) {
        this.setState({
            error: error.message || error.error || error,
        });
        this.cleanupError(5);
    }

    async componentWillUnmount() {
        clearInterval(this.state.loadingInterval);
    }

    async componentDidMount() {
        const interval = setInterval(() => {
            if (!this.state.loading) {
                clearInterval(this.state.loadingInterval);
            }

            this.setState({
                loadingReason:
                    this.state.loadingReasons[
                        Math.floor(
                            Math.random() * this.state.loadingReasons.length
                        )
                    ],
            });
        }, 1000);
        this.setState({
            loadingInterval: interval,
        });

        await this.loadToken();
        this.setState({
            loading: false,
        });

        // {this.state.ens}
        const children = await ModController.callModMethod(
            'getViewTokenSidebarChildren',
            { token: this.state.token }
        );
        this.setState({
            modChildren: Object.values(children),
        });
    }

    async loadToken() {
        try {
            // Load the token and return the flags
            const flags = await loadToken(this, true, true);

            if (this.state.isValid) {
                await loadStickers(this);

                if (this.state.token.owner === controller.accounts[0]) {
                    this.setState({
                        flags,
                    });
                    if (
                        (flags?.emptyTokenURI === true ||
                            flags?.tokenURI === false) &&
                        flags?.dontNotify !== true
                    ) {
                        setTimeout(() => {
                            this.setState({
                                showTokenURIModal: true,
                            });
                        }, 1000);
                    }

                    // Load the stickers
                }
            }
        } catch (error) {
            controller.log('[😞] Error', 'error');
            controller.log(error);
            this.setState({
                isValid: false,
            });
        }
    }

    // TODO: Turn into something more useful
    getBadge() {
        let lastUpdated = Date.now();
        if (this.state?.token?.tokenId !== undefined) {
            lastUpdated =
                storageController.values.tokens[this.state?.token?.tokenId]
                    .validTill;
        }

        return (
            <span className="badge bg-dark fs-6 ms-2">
                Updates {new Date(lastUpdated).toLocaleTimeString()}
            </span>
        );
    }

    render() {
        return (
            <>
                {/** token exists */}
                {this.state.isValid && !this.state.loading ? (
                    <Container key="error" className="p-2 lg: w-75 xl: w-75 sm: p-0 sm: w-100">
                        {this.state.error !== undefined &&
                        this.state.error !== null ? (
                            <Row className="mt-2">
                                <Col>
                                    <Alert
                                        variant="danger"
                                        className="text-center"
                                    >
                                        <p className="display-2">😨</p>
                                        {this.state.error?.message ||
                                            this.state.error}
                                    </Alert>
                                </Col>
                            </Row>
                        ) : (
                            <></>
                        )}
                        
                        <Row className="gy-4 justify-content-center">
                            <Col sm={12} lg={5} md={5} xl={5} xxl={5}>
                                {/** token element is a component */}
                                {this.state.isValid && (
                                    <Row>
                                        <Token
                                            
                                            key={'token_key_' + this.state.tokenId}
                                            theToken={this.state.token}
                                            stickers={this.state.stickers}
                                            
                                            settings={{
                                                showEditButton:
                                                    this.state.token.owner ===
                                                    controller.accounts[0],
                                                hideDescription: true,
                                                
                                                useFresh: true,
                                                onlyBorder: false,
                                                renderOnUpdate: true,
                                                animate: true,
                                                enableThreeJS: false,
                                                downsampleRate3D: 1,
                                                cameraFOV: 69,
                                                cameraPositionZ: 90,
                                                cameraPositionX: 0,
                                                cameraPositionY: 180,
                                                selectable3D: false,
                                                disableFloor3D: true,
                                                ForceBackground: ModelBackground,
                                                showHelpers3D: false,
                                                lightIntensity3D: 50,
                                                lightColour3D: 0xff_ff_ff,
                                                ambientLightIntensity3D: 99,
                                                ambientLightColour3D: 0xff_ff_ff,
                                                rotationSpeed3D: 0.03,
                                            }}
                                        />
                                    </Row>
                                )}
                            </Col>
                            <Col style={{
                                marginLeft: '2.5%',
                                marginRight: '2.5%'
                            }}>
                                <Row className="">
                            <Col hidden={this.state.token.tokenId <= 0}>
                                <div className="d-grid">
                                    <Button
                                        key="previous"
                                        size="sm"
                                        variant="dark"
                                        className="mx-1"
                                        onClick={() => {
                                            window.location.href =
                                                '/view/' +
                                                (Number.parseInt(
                                                    this.state.token.tokenId
                                                ) -
                                                    1);
                                        }}
                                    >
                                        {' '}
                                        ⏪️ PREVIOUS
                                    </Button>
                                </div>
                            </Col>
                            <Col>
                                <span className="badge bg-light text-black">
                                        🆔 {this.state.token.tokenId}
                                        {' '}
                                        Owned by {this.state.token.owner}
                                </span>
                            </Col>
                            <Col
                                hidden={
                                    Number.parseInt(this.state.token.tokenId) >=
                                    controller.getContractValue('totalMints') -
                                        1
                                }
                            >
                                <div className="d-grid">
                                    <Button
                                        key="next"
                                        size="sm"
                                        variant="dark"
                                        className="mx-1"
                                        onClick={() => {
                                            window.location.href =
                                                '/view/' +
                                                (Number.parseInt(
                                                    this.state.token.tokenId
                                                ) +
                                                    1);
                                        }}
                                    >
                                        NEXT ⏩️{' '}
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                            <Row className="">
                            <Col className="text-left">
                            
                            <Card
                                    body
                                    key={Resources.$.UI.Misc.YourToken + this.state.tokenId}
                                    className="bg-black"
                                    hidden={
                                        this.state.token.owner !==
                                        controller.accounts[0]
                                    }
                                >
                                    
                                    <h1
                                        className="mt-0 mb-0 display-5 force-white"
                                        style={{ 
                                           
                                            textShadow: '2px 2px 8px black',
                                            WebkitTextStroke: '1px white '
                                         }}
                                    >
                                        <div
                                            style={{
                                               display: 'relative',
                                                fontSize: '1.5rem',
                                            }}    
                                        >
                                        {Resources.$.UI.Misc.YourToken}:</div>
                                        <span className='rainbow-text-animatedCyber'>
                                        {this.state.token.names?.[0] ||
                                        'Loading...'}&nbsp;
                                        {this.state.token.names?.[1] ||
                                        ''}&nbsp;
                                        {this.state.token.names?.[2] ||
                                        ''}&nbsp;
                                        {this.state.token.names?.[3] ||
                                        ''}&nbsp;
                                        {this.state.token.names?.[4] ||
                                        ''}&nbsp;
                                        {this.state.token.names?.[5] ||
                                        ''}&nbsp;
                                        </span>
                                    
                                    
                                    </h1>
                                    
                                </Card>
                            </Col>
                        </Row>
                            <Card 
                                    body
                                    key="tokenInfo"
                                    >
                                    <div className="d-grid gap-2">
                                        <NavigationLink
                                            key="edit"
                                            location={
                                                '/edit/' + this.state.tokenId
                                            }
                                            variant="info"
                                            hidden={
                                                this.state.token.owner !==
                                                controller.accounts[0]
                                            }
                                            text={
                                                Resources.$.UI.Action.EditToken
                                            }
                                        />
                                        <NavigationLink
                                            key="view"
                                            location={
                                                '/view/' +
                                                this.state.tokenId +
                                                '/content'
                                            }
                                            variant="info"
                                            hidden={
                                                this.state.token.owner !==
                                                controller.accounts[0]
                                            }
                                            text={
                                                Resources.$.UI.Action.ViewToken
                                            }
                                        />
                                        <NavigationLink
                                            key="controls"
                                            location={
                                                '/view/' +
                                                this.state.tokenId +
                                                '/data'
                                            }
                                            variant="info"
                                            hidden={
                                                this.state.token.owner !==
                                                controller.accounts[0]
                                            }
                                            text={'🎛️ Ontoken Control Panel'}
                                        />
                                        <Card
                                            body
                                            key="tokenStickers"
                                            className="mb-2 bg-light shadow"
                                            hidden={
                                                !this.state.hasStickerContract
                                            }
                                        >
                                            <div className="d-grid">
                                                <Alert
                                                    className="text-center text-white"
                                                    variant="danger"
                                                    key="stickerAlert"
                                                >
                                                    <p className="text-center header-subtext">
                                                        📢 EADS.eth
                                                    </p>
                                                    <strong>
                                                        This token has Ethereum
                                                        Ad Service Sponsorship & Monetization
                                                        Support!
                                                    </strong>
                                                </Alert>
                                                <NavigationLink
                                                    key="placeSticker"
                                                    location={
                                                        '/advertise/' +
                                                        this.state.tokenId
                                                    }
                                                    size="md"
                                                    variant="success"
                                                    disabled={
                                                        !this.state
                                                            .hasStickerContract ||
                                                        !controller.isWalletValid
                                                    }
                                                    text={
                                                        Resources.$.UI.Action
                                                            .PlaceSticker
                                                    }
                                                />
                                                {this.state.token.owner ===
                                                    controller.accounts[0] &&
                                                hasDestination(
                                                    this.state.token,
                                                    1
                                                ) ? (
                                                    <NavigationLink
                                                        key="stickerControlCenter"
                                                        className="mt-2"
                                                        location={
                                                            '/edit/' +
                                                            this.state.tokenId +
                                                            '/stickers'
                                                        }
                                                        disabled={
                                                            !this.state
                                                                .hasStickerContract
                                                        }
                                                        variant="warning"
                                                        size="md"
                                                        text={
                                                            Resources.$.UI
                                                                .Action
                                                                .StickerControlCenter
                                                        }
                                                    />
                                                ) : (
                                                    <></>
                                                )}
                                            </div>
                                        </Card>
                                        {this.state.modChildren.map((child, index) => (
                                        <React.Fragment key={index}>
                                            {child}
                                        </React.Fragment>
                                        ))}

                                    </div>
                                </Card>
                                
                            </Col>
                        </Row>
                        <hr />
                        <Row className="pb-2 gy-4">
                            {
                                <Col lg={6} className="gap-2 px-4">
                                    <p className="display-5 text-white glow">
                                        Stickers
                                    </p>

                                    <Card
                                        body
                                        key="stickerInfo"
                                        className="mt-2">
                                        {this.state.hasStickers ? (
                                            <ListGroup
                                                key="stickerList"
                                                >
                                                {this.state.stickers.map(
                                                    (value, index) => (
                                                        <ListGroup.Item
                                                            key={index+"_child"}
                                                        >
                                                            {tryDecodeURI(
                                                                value.sticker
                                                                    .name
                                                            )}{' '}
                                                            <span className="badge bg-dark">
                                                                {
                                                                    value
                                                                        .sticker
                                                                        .owner
                                                                }
                                                            </span>
                                                        </ListGroup.Item>
                                                    )
                                                )}
                                            </ListGroup>
                                        ) : (
                                            <>
                                                {hasDestination(
                                                    this.state.token,
                                                    0
                                                ) ? (
                                                    <Alert
                                                        key="noStickers"
                                                        variant="danger"
                                                        className="text-center text-white"
                                                    >
                                                        <p className="fs-3">
                                                            No Stickers
                                                        </p>
                                                        <p className="fs-6">
                                                            Maybe you could
                                                            change this for this{' '}
                                                            {Resources.projectToken()}{' '}
                                                            owner? Why not add a
                                                            sticker to it. Come
                                                            on, show your love!
                                                        </p>
                                                    </Alert>
                                                ) : (
                                                    <Alert
                                                        key="noStickersContract"
                                                        variant="info"
                                                        className="text-center"
                                                    >
                                                        <p className="fs-3">
                                                            No Sticker Contract
                                                        </p>
                                                        {this.state.token
                                                            .owner !==
                                                        controller
                                                            .accounts[0] ? (
                                                            <p className="fs-6">
                                                                This token
                                                                holder has yet
                                                                to asign an
                                                                Ethereum Ad
                                                                Service sticker
                                                                contract to to
                                                                their token,
                                                                maybe you should
                                                                magic ping them!
                                                            </p>
                                                        ) : (
                                                            <p>
                                                                You can head to
                                                                the launchpad to
                                                                set up the
                                                                needed bits in
                                                                order to get
                                                                your stickers
                                                                online!
                                                            </p>
                                                        )}
                                                    </Alert>
                                                )}
                                            </>
                                        )}
                                        {this.state.token.owner !==
                                            controller.accounts[0] &&
                                        hasDestination(this.state.token, 1) ? (
                                            <>
                                                <div className="d-grid mt-2">
                                                    <NavigationLink
                                                        key="placeSticker"
                                                        location={`/advertise/${this.state.token?.tokenId}`}
                                                        disabled={
                                                            !this.state
                                                                .hasStickerContract ||
                                                            !controller.isWalletValid
                                                        }
                                                        text={
                                                            Resources.$.UI
                                                                .Action
                                                                .PlaceSticker
                                                        }
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {this.state.token.owner ===
                                                    controller.accounts[0] &&
                                                hasDestination(
                                                    this.state.token,
                                                    1
                                                ) ? (
                                                    <div className="d-grid mt-2">
                                                        <NavigationLink
                                                            key="infinityLaunchpad"
                                                            location={`/edit/${this.state.token?.tokenId}/deploy`}
                                                            variant="warning"
                                                            text={
                                                                '🚀 Launchpad' // TODO: Replace with line in resources file
                                                            }
                                                        />
                                                    </div> ? (
                                                        hasDestination(
                                                            this.state.token,
                                                            1
                                                        )
                                                    ) : (
                                                        <div className="d-grid mt-2">
                                                            <NavigationLink
                                                                key="placeStickers_m"
                                                                location={`/advertise/${this.state.token?.tokenId}`}
                                                                disabled={
                                                                    !this.state
                                                                        .hasStickerContract ||
                                                                    !controller.isWalletValid
                                                                }
                                                                text={
                                                                    Resources.$
                                                                        .UI
                                                                        .Action
                                                                        .PlaceStickers
                                                                }
                                                            />
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="d-grid mt-2">
                                                        <NavigationLink
                                                            key="placeStickers"
                                                            disabled={true}
                                                            location={`/advertise/${this.state.token?.tokenId}`}
                                                            text={
                                                                Resources.$.UI
                                                                    .Action
                                                                    .PlaceStickers
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </Card>
                                </Col>
                            }
                            <Col lg={2} sm={12} xl={2} className="px-4">
                            <p className="display-5 text-white glow">
                                    Marketplaces
                                </p>

                                <Card body className="mt-2">
                                    <ListGroup
                                        key={'marketplaces'}
                                        >
                                        <ListGroup.Item 
                                            key={'OpenSea_' + this.state.token?.tokenId}
                                            className="bg-dark fs-5"
                                        >
                                            <a
                                                className="text-info text-decoration-none"
                                                href={controller.getCollectionURL(
                                                    this.state.token?.tokenId ||
                                                        0
                                                )}
                                            >
                                                OpenSea
                                            </a>
                                        </ListGroup.Item>
                                    </ListGroup>
                                    
                                </Card>

                                <Button
                                            className='m-2'
                                            variant="light"
                                            size="sm"
                                            onClick={async () => {
                                                try {
                                                    delete storageController
                                                        .values.tokens[
                                                        this.state.tokenId
                                                    ];
                                                    storageController.saveData();

                                                    this.setState({
                                                        token: {
                                                            pathSize: 0,
                                                            colours: [],
                                                            stickers: [],
                                                        },
                                                        loading: true,
                                                        isValid: false,
                                                    });

                                                    await this.componentDidMount();
                                                } catch (error) {
                                                    this.setError(error);
                                                }
                                            }}
                                        >
                                            {Resources.$.UI.Action.Refresh}
                                        </Button>

                            </Col>
                        </Row>
                        <hr />
                        <Row className="mt-4">
                            <Col>
                                <div className="d-grid gap-2">
                                    <NavigationLink
                                        key="myTokens"
                                        location={'/mytokens'}
                                        variant="dark"
                                        size="lg"
                                        text={Resources.$.UI.Action.MyTokens}
                                    />
                                </div>
                            </Col>
                        </Row>
                        {/** token doesn't exist */}
                        <TokenURIModal
                            key={'TokenURIModal' + this.state.token?.tokenId}
                            show={this.state.showTokenURIModal}
                            theToken={this.state.token}
                            stickers={this.state.stickers}
                            onHide={() => {
                                this.setState({
                                    showTokenURIModal: false,
                                });
                            }}
                        />
                        <br />
                        <br />
                        <br />
                    </Container>
                ) : (
                    <Container
                        key="Loader"
                        >
                        {this.state.loading ? (
                            <Loading />
                        ) : (
                            <Row className="mt-4">
                                <Col className="text-center text-white">
                                    {!controller.isWalletValid ? (
                                        <div className="d-grid mt-2 gap-2 text-center">
                                            <Alert 
                                                key="noWallet"
                                                variant="danger">
                                                <h3>
                                                    Sorry to put a stop to your
                                                    travels....
                                                </h3>
                                                You need to connect your web3
                                                wallet in order to view a{' '}
                                                {Resources.projectToken().toLowerCase()}
                                            </Alert>
                                            <Button
                                                onClick={() => {
                                                    window.open(
                                                        controller.getCollectionURL(
                                                            this.state.tokenId
                                                        )
                                                    );
                                                }}
                                                variant="danger"
                                                className="bg-dark text-white"
                                                key="viewOnOpenSea"
                                            >
                                                View Token On Opensea
                                            </Button>
                                            <Button
                                                key="connectWallet"
                                                variant="dark"
                                                className="ms-2"
                                                onClick={async () => {
                                                    await connectWallet();
                                                }}
                                            >
                                                Connect Wallet
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="display-2 zombieTextRed  text-white">
                                                Cant Find That Token...
                                            </p>
                                            <p className="fs-5 bg-danger text-white pb-2 pt-2">
                                                It might be loading or this{' '}
                                                {Resources.projectToken()} might
                                                not exists....
                                            </p>
                                            <img
                                                alt="#"
                                                className="img-fluid"
                                                src={Config.getImage(
                                                    'defaultImage'
                                                )}
                                            />
                                            <div className="d-grid mt-2 gap-2">
                                                <Button
                                                    key="refreshBtn"
                                                    variant="light"
                                                    size="lg"
                                                    onClick={async () => {
                                                        try {
                                                            delete storageController
                                                                .values.tokens[
                                                                this.state
                                                                    .tokenId
                                                            ];
                                                            storageController.saveData();

                                                            this.setState({
                                                                token: {
                                                                    pathSize: 0,
                                                                    colours: [],
                                                                    stickers:
                                                                        [],
                                                                },
                                                                error: null,
                                                                loading: true,
                                                                isValid: false,
                                                            });

                                                            await this.componentDidMount();
                                                        } catch (error) {
                                                            this.setError(
                                                                error
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {
                                                        Resources.$.UI.Action
                                                            .Refresh
                                                    }
                                                </Button>
                                                <NavigationLink
                                                    key="mintToken"
                                                    location="/mint"
                                                    text={
                                                        Resources.$.UI.Action
                                                            .MintToken
                                                    }
                                                />
                                                <NavigationLink
                                                    key="homeBtn"
                                                    location="/"
                                                    text={'🧱 Home'}
                                                />
                                                <NavigationLink
                                                    key="myTokens"
                                                    location={'/mytokens'}
                                                    text={
                                                        Resources.$.UI.Action
                                                            .MyTokens
                                                    }
                                                />
                                            </div>
                                        </>
                                    )}
                                </Col>
                            </Row>
                        )}
                    </Container>
                )}
                <br />
                <br />
                <br />
            </>
        );
    }
}

ViewToken.url = '/view/:tokenId';
ViewToken.id = 'ViewToken';
ViewToken.settings = {};

PageController.registerPage(ViewToken);
export default ViewToken;
