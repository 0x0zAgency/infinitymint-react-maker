import React, { Component } from 'react';
import { Container, Row, Col, Button, Card, Alert } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import tinySVG from 'tinysvg-js';
import NavigationLink from '../Components/NavigationLink.js';
import { waitSetState } from '../helpers.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import Overview from '../Components/StickerEditor/Overview.js';
import Preview from '../Components/StickerEditor/Preview.js';
import ApperanceEditor from '../Components/StickerEditor/ApperanceEditor.js';
import DeleteStickerModal from '../Modals/DeleteStickerModal.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import stickerController from '../stickerController.js';
import FinalizedStickerModal from '../Modals/FinalizedStickerModal.js';
import Metadata from '../Components/StickerEditor/Metadata.js';
import ipfsController from 'infinitymint-client/dist/src/classic/ipfs/web3Storage.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import Loading from '../Components/Loading.js';

let _errorTimeout;

class StickerEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stickerId: this?.props?.match?.params?.stickerId || null,
            sticker: {},
            isValid: false,
            loading: false,
            showDeleteModal: false,
            assets: { svg: [], sticker: [], img: [] },
            validApperance: false,
            section: 'overview',
            location: '',
            showFinalizedStickerModal: false,
            error: undefined,
            finalizeError: undefined,
            canFinalize: false,
            checkInterval: null,
        };
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
            error,
        });
        this.cleanupError(5);
    }

    async componentWillUnmount() {
        clearInterval(this.state.checkInterval);
    }

    async componentDidMount() {
        if (
            storageController.values.stickers[this.state.stickerId] !==
            undefined
        ) {
            await waitSetState(this, {
                sticker: {
                    ...storageController.values.stickers[this.state.stickerId],
                },
                isValid: true,
                assets: this.getAssets(
                    storageController.values.stickers[this.state.stickerId]
                        .paths,
                    storageController.values.stickers[this.state.stickerId]
                        .colours
                ),
            });
        }

        if (this.state.isValid) {
            await this.calculateStorageUsage();
            this.setState({
                validApperance: true,
            });
        }

        let section = storageController.getPagePreference('section');

        if (
            typeof section !== 'string' ||
            section === null ||
            section === undefined
        ) {
            section = 'overview';
        }

        this.setSection(section);
        this.checkCanFinalize();
        this.findPossibleRequests(this.state.sticker.id);
    }

    async checkCanFinalize() {
        if (this.state.sticker.state === 1) {
            this.setState({
                canFinalize: false,
                fianlizeError: 'Already finalized',
            });
            return;
        }

        try {
            stickerController.checkSticker(
                { ...this.state.sticker },
                true,
                true
            );
            this.setState({
                canFinalize: true,
            });
        } catch (error) {
            this.setState({
                finalizeError: error.message || error,
                canFinalize: false,
            });
        }
    }

    async calculateStorageUsage() {
        const blob = new Blob([JSON.stringify(this.state.sticker)]);
        const blobPaths = new Blob([JSON.stringify(this.state.sticker.paths)]);
        await waitSetState(this, {
            assets: {
                ...this.state.assets,
                sticker: [
                    ...(this.state.assets.sticker || []),
                    (blob.size / 1024).toFixed(2),
                ],
                svg: [
                    ...(this.state.assets.svg || []),
                    (blobPaths.size / 1024).toFixed(2),
                ],
                img: [
                    ...(this.state.assets.img || []),
                    (blobPaths.size / 1024).toFixed(2),
                ],
            },
        });
    }

    getAssets(paths = undefined, colours = undefined) {
        let result = {
            sound: [],
            svg: [],
            img: [],
            sticker: [],
        };

        // Get SVG
        try {
            if (this.hasVectorGraphics())
                result = {
                    ...result,
                    svg: tinySVG.toSVG(
                        paths || this.state.sticker.paths,
                        true,
                        [...(colours || this.state.sticker.colours)],
                        false,
                        false,
                        true
                    ),
                };
            else
                result = {
                    ...result,
                    img: [paths || this.state.sticker.paths],
                };
        } catch (error) {
            controller.log('[😞] Error', 'error');
            controller.log(error);
        }

        // Get sound
        return result;
    }

    /**
     * Checks the current environment with the sticker to determin if it currently is in
     * SVG mode and then checks inside the sticker to determin if paths are present.
     * @returns
     */
    hasVectorGraphics() {
        return this.state.sticker.environment === 0;
    }

    /**
     * Can be awaited
     * @param {obj} values
     * @returns
     */
    setInSticker(values = {}) {
        return new Promise((resolve) =>
            this.setState(
                {
                    sticker: {
                        ...this.state.sticker,
                        ...values,
                    },
                },
                resolve
            )
        );
    }

    /**
     *
     * @param {*} section
     */
    setSection(section) {
        if (typeof section !== 'string') {
            throw new TypeError('bad section');
        }

        this.setState({
            section,
        });

        storageController.setPagePreference('section', section);
    }

    /**
     *
     */
    saveSticker(values = undefined) {
        storageController.values.stickers[this.state.stickerId] = {
            ...(values !== undefined
                ? {
                      ...this.state.sticker,
                      ...values,
                  }
                : this.state.sticker),
        };

        storageController.saveData();
    }

    async processApperance(object) {
        // Wait for valid apperance to reset back
        await waitSetState(this, {
            validApperance: false,
            hasApperanceChanges: false,
        });

        const assets = this.getAssets(object.paths, object.colours);

        //?
        if (this.hasVectorGraphics() && assets.svg[3] !== undefined) {
            delete assets.svg[3];
        }

        // Test
        // set the assets and if the size of the SVG array is not zero then we have a valid apperance (as paths must be present)
        await waitSetState(this, {
            assets,
            validApperance: this.hasVectorGraphics()
                ? assets.svg.length > 0
                : assets.img.length > 0,
        });

        // Calculate new blob sizes
        this.calculateStorageUsage();
        this.checkCanFinalize();
    }

    async uploadSticker(stickerData) {
        if (!storageController.getGlobalPreference('web3StorageApiKey'))
            throw new Error(
                'No Web3 Storage API Key. Please go to the options page and set a web3 storage api key'
            );

        ipfsController.createInstance(
            storageController.getGlobalPreference('web3StorageApiKey')
        );

        let cid = await ipfsController.uploadFile(
            'index.json',
            JSON.stringify(stickerData)
        );

        stickerData.cid = cid;
        return stickerData;
    }

    async finalizeSticker() {
        this.setState({
            loading: true,
        });

        this.saveSticker();

        storageController.values.stickers[this.state.stickerId] =
            await this.uploadSticker(
                storageController.values.stickers[this.state.stickerId]
            );
        storageController.saveData();
        stickerController.finalizeSticker(this.state.sticker.id);

        this.setState({
            showFinalizedStickerModal: true,
            loading: false,
        });
    }

    findPossibleRequests(id) {
        this.setState({
            hasRequests: stickerController.hasRequestsForSticker(id),
        });
    }

    /**
     *
     * @returns
     */
    render() {
        if (this.state.location !== '') {
            return <Redirect to={this.state.location}></Redirect>;
        }

        return (
            <Container className="p-4 lg: w-75 xl: w-75 sm: p-0 sm: w-100">
                <Row>
                    <Col className="text-center justify-content-center align-items-center">
                        <h1>
                            Sponsorship Sticker Editor
                        </h1>
                    </Col>
                </Row>

                {this.state.loading ? (
                    <>
                        <Loading />
                    </>
                ) : (
                    <>
                        {this.state.isValid &&
                        this.state.sticker.state === 1 ? (
                            <Row className="mt-4">
                                <Col>
                                    <Card body>
                                        <p className="fs-3 mt-2">
                                            Revert Sticker
                                        </p>
                                        <hr />
                                        {this.state.hasRequests ? (
                                            <Alert variant="danger">
                                                <p className="fs-2">
                                                    ⚠️ Warning
                                                </p>
                                                You currently have open requests
                                                with this sticker. The requests
                                                that you have submitted will not
                                                be updated and will need to be
                                                resent. Make sure you do this
                                                immediately after you finalize
                                                again as the result will still
                                                be different even if you make no
                                                changes.
                                            </Alert>
                                        ) : (
                                            <Alert variant="success">
                                                <p className="fs-2">❓ Note</p>
                                                You have no open requests with
                                                this id, how ever this does not
                                                mean that there are no accepted
                                                stickers with this id. You will
                                                need to update the sticker where
                                                ever it is used after you have
                                                made your changes.
                                            </Alert>
                                        )}
                                        <p>
                                            While we are in alpha, please be
                                            very careful with what you are about
                                            to do.
                                        </p>
                                        <div className="d-grid">
                                            <Button
                                                variant="danger"
                                                onClick={async () => {
                                                    const sticker = {
                                                        ...storageController
                                                            .values.stickers[
                                                            this.state.sticker
                                                                .id
                                                        ],
                                                    };

                                                    delete sticker.final;
                                                    sticker.state = 0;
                                                    storageController.values.stickers[
                                                        this.state.sticker.id
                                                    ] = sticker;
                                                    storageController.saveData();

                                                    await waitSetState(this, {
                                                        sticker,
                                                        isValid: false,
                                                    });

                                                    await this.componentDidMount();
                                                }}
                                            >
                                                {resources.$.UI.Action.Revert}
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        ) : (
                            <></>
                        )}
                        {/** If sticker is valid */}
                        {this.state.isValid &&
                        this.state.sticker.state !== 1 ? (
                            <>
                                <Row className="mt-2 gy-2">
                                    <Col lg={4}></Col>
                                    <Col>
                                        <Row className="align-items-center h-100 p-2">
                                            <Col className="mx-auto">
                                                <div className="d-grid gap-2 d-md-flex justify-content-sm-end">
                                                    <Button
                                                        variant="success"
                                                        size="md"
                                                        disabled={
                                                            !this.state
                                                                .canFinalize
                                                        }
                                                        onClick={() => {
                                                            this.finalizeSticker()
                                                                .catch((e) => {
                                                                    this.setError(
                                                                        e
                                                                    );
                                                                })
                                                                .finally(() => {
                                                                    this.setState(
                                                                        {
                                                                            loading: false,
                                                                        }
                                                                    );
                                                                });
                                                        }}
                                                    >
                                                        {
                                                            resources.$.UI
                                                                .Symbols.Ready
                                                        }
                                                    </Button>
                                                    <Button
                                                        variant="light"
                                                        onClick={() => {
                                                            this.setSection(
                                                                'overview'
                                                            );
                                                        }}
                                                        disabled={
                                                            this.state
                                                                .section ===
                                                            'overview'
                                                        }
                                                    >
                                                        {
                                                            resources.$.UI
                                                                .Action.Overview
                                                        }
                                                    </Button>
                                                    <Button
                                                        variant="light"
                                                        onClick={() => {
                                                            this.setSection(
                                                                'metadata'
                                                            );
                                                        }}
                                                        disabled={
                                                            this.state
                                                                .section ===
                                                            'metadata'
                                                        }
                                                    >
                                                        {
                                                            resources.$.UI
                                                                .Action
                                                                .EditMetadata
                                                        }
                                                    </Button>
                                                    <Button
                                                        variant="light"
                                                        onClick={() => {
                                                            this.setSection(
                                                                'apperance'
                                                            );
                                                        }}
                                                        disabled={
                                                            this.state
                                                                .section ===
                                                            'apperance'
                                                        }
                                                    >
                                                        {
                                                            resources.$.UI
                                                                .Action
                                                                .EditApperance
                                                        }
                                                    </Button>
                                                    <Button
                                                        variant="light"
                                                        onClick={() => {
                                                            this.setSection(
                                                                'preview'
                                                            );
                                                        }}
                                                        disabled={
                                                            this.state
                                                                .section ===
                                                            'preview'
                                                        }
                                                    >
                                                        {
                                                            resources.$.UI
                                                                .Action.Preview
                                                        }
                                                    </Button>
                                                    <NavigationLink
                                                        location="/sticker/creator"
                                                        size="md"
                                                        variant="dark"
                                                        text={
                                                            resources.$.UI
                                                                .Action.Back
                                                        }
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>

                                {/** Editor Sections */}
                                {this.state.section === 'overview' ? (
                                    <Overview
                                        isValid={this.state.isValid}
                                        sticker={this.state.sticker}
                                        saveSticker={this.saveSticker.bind(
                                            this
                                        )}
                                        setInSticker={this.setInSticker.bind(
                                            this
                                        )}
                                        setSection={this.setSection.bind(this)}
                                        calculateStorageUsage={this.calculateStorageUsage.bind(
                                            this
                                        )}
                                        setError={this.setError.bind(this)}
                                        assets={this.state.assets}
                                        validApperance={
                                            this.state.validApperance
                                        }
                                        processApperance={this.processApperance.bind(
                                            this
                                        )}
                                    />
                                ) : (
                                    <></>
                                )}
                                {this.state.section === 'preview' ? (
                                    <Preview
                                        isValid={this.state.isValid}
                                        sticker={this.state.sticker}
                                        saveSticker={this.saveSticker.bind(
                                            this
                                        )}
                                        setInSticker={this.setInSticker.bind(
                                            this
                                        )}
                                        setSection={this.setSection.bind(this)}
                                        setError={this.setError.bind(this)}
                                        calculateStorageUsage={this.calculateStorageUsage.bind(
                                            this
                                        )}
                                        assets={this.state.assets}
                                        validApperance={
                                            this.state.validApperance
                                        }
                                        processApperance={this.processApperance.bind(
                                            this
                                        )}
                                    />
                                ) : (
                                    <></>
                                )}

                                {this.state.section === 'apperance' ? (
                                    <ApperanceEditor
                                        isValid={this.state.isValid}
                                        sticker={this.state.sticker}
                                        saveSticker={this.saveSticker.bind(
                                            this
                                        )}
                                        setInSticker={this.setInSticker.bind(
                                            this
                                        )}
                                        setSection={this.setSection.bind(this)}
                                        setError={this.setError.bind(this)}
                                        calculateStorageUsage={this.calculateStorageUsage.bind(
                                            this
                                        )}
                                        assets={this.state.assets}
                                        validApperance={
                                            this.state.validApperance
                                        }
                                        processApperance={this.processApperance.bind(
                                            this
                                        )}
                                    />
                                ) : (
                                    <></>
                                )}
                                {this.state.section === 'metadata' ? (
                                    <Metadata
                                        isValid={this.state.isValid}
                                        sticker={this.state.sticker}
                                        saveSticker={this.saveSticker.bind(
                                            this
                                        )}
                                        setInSticker={this.setInSticker.bind(
                                            this
                                        )}
                                        setSection={this.setSection.bind(this)}
                                        setError={this.setError.bind(this)}
                                        calculateStorageUsage={this.calculateStorageUsage.bind(
                                            this
                                        )}
                                        assets={this.state.assets}
                                        validApperance={
                                            this.state.validApperance
                                        }
                                        processApperance={this.processApperance.bind(
                                            this
                                        )}
                                    />
                                ) : (
                                    <></>
                                )}
                            </>
                        ) : (
                            <></>
                        )}

                        {!this.state.isValid ? (
                            <Row className="mt-5">
                                <Col className="text-center">
                                    <h1 className="fs-1">Sticker Invalid</h1>
                                    <p className="fs-5">
                                        It doesn't appear this Sticker does not
                                        exists....
                                    </p>
                                    <div className="d-grid mt-2">
                                        <NavigationLink
                                            location="/sticker/creator"
                                            text={
                                                resources.$.UI.Action.MyStickers
                                            }
                                        />
                                    </div>
                                </Col>
                            </Row>
                        ) : (
                            <></>
                        )}
                        {this.state.error !== undefined ? (
                            <Row className="mt-4">
                                <Col>
                                    <Alert variant="danger">
                                        <p className="fs-2">⚠️ Error</p>
                                        {this.state.error?.message ||
                                            this.state.error}
                                    </Alert>
                                </Col>
                            </Row>
                        ) : (
                            <></>
                        )}
                        <Row className="mt-2">
                            <Col>
                                <Card body>
                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            disabled={!this.state.canFinalize}
                                            onClick={() => {
                                                this.finalizeSticker()
                                                    .catch((e) => {
                                                        this.setError(e);
                                                    })
                                                    .finally(() => {
                                                        this.setState({
                                                            loading: false,
                                                        });
                                                    });
                                            }}
                                        >
                                            {resources.$.UI.Action.Submit}
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            disabled={
                                                this.state.sticker.state === 1
                                            }
                                            onClick={() => {
                                                this.setState({
                                                    showDeleteModal: true,
                                                });
                                            }}
                                        >
                                            {
                                                resources.$.UI.Action
                                                    .DeleteSticker
                                            }
                                        </Button>
                                        <NavigationLink
                                            size="sm"
                                            variant="dark"
                                            location="/options"
                                            text={'Set IPFS Key'}
                                        />
                                        <NavigationLink
                                            size="sm"
                                            variant="dark"
                                            location="/sticker/creator"
                                            text={resources.$.UI.Action.Back}
                                        />
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
                <br />
                <br />
                <br />
                <FinalizedStickerModal
                    show={this.state.showFinalizedStickerModal}
                    sticker={this.state.sticker}
                    onHide={() => {
                        this.setState({
                            location: '/sticker/creator',
                        });
                    }}
                    onSubmit={() => {
                        this.setState({
                            location: '/sticker/creator',
                        });
                    }}
                />
                <DeleteStickerModal
                    show={this.state.showDeleteModal}
                    sticker={this.state.sticker}
                    onHide={() => {
                        this.setState({
                            showDeleteModal: !this.state.showDeleteModal,
                        });
                    }}
                    onDelete={() => {
                        this.setState({
                            location: '/sticker/creator',
                        });
                    }}
                />
            </Container>
        );
    }
}

StickerEditor.url = '/sticker/:stickerId';
StickerEditor.id = 'StickerEditor';
export default StickerEditor;
