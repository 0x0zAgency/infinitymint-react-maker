import React, { Component } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Alert,
    Form,
} from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import Config from '../config.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Token from '../Components/Token.js';
import { loadToken, loadStickers, waitSetState } from '../helpers.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import ResultModal from '../Modals/ResultModal.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import Loading from '../Components/Loading.js';
import ipfsController from 'infinitymint-client/dist/src/classic/ipfs/web3Storage.js';
import PageController from 'infinitymint-client/dist/src/classic/pageController.js';
import Box from '../Components/Box.js';
import modController from 'infinitymint-client/dist/src/classic/modController.js';

class TokenURI extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tokenId: this?.props?.match?.params?.tokenId || 0,
            tokenData: {},
            token: {
                pathSize: 64,
                colours: [],
                stickers: [],
            },
            tags: {},
            isValid: false,
            stickers: [],
            hasStickers: false,
            location: '',
            scale: 1,
            finalTokenURI: {},
            settings: {
                useFresh: true,
                onlyBorder: true,
                hideDescription: true,
                renderOnUpdate: false,
                width: 1024,
                height: 1024,
                noPadding: true,
                quality: 1,
                rotation: 0,
                filter: 'none',
                drawName: false,
                drawTokenId: false,
                removeStickers: false,
                enableThreeJS: false,
            },
            description: '',
            url: '',
            formFilename: '',
            formWeb3Key: '',
            success: false,
            showResultModal: false,
            preparedTokenURI: {},
        };
    }

    async componentDidMount() {
        try {
            // Load the token
            await loadToken(this);
            // Load the stickers
            await loadStickers(this);

            if (
                !this.state.isValid ||
                this.state.token.owner !== controller.accounts[0]
            ) {
                this.setState({
                    isValid: false,
                    location:
                        '/view/' +
                        (this.state.token?.tokenId ||
                            this?.props?.match?.params?.tokenId ||
                            0),
                });
            } else if (
                this.state.isValid &&
                this.state.token.owner === controller.accounts[0]
            ) {
                await this.prepareTokenURI(true);
                await waitSetState(this, {
                    url: this.state.preparedTokenURI.external_url || '',
                    loading: true,
                });
                this.setState({
                    loading: false,
                });
            }

            this.setState({
                formFilename: this.state.token.tokenId,
                formWeb3Key:
                    storageController.getGlobalPreference(
                        'web3StorageApiKey'
                    ) || '',
            });
        } catch (error) {
            controller.log('[😞] Error', 'error');
            controller.log(error);
            this.setState({
                isValid: false,
            });
        }

        this.setState({
            isBasicTokenURI:
                controller.getTokenMethodInterface()?.basicTokenURI === true,
        });
    }

    async prepareTokenURI(initialSet = false) {
        const result = document.querySelectorAll('.renderedToken')[0];

        // Create IPFS controller instance with the API key of the user
        ipfsController.createInstance(this.state.formWeb3Key);

        if (result.firstChild.tagName === 'canvas') {
            if (
                result.getAttribute !== undefined &&
                result.getAttribute('loaded') !== 'true' &&
                result.getAttribute('loaded') !== true
            ) {
                throw new Error('Please wait for your token to load first');
            }

            const tokenURI = await controller.createTokenURI(
                this.state.token,
                result.toDataURL(
                    'image/png',
                    this.state.settings?.quality || 1
                ),
                false,
                { ...this.state.settings, dontUploadImage: !initialSet }
            );

            this.setState({
                preparedTokenURI: tokenURI,
            });
        } else {
            result.firstChild.setAttribute(
                'xmlns',
                'http://www.w3.org/2000/svg'
            );
            result.firstChild.setAttribute(
                'xmlns:xlink',
                'http://www.w3.org/1999/xlink'
            );

            const tokenURI = await controller.createTokenURI(
                this.state.token,
                result.innerHTML,
                false,
                { ...this.state.settings, dontUploadImage: !initialSet }
            );

            this.setState({
                preparedTokenURI: tokenURI,
            });
        }
    }

    async uploadToIPFS() {
        this.setState({
            showResultModal: false,
        });

        if (Object.values(this.state.preparedTokenURI).length === 0) {
            throw new Error('prepared tokenURI not prepared');
        }

        // First upload the image seperately

        if (this.state.preparedTokenURI?.image === undefined) {
            throw new Error('image is not defined');
        }

        let fileName = this.state.formFilename;
        fileName = fileName.split('.')[0];
        fileName.replace(/[^\w\s]/gi, '');

        if (fileName.length === 0) {
            throw new Error('bad filename');
        }

        const blob = atob(this.state.preparedTokenURI.image.split(',')[1]);
        const array = [];
        for (let i = 0; i < blob.length; i++) {
            array.push(blob.charCodeAt(i));
        }

        const contentName = `${
            this.state.token.tokenId
        }.${ipfsController.getContentExtension(
            controller.getTokenMethodType()
        )}`;
        const imageCid = await ipfsController.uploadFile(
            contentName,
            new Blob([new Uint8Array(array)]),
            ipfsController.getContentType(controller.getTokenMethodType())
        );
        controller.log(
            `[✔️] uploaded ${contentName} token image to IPFS`,
            'ipfs'
        );

        const tokenURI = {
            ...this.state.preparedTokenURI,
            image:
                'https://' +
                imageCid +
                '.ipfs.w3s.link' +
                '/' +
                `${contentName}`,
            updated: Date.now(),
        };

        if (
            controller.getTokenMethodType() !== 'vector' &&
            controller.getTokenMethodType() === 'image'
        ) {
            tokenURI.document = tokenURI.image;
            delete tokenURI.image;
        }

        const cid = await ipfsController.uploadFile(
            `${fileName}.json`,
            JSON.stringify(tokenURI),
            null
        );
        controller.log(`[✔️] uploaded ${fileName}.json to ipfs`, 'ipfs');

        await controller.sendMethod(
            controller.accounts[0],
            'InfinityMint',
            'setTokenURI',
            {
                parameters: [
                    this.state.token.tokenId,
                    'https://' + cid + `.ipfs.w3s.link/${fileName}.json`,
                ],
            }
        );

        controller.setFlag(this.state.token.tokenId, 'emptyTokenURI', false);

        controller.setFlag(this.state.token.tokenId, 'checkedTokenURI', true);

        controller.setFlag(this.state.token.tokenId, 'tokenURI', true);

        storageController.setGlobalPreference(
            'web3StorageApiKey',
            this.state.formWeb3Key
        );
        storageController.values.tokenURI[this.state.token.tokenId] = tokenURI;
        storageController.saveData();

        // Destroy instance of IPFS controller
        ipfsController.destroyInstance();

        this.setState({
            success: true,
        });
    }

    render() {
        if (this.state.location !== '') {
            return <Redirect to={this.state.location}></Redirect>;
        }

        return (
            <>
                <Container className="mb-5">
                    {this.state.loading ? (
                        <Loading />
                    ) : (
                        <>
                            <Row className="mt-4">
                                <Col>
                                    <h1 className="display-5 text-center text-white mb-2 mt-2">
                                        Display / TokenURI Editor
                                    </h1>
                                </Col>
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    {this.state.error === true ? (
                                        <Alert variant="danger">
                                            <b>Error:</b>{' '}
                                            {this.state.errorMessage?.message ||
                                                this.state.errorMessage}
                                        </Alert>
                                    ) : (
                                        <></>
                                    )}
                                    {this.props.settings?.hideModBadges !==
                                        true &&
                                    modController.isModEnabled(
                                        'Mod_UploadPaths'
                                    ) &&
                                    this.state.token.owner ===
                                        controller.accounts[0] &&
                                    this.state.token?.tokenId !== undefined ? (
                                        // Infinitymint.tokenURI(tokenId) === path metadata
                                        // 	? :)
                                        // 	: <ErrorModal/>
                                        <></>
                                    ) : (
                                        <>
                                            <Card body bg="danger" className='force-white'>
                                                <Card.Title>
                                                    Error! 
                                                </Card.Title>
                                                <Card.Body>
                                                    <Card.Text>
                                                    You must set your
                                                    `pathId` within your token
                                                    metadata. The corresponding
                                                        metadata could not be
                                                        loaded: data from chain
                                                        and your local project.
                                                    </Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </>
                                    )}
                                    {this.state.success === true ? (
                                        <Alert variant="success">
                                            Sucess! Token URI has been set. You
                                            can verify it by pressing the back
                                            button and clicking "Inspect Token
                                            URI"
                                        </Alert>
                                    ) : (
                                        <></>
                                    )}
                                </Col>
                            </Row>

                            <Row className="mt-2 mb-2">
                                <Col>
                                    <div className="d-grid">
                                        <Button
                                            variant="light"
                                            size="lg"
                                            onClick={() => {
                                                this.setState({
                                                    location:
                                                        '/view/' +
                                                        this.state.tokenId,
                                                });
                                            }}
                                        >
                                            {resources.$.UI.Action.Back}
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            {this.state.isValid ? (
                                <>
                                    <Alert
                                        variant="danger"
                                        className="mt-3"
                                        hidden={this.state.isBasicTokenURI}
                                    >
                                        <b>Warning: </b> Image size below will
                                        appear incorrectly to preserve fidelity
                                        in rendering process. Final result will
                                        not be cropped.
                                    </Alert>
                                    <Card body className="bg-light">
                                        {this.state.isBasicTokenURI ? (
                                            <Alert variant="warning">
                                                This Token is a scalable vector graphic or a
                                                raw data object. This doesn't let us apply any of the filters avaible to this configuration.
                                            </Alert>
                                        ) : (
                                            <></>
                                        )}
                                        <p className="display-3">
                                            Preview
                                        </p>
                                        <hr />
                                        <Row className="mt-2">
                                            <Col xxl={4} xl={4} lg={4} md={6} sm={12} xs={12}>
                                                <div
                                                    className="mx-auto ms-auto"
                                                    id="tokenContainer"
                                                    style={{
                                                        overflow: 'auto',
                                                        maxWidth: this.state
                                                            .isBasicTokenURI
                                                            ? 960
                                                            : 520,
                                                        maxHeight: this.state
                                                            .isBasicTokenURI
                                                            ? 960
                                                            : 520,
                                                    }}
                                                >
                                                    <Token
                                                        theToken={
                                                            this.state.token
                                                        }
                                                        stickers={
                                                            this.state.stickers
                                                        }
                                                        settings={
                                                            this.state.settings
                                                        }
                                                        hideName={
                                                            this.state.settings
                                                                ?.drawName ===
                                                            false
                                                        }
                                                        hideTokenId={
                                                            this.state.settings
                                                                ?.drawTokenId ===
                                                            false
                                                        }
                                                        style={{
                                                            transform: `scale(${Math.max(
                                                                0.1,
                                                                this.state
                                                                    .scale || 1
                                                            )})`,
                                                        }}
                                                    >
                                                        <span className="badge bg-success fs-5 ms-2 mt-2">
                                                            {
                                                                this.state
                                                                    .settings
                                                                    .width
                                                            }
                                                            x
                                                            {
                                                                this.state
                                                                    .settings
                                                                    .height
                                                            }
                                                        </span>
                                                    </Token>
                                                </div>
                                                {/**
									<div className="d-grid gap-2 gy-2 mt-4">
										<Button
											size="sm"
											onClick={() => {
												this.setState({
													scale: Math.max(
														0.1,
														this.state.scale - 0.1
													),
												});
											}}
										>
											Zoom Out
										</Button>
										<Button
											size="sm"
											onClick={() => {
												this.setState({
													scale: Math.min(
														3,
														this.state.scale + 0.1
													),
												});
											}}
										>
											Zoom In
										</Button>
										<Button
											size="sm"
											hidden={this.state.scale === 1}
											onClick={() => {
												this.setState({
													scale: 1,
												});
											}}
										>
											Reset Zoom
										</Button>
									</div>
									*/}
                                            </Col>
                                            <Col
                                                lg={5}
                                                hidden={
                                                    this.state.isBasicTokenURI
                                                }
                                            >
                                                <Col className="mx-2">
                                                    <Row className="align-items-center mt-2">
                                                        <p className="fs-4">
                                                            Output Resolution
                                                        </p>
                                                        <Col>
                                                            <div className="d-grid d-lg-flex m-0 justify-content-sm-start">
                                                                <Col className="m-0">
                                                                    <Button
                                                                        className="my-2 bg-primary"
                                                                        onClick={() => {
                                                                            this.setState(
                                                                                {
                                                                                    settings:
                                                                                        {
                                                                                            ...this
                                                                                                .state
                                                                                                .settings,
                                                                                            width: 512,
                                                                                            height: 512,
                                                                                            renderOnUpdate: true,
                                                                                        },
                                                                                }
                                                                            );
                                                                        }}
                                                                    >
                                                                        512x512
                                                                    </Button>
                                                                    <Button
                                                                        className="bg-primary"
                                                                        onClick={() => {
                                                                            this.setState(
                                                                                {
                                                                                    settings:
                                                                                        {
                                                                                            ...this
                                                                                                .state
                                                                                                .settings,
                                                                                            width: 1024,
                                                                                            height: 1024,
                                                                                            renderOnUpdate: true,
                                                                                        },
                                                                                }
                                                                            );
                                                                        }}
                                                                    >
                                                                        1024x1024
                                                                    </Button>
                                                                </Col>
                                                                <Col className="">
                                                                    <Button
                                                                        className="my-2 bg-primary"
                                                                        active={
                                                                            this
                                                                                .state
                                                                                .settings
                                                                                ?.width ===
                                                                            2048
                                                                        }
                                                                        onClick={() => {
                                                                            this.setState(
                                                                                {
                                                                                    settings:
                                                                                        {
                                                                                            ...this
                                                                                                .state
                                                                                                .settings,
                                                                                            width: 2048,
                                                                                            height: 2048,
                                                                                            renderOnUpdate: true,
                                                                                        },
                                                                                }
                                                                            );
                                                                        }}
                                                                    >
                                                                        2048x2048
                                                                    </Button>
                                                                    <Button
                                                                        className="bg-primary"
                                                                        onClick={() => {
                                                                            this.setState(
                                                                                {
                                                                                    settings:
                                                                                        {
                                                                                            ...this
                                                                                                .state
                                                                                                .settings,
                                                                                            width: 4096,
                                                                                            height: 4096,
                                                                                            renderOnUpdate: true,
                                                                                        },
                                                                                }
                                                                            );
                                                                        }}
                                                                    >
                                                                        4096x4096
                                                                    </Button>
                                                                </Col>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row
                                                        className="align-items-center mt-2"
                                                        hidden={true}
                                                    >
                                                        <p className="fs-4">
                                                            Orientation
                                                        </p>
                                                        <Col className="mx-auto">
                                                            <div className="d-grid gap-2 d-lg-flex justify-content-sm-start">
                                                                <Button
                                                                    className="bg-primary"
                                                                    bg="primary"
                                                                    active={
                                                                        this
                                                                            .state
                                                                            .settings
                                                                            ?.rotation ===
                                                                        0
                                                                    }
                                                                    onClick={() => {
                                                                        this.setState(
                                                                            {
                                                                                settings:
                                                                                    {
                                                                                        ...this
                                                                                            .state
                                                                                            .settings,
                                                                                        rotation: 0,
                                                                                        renderOnUpdate: true,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    0 Deg
                                                                </Button>
                                                                <Button
                                                                    onClick={() => {
                                                                        this.setState(
                                                                            {
                                                                                settings:
                                                                                    {
                                                                                        ...this
                                                                                            .state
                                                                                            .settings,
                                                                                        rotation: 90,
                                                                                        renderOnUpdate: true,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    90 Deg
                                                                </Button>
                                                                <Button
                                                                    onClick={() => {
                                                                        this.setState(
                                                                            {
                                                                                settings:
                                                                                    {
                                                                                        ...this
                                                                                            .state
                                                                                            .settings,
                                                                                        rotation: 180,
                                                                                        renderOnUpdate: true,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    180 Deg
                                                                </Button>
                                                                <Button
                                                                    onClick={() => {
                                                                        this.setState(
                                                                            {
                                                                                settings:
                                                                                    {
                                                                                        ...this
                                                                                            .state
                                                                                            .settings,
                                                                                        rotation: 270,
                                                                                        renderOnUpdate: true,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    270 Deg
                                                                </Button>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row className="align-items-center mt-2">
                                                        <p className="fs-4">
                                                            Render Quality
                                                        </p>
                                                        <Col className="mx-auto">
                                                            <div className="d-grid gap-2 d-lg-flex justify-content-sm-start">
                                                                <Button
                                                                    onClick={() => {
                                                                        this.setState(
                                                                            {
                                                                                settings:
                                                                                    {
                                                                                        ...this
                                                                                            .state
                                                                                            .settings,
                                                                                        quality: 0.35,
                                                                                        renderOnUpdate: true,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    Low
                                                                </Button>
                                                                <Button
                                                                    onClick={() => {
                                                                        this.setState(
                                                                            {
                                                                                settings:
                                                                                    {
                                                                                        ...this
                                                                                            .state
                                                                                            .settings,
                                                                                        quality: 0.5,
                                                                                        renderOnUpdate: true,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    Medium
                                                                </Button>
                                                                <Button
                                                                    active={
                                                                        this
                                                                            .state
                                                                            .settings
                                                                            ?.quality ===
                                                                        1
                                                                    }
                                                                    onClick={() => {
                                                                        this.setState(
                                                                            {
                                                                                settings:
                                                                                    {
                                                                                        ...this
                                                                                            .state
                                                                                            .settings,
                                                                                        quality: 1,
                                                                                        renderOnUpdate: true,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    High
                                                                </Button>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row className="align-items-center mt-2">
                                                        <p className="fs-4">
                                                            Render Options
                                                        </p>
                                                        <Col className="mx-auto">
                                                            <div className="d-grid gap-2 d-lg-flex justify-content-sm-start">
                                                                <Button
                                                                    active={
                                                                        this
                                                                            .state
                                                                            .settings
                                                                            ?.drawName ===
                                                                        true
                                                                    }
                                                                    variant={
                                                                        this
                                                                            .state
                                                                            .settings
                                                                            ?.drawName ===
                                                                        true
                                                                            ? 'success'
                                                                            : 'danger'
                                                                    }
                                                                    onClick={() => {
                                                                        this.setState(
                                                                            {
                                                                                settings:
                                                                                    {
                                                                                        ...this
                                                                                            .state
                                                                                            .settings,
                                                                                        drawName:
                                                                                            !this
                                                                                                .state
                                                                                                .settings
                                                                                                ?.drawName,
                                                                                        renderOnUpdate: false,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    Draw Name
                                                                </Button>
                                                                <Button
                                                                    active={
                                                                        this
                                                                            .state
                                                                            .settings
                                                                            ?.drawTokenId ===
                                                                        true
                                                                    }
                                                                    variant={
                                                                        this
                                                                            .state
                                                                            .settings
                                                                            ?.drawTokenId ===
                                                                        true
                                                                            ? 'success'
                                                                            : 'danger'
                                                                    }
                                                                    onClick={() => {
                                                                        this.setState(
                                                                            {
                                                                                settings:
                                                                                    {
                                                                                        ...this
                                                                                            .state
                                                                                            .settings,
                                                                                        drawTokenId:
                                                                                            !this
                                                                                                .state
                                                                                                .settings
                                                                                                ?.drawTokenId,
                                                                                        renderOnUpdate: false,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                >
                                                                    Draw Token
                                                                    ID
                                                                </Button>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row className="align-items-center mt-2">
                                                                    <Col>
                                                                    <Card
                                        body
                                        className="bg-light mt-4"
                                        hidden={this.state.isBasicTokenURI}
                                    >
                                        <Row className="align-items-center">
                                            <p className="header-subtext">
                                                Image Filters
                                            </p>
                                            <Col className="mx-auto">
                                                <div className="d-grid gap-2 flex-wrap d-lg-flex flex-sm-column align-self-stretch flex-md-row justify-content-center">
                                                    <Button
                                                        className="bg-primary"
                                                        active={
                                                            this.state.settings
                                                                ?.filter ===
                                                            'none'
                                                        }
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'none',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        None
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'blur',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Blur
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'ultra-contrast',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Ultra Contrast
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'high-contrast',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        High Contrast
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'low-contrast',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Low Contrast
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'sepia',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Sepia
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'grayscale',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Grayscale
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'huerot-45',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Hue-Rotate 45deg
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'huerot-90',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Hue-Rotate 90deg
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'low-brightness',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Low Brightness
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'high-brightness',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        High Brightness
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'saturate',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Saturate
                                                    </Button>
                                                    <Button
                                                        className="bg-primary"
                                                        onClick={() => {
                                                            this.setState({
                                                                settings: {
                                                                    ...this
                                                                        .state
                                                                        .settings,
                                                                    filter: 'invert',
                                                                    renderOnUpdate: true,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        Invert
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                                                    </Col>
                                                    </Row>
                                                </Col>
                                            </Col>
                                        </Row>
                                    </Card>
                                    

                                    <Row className="mt-4">
                                        <Col>
                                            <Card body className="bg-light">
                                                <p className="display-5">
                                                    Details
                                                </p>
                                                <div className="d-grid gy-2 gap-2">
                                                    <h2 className="fs-6 mt-2">
                                                        Name
                                                    </h2>
                                                    <Form.Control
                                                        type="text"
                                                        size="sm"
                                                        value={this.state.name}
                                                        placeholder={
                                                            this.state
                                                                .preparedTokenURI
                                                                .name
                                                        }
                                                        onChange={(e) => {
                                                            this.setState({
                                                                name: e.target
                                                                    .value,
                                                            });
                                                        }}
                                                    />
                                                    <h2 className="fs-6 mt-2">
                                                        Owner
                                                    </h2>
                                                    <Form.Control
                                                        type="text"
                                                        size="sm"
                                                        placeholder={
                                                            this.state.token
                                                                .owner
                                                        }
                                                        readOnly
                                                    />
                                                    <h2 className="fs-6 mt-2">
                                                        Description
                                                    </h2>
                                                    <textarea
                                                        onChange={(e) => {
                                                            this.setState({
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            });
                                                        }}
                                                    >
                                                        {
                                                            this.state
                                                                .preparedTokenURI
                                                                .description
                                                        }
                                                    </textarea>
                                                    <h2 className="fs-6 mt-2">
                                                        URL{' '}
                                                        <span className="badge bg-success fs-6 small">
                                                            Will link to this
                                                            address from
                                                            marketplaces/web3
                                                        </span>
                                                    </h2>
                                                    <Form.Control
                                                        type="text"
                                                        size="sm"
                                                        value={this.state.url}
                                                        placeholder={
                                                            this.state
                                                                .preparedTokenURI
                                                                .external_url
                                                        }
                                                        onChange={(e) => {
                                                            this.setState({
                                                                url: e.target
                                                                    .value,
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Card body className="mt-4">
                                        <p className="display-5 zombieTextRed  text-white">
                                            Tags
                                        </p>
                                        <p>
                                            <span className="badge bg-danger fs-4">
                                                these will be added as
                                                attributes to your tokenURI
                                            </span>
                                        </p>
                                        <Row className="row-cols-3 gy-2 gx-2 mt-2 ">
                                            {Config.settings.galleryCategories.map(
                                                (value, index) => (
                                                    <Col
                                                        className="d-grid p-2"
                                                        key={index}
                                                    >
                                                        <Button
                                                            variant={
                                                                this.state.tags[
                                                                    value
                                                                ] !== undefined
                                                                    ? 'primary'
                                                                    : 'light'
                                                            }
                                                            onClick={() => {
                                                                const tags = {
                                                                    ...this
                                                                        .state
                                                                        .tags,
                                                                };

                                                                if (
                                                                    tags[
                                                                        value
                                                                    ] ===
                                                                    undefined
                                                                ) {
                                                                    tags[
                                                                        value
                                                                    ] = true;
                                                                } else {
                                                                    delete tags[
                                                                        value
                                                                    ];
                                                                }

                                                                this.setState({
                                                                    tags,
                                                                });
                                                            }}
                                                        >
                                                            {value}
                                                        </Button>
                                                    </Col>
                                                )
                                            )}
                                        </Row>
                                    </Card>
                                    <Row className="mt-4">
                                        <Col>
                                            <Card body className="bg-dark">
                                                <div className="d-grid gy-2 gap-2">
                                                    <p className="display-5 zombieTextRed  text-white">
                                                        🛸 IPFS - InterPlanetary
                                                        File System
                                                    </p>
                                                    <Row>
                                                        <Col>
                                                            <div className="d-grid gap-2 mx-2">
                                                                <Button
                                                                    size="lg"
                                                                    variant="success"
                                                                    onClick={() => {
                                                                        window.open(
                                                                            'https://web3.storage'
                                                                        );
                                                                    }}
                                                                >
                                                                    Get
                                                                    'Web3.storage'
                                                                    API Key{' '}
                                                                    <span className="badge bg-dark">
                                                                        External
                                                                        Site
                                                                    </span>
                                                                </Button>
                                                                <p className="fs-3 force-white mb-4 mt-4">
                                                                    Web3.Storage
                                                                    API Key
                                                                </p>
                                                                <Form.Control
                                                                    type="text"
                                                                    size="md"
                                                                    placeholder="web3.storage API Key"
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        this.setState(
                                                                            {
                                                                                formWeb3Key:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                settings:
                                                                                    {
                                                                                        ...this
                                                                                            .state
                                                                                            .settings,
                                                                                        renderOnUpdate: false,
                                                                                    },
                                                                            }
                                                                        );
                                                                        storageController.setGlobalPreference(
                                                                            'web3StorageApiKey',
                                                                            this
                                                                                .state
                                                                                .formWeb3Key
                                                                        );
                                                                    }}
                                                                    value={
                                                                        this
                                                                            .state
                                                                            .formWeb3Key
                                                                    }
                                                                />
                                                                <p className="fs-3 force-white mb-4 mt-4">
                                                                    Filename{' '}
                                                                    <span className="badge bg-danger fs-6 ms-2">
                                                                        Optional
                                                                    </span>
                                                                </p>
                                                                <Form.Control
                                                                    type="text"
                                                                    size="md"
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        this.setState(
                                                                            {
                                                                                formFilename:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                settings:
                                                                                    {
                                                                                        ...this
                                                                                            .state
                                                                                            .settings,
                                                                                        renderOnUpdate: false,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                    value={
                                                                        this
                                                                            .state
                                                                            .formFilename
                                                                    }
                                                                />
                                                            </div>
                                                        </Col>

                                                        <Col>
                                                            <Box tag={'😍'}>
                                                                Dont panic! All
                                                                you need to do
                                                                is click the
                                                                'Get
                                                                Web3.Storage Api
                                                                Key' token and
                                                                create an
                                                                account
                                                                completely for
                                                                free. Once you
                                                                have an account
                                                                you can then go
                                                                to your account
                                                                settings and
                                                                create a new API
                                                                token and then
                                                                you can simply
                                                                paste it into
                                                                the
                                                                web3.storagekey
                                                                box!
                                                            </Box>
                                                            <Box
                                                                tag={'📟'}
                                                                className="mt-2"
                                                            >
                                                                {' '}
                                                                We use{' '}
                                                                <b>ipfs</b> to
                                                                store your
                                                                tokens apperance
                                                                and information
                                                                forever. IPFS is
                                                                a decentralized
                                                                file solution
                                                                similar to
                                                                Google Drive or
                                                                Dropbox and is{' '}
                                                                <b>
                                                                    free to use.
                                                                </b>
                                                            </Box>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4">
                                        <Col>
                                            {this.state.error === true ? (
                                                <Alert variant="danger">
                                                    <b>Error:</b>{' '}
                                                    {this.state.errorMessage
                                                        ?.message ||
                                                        this.state.errorMessage}
                                                </Alert>
                                            ) : (
                                                <></>
                                            )}
                                            {this.state.success === true ? (
                                                <Alert variant="success">
                                                    Sucess! Token URI has been
                                                    set. You can verify it by
                                                    pressing the back button and
                                                    clicking "Inspect Token URI"
                                                </Alert>
                                            ) : (
                                                <></>
                                            )}
                                        </Col>
                                    </Row>
                                    <Row className="mt-2 pb-4">
                                        <Col>
                                            <div className="d-grid gap-2 gy-2">
                                                <Button
                                                    variant="success"
                                                    disabled={
                                                        this.state
                                                            .formWeb3Key ===
                                                            '' ||
                                                        this.state.fileName ===
                                                            ''
                                                    }
                                                    onClick={() => {
                                                        this.setState({
                                                            settings: {
                                                                ...this.state
                                                                    .settings,
                                                                renderOnUpdate: false,
                                                            },
                                                        });
                                                        this.prepareTokenURI().catch(
                                                            (error) => {
                                                                this.setState({
                                                                    error: true,
                                                                    errorMessage:
                                                                        error,
                                                                });
                                                            }
                                                        );

                                                        const object = {
                                                            ...this.state
                                                                .preparedTokenURI,
                                                        };

                                                        if (
                                                            object.image ===
                                                                undefined ||
                                                            object.image === ''
                                                        ) {
                                                            this.setState({
                                                                error: true,
                                                                errorMessage:
                                                                    'Sorry, seems we dropped your tokenURI on the floor, oppisie :3 Please click the submit button again.',
                                                            });

                                                            return;
                                                        }

                                                        object.description =
                                                            this.state.description;
                                                        object.external_url =
                                                            this.state.url;

                                                        object.attributes = [
                                                            ...(object.attributes ||
                                                                []),
                                                        ];

                                                        for (const tag of Object.keys(
                                                            this.state.tags
                                                        )) {
                                                            object.attributes.push(
                                                                {
                                                                    trait_type:
                                                                        tag,
                                                                    value: tag,
                                                                }
                                                            );
                                                        }

                                                        this.setState({
                                                            finalTokenURI:
                                                                object,
                                                            showResultModal: true,
                                                        });
                                                    }}
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .Submit
                                                    }
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </>
                            ) : (
                                <Row className="pb-4">
                                    <Col>
                                        <Alert variant="danger">
                                            Invalid Token
                                        </Alert>
                                    </Col>
                                </Row>
                            )}
                        </>
                    )}
                </Container>
                <ResultModal
                    show={this.state.showResultModal}
                    result={this.state.finalTokenURI}
                    onClick={() => {
                        // Do IFPS stuff
                        this.setState({
                            success: false,
                            error: false,
                            loading: true,
                        });
                        this.uploadToIPFS()
                            .finally(() => {
                                this.setState({
                                    loading: false,
                                });
                            })
                            .catch((error) => {
                                // If IPFS error have them enter their key again
                                storageController.setGlobalPreference(
                                    'web3StorageApiKey',
                                    ''
                                );

                                this.setState({
                                    error: true,
                                    formWeb3Key: '',
                                    errorMessage: error,
                                });
                            });
                    }}
                    draw={(render, token) => (
                        <div className="d-grid mt-2">
                            <img
                                src={token.image}
                                className="img-thumbnail ms-auto me-auto"
                                alt="nope"
                            ></img>
                        </div>
                    )}
                    title={'Ready To Upload to IPFS'}
                    keepOpen={true}
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

TokenURI.url = '/edit/:tokenId/tokenuri';
TokenURI.id = 'TokenURI';
TokenURI.settings = {
    requireWallet: true,
};

PageController.registerPage(TokenURI);
export default TokenURI;
