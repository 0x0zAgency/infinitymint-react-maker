import React, { Component } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import NavigationLink from '../Components/NavigationLink.js';
import Controller from 'infinitymint-client/dist/src/classic/controller.js';
import Config from '../config.js';
import {
    loadToken,
    loadStickers,
    hasDeployment,
    hasDestination,
} from '../helpers.js';
import ResultModal from '../Modals/ResultModal.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import Loading from '../Components/Loading.js';
import modController from 'infinitymint-client/dist/src/classic/modController.js';

let _errorTimeout;
class EditToken extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // eslint-disable-next-line react/prop-types
            tokenId: this?.props?.match?.params?.tokenId || 0,
            tokenData: {},
            token: {
                pathSize: 13,
                colours: [],
                stickers: [],
            },
            tokenURI: {},
            modChildren: [],
            tags: {},
            loading: true,
            loadingReason: 'Preparing Loading Reasons...',
            loadingInterval: null,
            loadingReasons: [...Config.loadReasons],
            finished: false,
            isValid: false,
            stickers: [],
            hasStickers: false,
            location: '',
            error: undefined,
            errorTimeout: 30,
        };
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
        }, 500);
        this.setState({
            loadingInterval: interval,
        });
        await this.loadToken();
        const children = await modController.callModMethod(
            'getViewTokenSidebarChildren',
            { token: this.state.token }
        );
        this.setState({
            modChildren: Object.values(children),
        });
    }

    async loadToken() {
        try {
            // Load the token
            await loadToken(this);

            if (this.state.isValid) {
                try {
                    // Load the stickers
                    await loadStickers(this);
                } catch (error) {
                    console.log(error);
                }

                if (
                    Controller.hasFlag(this.state.tokenId, 'emptyTokenURI') ===
                    false
                ) {
                    this.setState({
                        tokenURI:
                            storageController.values.tokenURI[
                                this.state.tokenId
                            ],
                    });
                }

                if (this.state.token.owner !== Controller.accounts[0]) {
                    this.setState({
                        isValid: false,
                    });
                }
            }

            this.setState({
                loading: false,
                finished: true,
            });
        } catch (error) {
            Controller.log('[😞] Error', 'error');
            Controller.log(error);
            this.setState({
                isValid: false,
            });
        }
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

    render() {
        const projectFile = Controller.getProjectSettings();
        if (this.state.location !== '') {
            return <Redirect to={this.state.location}></Redirect>;
        }

        return (
            <>
                {this.state.isValid &&
                !this.state.loading &&
                this.state.finished ? (
                    <Container className="p-2 lg: w-75 xl: w-100 sm: p-0 sm: w-100">
                        <h1 className="text-center text-white display-5 mt-4">
                           💎 Token & Gem Manager
                        </h1>
                        <Alert variant="success">
                                    <p className="display-9 text-center">
                                InfinityMint ERC721's are more than just NFT's. They are NFTs that can hold other NFTs so you
                                can use them to add on any type of tokenized functionality you could dream of.
                                This page is where you can edit your token's data as
                                well as link your token to smart contracts.
                            </p>
                        </Alert>
                        {(this.state.error !== undefined && this.state.error !== null) 
                        && (
                            <Row>
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
                        )}
                        <Row className="gy-2">
                            <Col className='p-2'>
                                <Alert variant="info" className="p-2">
                                    <h2 className="mb-0 display-9">
                                         Infinity💎Gems
                                    </h2>
                                </Alert>
                                <Card 
                                    body
                                    key="thisKey">
                                    {Object.keys(projectFile.links).map(
                                        (key) => {
                                            const link = projectFile.links[key];
                                            const contract = hasDestination(
                                                this.state.token,
                                                link.index
                                            )
                                                ? this.state.token
                                                      .destinations[
                                                      link.index
                                                  ]
                                                : Config.nullAddress

                                            return (
                                                // eslint-disable-next-line react/jsx-key
                                                <p className='bg-info p-2 rounded'>
                                                    💎 &nbsp;
                                                    <span className="badge bg-dark text-white">
                                                        {link.contract} 
                                                    </span>
                                                    <code className='text-info'> 
                                                         &nbsp;
                                                        <a className='text-white' target='_blank' href={
                                                            Config.getNetwork().tokenscan + "address/" + contract}>
                                                            {contract}
                                                        </a>
                                                    </code>
                                                </p>
                                            );
                                        }
                                    )}
                                    <div className="d-grid">

                                        {this.state.token.owner ===
                                Controller.accounts[0] ? (
                                    <>
                                        <Card body>
                                            <div className="d-grid">
                                                <Alert
                                                    className="mb-2"
                                                    variant="warning"
                                                >
                                                    {Object.keys(
                                                        projectFile.links
                                                    ).map((key) => {
                                                        const link =
                                                            projectFile.links[
                                                                key
                                                            ];
                                                        return (
                                                            <>
                                                                {hasDestination(
                                                                    this.state
                                                                        .token,
                                                                    link.index
                                                                )
                                                                    ? '✔️'
                                                                    : '❌'}{' '}
                                                                {link.title ||
                                                                    key}
                                                                <br />
                                                                {hasDeployment(
                                                                    this.state
                                                                        .token,
                                                                    link.index
                                                                ) &&
                                                                !hasDestination(
                                                                    this.state
                                                                        .token,
                                                                    link.index
                                                                ) ? (
                                                                    <>
                                                                        <span
                                                                            className="small ms-4"
                                                                            style={{
                                                                                textDecoration:
                                                                                    'underline',
                                                                            }}
                                                                        >
                                                                            ❓
                                                                            Needs
                                                                            linking
                                                                            to
                                                                            token
                                                                        </span>
                                                                        <br />
                                                                    </>
                                                                ) : (
                                                                    ''
                                                                )}
                                                            </>
                                                        );
                                                    })}
                                                </Alert>
                                                <NavigationLink
                                                    key="deployLink"
                                                    location={
                                                        '/edit/' +
                                                        this.state.tokenId +
                                                        '/deploy'
                                                    }
                                                    variant="info"
                                                    text={
                                                        '🚀 Launchpad' // TODO: Replace with line in resources file
                                                    }
                                                />
                                            </div>
                                        </Card>
                                    </>
                                ) : (
                                    <></>
                                )}

                                        {this.state.hasStickerContract ? (
                                            <>
                                                <hr />
                                                <NavigationLink
                                                    key="stickerLink"
                                                    location={
                                                        '/edit/' +
                                                        this.state.tokenId +
                                                        '/stickers'
                                                    }
                                                    variant="info"
                                                    text={
                                                        resources.$.UI.Action
                                                            .StickerControlCenter
                                                    }
                                                />
                                                <hr />
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                        <Row>
                                        <Col
                                            xs={6}
                                            sm={6}
                                            md={6}
                                            lg={6}
                                            xl={6}
                                            xxl={6}
                                        >
                                            <NavigationLink
                                                className='w-100 mt-2'
                                                key="backLink"
                                                location={
                                                    '/view/' + this.state.tokenId
                                                }
                                                variant="light"
                                                text={resources.$.UI.Action.Back}
                                            />
                                        </Col>
                                        <Col 
                                            xs={6}
                                            sm={6}
                                            md={6}
                                            lg={6}
                                            xl={6}
                                            xxl={6}
                                        >
                                        <Button
                                            className='w-75 m-2'
                                            key={'refreshButton'}
                                            variant="light"
                                            size="lg"
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
                                            {resources.$.UI.Action.Refresh}
                                        </Button>
                                        </Col>
                                        </Row>
                                        
                                        
                                    </div>
                                </Card>

                                
                            </Col>
                            {/** token element is a component */}
                            {this.state.isValid ? (
                                <Col lg={6} className='p-2'>
                                    <Alert variant="info" className="p-2">
                                    <h2 className="mb-0 display-9">
                                        🖼️ Token URI / Appearance
                                    </h2>
                                </Alert>
                                    <Card
                                        key={'tokenCard_'+this.state.tokenId}
                                    >
                                        <Card.Body className=' text-dark'>
                                            {Controller.hasFlag(
                                                this.state.tokenId,
                                                'emptyTokenURI'
                                            ) ? (
                                                <Alert variant="danger">
                                                    You need to set your
                                                    tokenURI!
                                                </Alert>
                                            ) : (
                                                <>
                                                    <h4>Name</h4>
                                                    <p>
                                                        {
                                                            this.state.tokenURI
                                                                .name
                                                        }
                                                    </p>
                                                    <h4>Image</h4>
                                                    <Card
                                                        body
                                                        key={'tokenImage_' + this.state.tokenId}
                                                        className="shadow bg-light mb-3"
                                                    >
                                                        <Row className="justify-content-center">
                                                            <Col xs={8}>
                                                                <img
                                                                    src={
                                                                        this
                                                                            .state
                                                                            .tokenURI
                                                                            .image
                                                                    }
                                                                    className="mx-auto img-fluid"
                                                                    alt="token URI"
                                                                ></img>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                    <h4>Description</h4>
                                                    <p>
                                                        {this.state.tokenURI
                                                            .description ||
                                                            'Non Available...'}
                                                    </p>
                                                    <Alert
                                                        variant="success"
                                                        className="text-center"
                                                        style={{
                                                            borderRadius: 0,
                                                        }}
                                                    >
                                                        <p className="fs-2">
                                                            😊
                                                        </p>
                                                        This is how your token
                                                        looks to the rest of
                                                        Web3
                                                    </Alert>
                                                </>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ) : (
                                <></>
                            )}
                            <Col>
                            <Alert variant="info" className="p-2">
                                    <h2 className="mb-0 display-9">
                                        🔨 Tools
                                    </h2>
                                </Alert>
                                <Card body className="p-2">
                                    <Row>
                                        <Col>
                                            <div className="d-grid gap-2">
                                                <h4 className="ms-2 mt-1 mb-0 mt-3">
                                                    🧐 Apperance
                                                </h4>

                                                <Button
                                                    key={'editTokenURIButton'}
                                                    variant="success"
                                                    size="sm"
                                                    onClick={async () => {
                                                        this.setState({
                                                            location:
                                                                '/edit/' +
                                                                this.state
                                                                    .tokenId +
                                                                '/tokenuri',
                                                        });
                                                    }}
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .UpdateTokenURI
                                                    }
                                                </Button>
                                                <Button
                                                    key={'inspectTokenURIButton'}
                                                    variant="success"
                                                    size="sm"
                                                    onClick={async () => {
                                                        this.setState({
                                                            loading: true,
                                                        });
                                                        const tokenURI =
                                                            await Controller.callMethod(
                                                                Controller
                                                                    .accounts[0],
                                                                'InfinityMint',
                                                                'tokenURI',
                                                                {
                                                                    parameters:
                                                                        [
                                                                            this
                                                                                .state
                                                                                .tokenId,
                                                                        ],
                                                                }
                                                            ).catch((error) => {
                                                                this.setError(
                                                                    error
                                                                );
                                                            });

                                                        if (
                                                            tokenURI.length > 0
                                                        ) {
                                                            Controller.setFlag(
                                                                this.state.token
                                                                    .tokenId,
                                                                'emptyTokenURI',
                                                                false
                                                            );
                                                        }

                                                        try {
                                                            let result;
                                                            if (
                                                                tokenURI.slice(
                                                                    0,
                                                                    1
                                                                ) !== '{'
                                                            ) {
                                                                // Fetch it first
                                                                result =
                                                                    await fetch(
                                                                        tokenURI
                                                                    );
                                                                result =
                                                                    await result.text();
                                                                result =
                                                                    JSON.parse(
                                                                        result
                                                                    );
                                                            } else {
                                                                result =
                                                                    JSON.parse(
                                                                        tokenURI
                                                                    );
                                                            }

                                                            if (
                                                                storageController
                                                                    .values
                                                                    .tokenURI[
                                                                    this.state
                                                                        .tokenId
                                                                ] === undefined
                                                            ) {
                                                                storageController.values.tokenURI[
                                                                    this.state.tokenId
                                                                ] = result;
                                                            }

                                                            // Update is newer
                                                            if (
                                                                result.updated >
                                                                (storageController
                                                                    .values
                                                                    .tokenURI[
                                                                    this.state
                                                                        .tokenId
                                                                ].updated || 0)
                                                            ) {
                                                                storageController.values.tokenURI[
                                                                    this.state.tokenId
                                                                ] = result;
                                                            }
                                                        } catch (error) {
                                                            Controller.log(
                                                                '[😞] unparsable or broken tokenURI',
                                                                'error'
                                                            );
                                                            Controller.log(
                                                                error
                                                            );
                                                        }

                                                        this.setState({
                                                            loading: false,
                                                            result: {
                                                                __ifpsUrl:
                                                                    tokenURI,
                                                                ...storageController
                                                                    .values
                                                                    .tokenURI[
                                                                    this.state
                                                                        .tokenId
                                                                ],
                                                            },
                                                            showResultModal: true,
                                                        });

                                                        storageController.saveData();
                                                    }}
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .InspectTokenURI
                                                    }
                                                </Button>
                                                <Button
                                                    key={'refreshTokenURIButton'}
                                                    variant="success"
                                                    size="sm"
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
                                                        resources.$.UI.Action
                                                            .RefreshToken
                                                    }
                                                </Button>
                                                <h4 className="ms-2 mt-1 mb-0 mt-3">
                                                    🕸 Web3
                                                </h4>
                                                <Button
                                                    key={'openSeaLinkButton'}
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => {
                                                        window.open(
                                                            Controller.getCollectionURL(
                                                                this.state.token
                                                                    .tokenId
                                                            )
                                                        );
                                                    }}
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .OpenSeaLink
                                                    }
                                                </Button>
                                                <Button
                                                    key={'etherscanLinkButton'}
                                                    variant="success"
                                                    size="sm"
                                                    disabled
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .TxLink
                                                    }
                                                </Button>
                                                <Button
                                                    key={'twitterLinkButton'}
                                                    variant="success"
                                                    size="sm"
                                                    disabled
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .TwitterLink
                                                    }
                                                </Button>
                                                <Button
                                                    key={'shareLinkButton'}
                                                    variant="success"
                                                    size="sm"
                                                    disabled
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .ShareLink
                                                    }
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                    <h4 className="ms-2 mt-1 mb-1 mt-3">
                                        🎛 Links
                                    </h4>
                                    <Row>
                                        <Col
                                            key={'tokenLinksCol'+this.state.tokenId}    
                                        >
                                            {this.state.modChildren.map(
                                                (child) => (
                                                    <>{child}</>
                                                )
                                            )}
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                        <br />
                        <br />
                        <br />
                    </Container>
                ) : (
                    <Container>
                        {this.state.loading ? (
                            <Loading />
                        ) : (
                            <Row className="mt-4">
                                <Col className="text-center text-white">
                                    <p className="display-2 zombieTextRed  text-white">
                                        Cant Find That Token...
                                    </p>
                                    <p className="fs-5 bg-danger text-white pb-2 pt-2">
                                        It might be loading or this{' '}
                                        {resources.projectToken()} might not
                                        exists....
                                    </p>
                                    <img
                                        alt="#"
                                        src={Config.getImage('defaultImage')}
                                    />
                                    {!Controller.isWalletValid ? (
                                        <div className="d-grid mt-2 gap-2 text-center">
                                            <Alert variant="danger">
                                                You need to connect your wallet
                                                in order to view a{' '}
                                                {resources
                                                    .projectToken()
                                                    .toLowerCase()}
                                            </Alert>
                                            <Button
                                                key={'connectWalletButton'}
                                                onClick={
                                                    Controller.onboardWallet
                                                }
                                                variant="light"
                                            >
                                                {
                                                    resources.$.UI.Action
                                                        .ConnectWallet
                                                }
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="d-grid mt-2 gap-2">
                                            <Button
                                                key={'refreshButton'}
                                                variant="light"
                                                size="lg"
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
                                                            error: null,
                                                            loading: true,
                                                            isValid: false,
                                                        });

                                                        await this.componentDidMount();
                                                    } catch (error) {
                                                        this.setError(error);
                                                    }
                                                }}
                                            >
                                                {resources.$.UI.Action.Refresh}
                                            </Button>
                                            <NavigationLink
                                                key={'mintButton'}
                                                location="/mint"
                                                text={
                                                    resources.$.UI.Action
                                                        .MintToken
                                                }
                                            />
                                            <NavigationLink
                                                key={'homeButton'}
                                                location="/"
                                                text={'🍓 Home'}
                                            />
                                            <NavigationLink
                                                key={'backButton'}
                                                location={
                                                    '/view/' +
                                                    this.state.tokenId
                                                }
                                                text={
                                                    resources.$.UI.Action.Back
                                                }
                                            />
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        )}
                    </Container>
                )}
                <ResultModal
                    key={'resultModal'}
                    show={this.state.showResultModal}
                    result={this.state.result}
                    title={'Inspect TokenURI'}
                    onHide={() => {
                        this.setState({
                            showResultModal: false,
                        });
                    }}
                />
            </>
        );
    }
}

EditToken.url = '/edit/:tokenId';
EditToken.id = 'EditToken';
EditToken.requirements = {
    requireWallet: true,
};
export default EditToken;
