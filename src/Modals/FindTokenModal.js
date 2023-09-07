import React, { Component } from 'react';
import {
    Modal,
    Form,
    Button,
    Col,
    Row,
    Alert,
    Card,
    ListGroup,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import { waitSetState } from '../helpers.js';
import Token from '../Components/Token.js';
// Images
import ImageIcon from '../Images/icon-512x512.png';

let _errorTimeout;
class FindTokenModal extends Component {
    constructor(props) {
        super(props);
        this.selectAllTokens = this.selectAllTokens.bind(this);
        this.state = {
            section: 0, // 0 == mytokens 1 == gallery
            hasTokens: false,
            maxPerPage: 16,
            page: 0,
            loading: false,
            tokens: [],
            hasSelectedTokens: false,
            selectedTokens: {},
            selectAllTokens: this.selectAllTokens.bind(this),
        };
    }

    async componentDidMount() {
        this.setState({
            loading: true,
        });
        if (this.state.section === 0) {
            await this.loadMytokens();
        }

        this.setState({
            loading: false,
        });
    }

    async finalizeSet() {
        if (this.props.checkSelection) {
            const selection = { ...this.state.selectedTokens };
            this.checkTokenInSelection(selection);

            await waitSetState(this, {
                selectedTokens: selection,
                hasSelectedTokens: Object.keys(selection).length > 0,
                loading: false,
            });
        }

        if (Object.values(this.state.selectedTokens).length === 0) {
            return;
        }

        this.props.onAcceptedSet(this.state.selectedTokens);
        this.setState({
            hasTokens: false,
            tokens: [],
        });
    }

    async checkTokenInSelection(selection, token = null) {
        let shouldReset = false;
        if (this.state.section === 0 && token !== null) {
            const result = await controller.callMethod(
                controller.accounts[0],
                'InfinityMint',
                'ownerOf',
                [token.token.tokenId]
            );

            if (result !== controller.accounts[0]) {
                shouldReset = true;
                delete storageController.values.tokens[token.token.tokenId];
            }
        }

        const keys = Object.keys(selection);
        for (const key of keys) {
            const result = await controller.callMethod(
                controller.accounts[0],
                'InfinityMint',
                'ownerOf',
                [key]
            );
            if (result !== controller.accounts[0]) {
                shouldReset = true;
                delete storageController.values.tokens[key];
                storageController.saveData();
                delete selection[key];
            }
        }

        if (shouldReset) {
            await this.loadMytokens();
        }
    }

    async onClick(token) {
        if (this.props.allowMultiple === true) {
            const selection = {
                ...this.state.selectedTokens,
                [token.token.tokenId]: token,
            };

            /**
			If (this.props.checkSelection) {
				this.checkTokenInSelection(selection, token);
			} */

            await waitSetState(this, {
                selectedTokens: selection,
                hasSelectedTokens: Object.keys(selection).length > 0,
            });

            return;
        }

        if (this.props.onSelected === undefined) {
            return;
        }

        this.props.onSelected(token.token);
        this.setState({
            hasTokens: false,
            tokens: [],
            page: 0,
        });
    }

    async loadMytokens() {
        await waitSetState(this, {
            tokens: [],
            hasTokens: false,
        });
        const tokens = await controller.getTokens();

        if (tokens.length > 0) {
            this.setState({
                hasTokens: true,
                tokens,
            });
        }
    }

    async selectAllTokens() {
        
        const { tokens } = this.state; // or this.props, depending on where you store it
    
        let newSelection = { ...this.state.selectedTokens };
    
        for (let token of tokens) {
            newSelection[token.token.tokenId] = token;
            
            // If you have a checkSelection prop, you can check each token in the selection
            if (this.props.checkSelection) {
                this.checkTokenInSelection(newSelection, token);
            }
        }
    
        await waitSetState(this, {
            selectedTokens: newSelection,
            hasSelectedTokens: Object.keys(newSelection).length > 0,
        });
    }

    deleteFromSelection(token) {
        token = token.token.token || token;
        const object = { ...this.state.selectedTokens };
        delete object[token.tokenId];
        this.setState({
            selectedTokens: object,
            hasSelectedTokens: Object.values(object).length > 0,
        });
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
            error: error.message || error.error || error,
        });
        this.cleanupError(5);
    }

    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={async () => {
                    if (
                        this.props.allowMultiple &&
                        this.state.hasSelectedTokens
                    ) {
                        await this.finalizeSet();
                    }

                    if (this.props.onHide !== undefined) {
                        this.props.onHide();
                    }

                    this.setState({
                        tokens: [],
                        hasTokens: false,
                        page: 0,
                    });
                }}
                size="xl"
            >
                <Modal.Body>
                    <Row>
                        <Col className="p-2">
                            <div className="d-grid">
                                <Button
                                    variant="dark"
                                    size="sm"
                                    onClick={async () => {
                                        this.setState({
                                            section: 0,
                                        });

                                        await this.loadMytokens();
                                    }}
                                >
                                    {resources.$.UI.Action.MyTokens}
                                </Button>
                            </div>
                        </Col>
                        <Col className="p-2">
                            <div className="d-grid">
                                <Button variant="dark" size="xl">
                                    {resources.$.UI.Action.AllTokens}
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    {this.state.error !== undefined &&
                    this.state.error !== null ? (
                        <Row className="mt-2">
                            <Col>
                                <Alert
                                    variant="danger"
                                    className="text-center mt-2"
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
                    <Row className="mt-2">
                        {this.state.section === 0 ? (
                            <>
                                <p className="fs-4">
                                    {resources.$.UI.Action.MyTokens}{' '}
                                    <span className="badge bg-success">
                                        {this.state.tokens.length}
                                    </span>{' '}
                                    <span className="badge bg-light">
                                        Page {this.state.page}
                                    </span>
                                </p>
                                <p>
                               
                                    <div>
                                        <Button
                                            className='w-100'
                                        variant="danger"
                                        size="xl"
                                        onClick={
                                            this.selectAllTokens.bind(this)
                                            }
                                        >Select All</Button>
                                    </div>
                                
                                </p>

                                <Row hidden={!this.state.hasSelectedTokens}>
                        <Col>
                            <hr />
                            <div className="d-grid mt-2 gap-2">
                                <Button
                                    variant="success"
                                    onClick={() => {
                                        this.finalizeSet();
                                    }}
                                >
                                    Accept Selection{' '}
                                    <span className="badge bg-light">
                                        {
                                            Object.values(
                                                this.state.selectedTokens
                                            ).length
                                        }
                                    </span>
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        this.setState({
                                            selectedTokens: {},
                                            hasSelectedTokens: false,
                                        });
                                    }}
                                >
                                    Clear Selection
                                </Button>
                            </div>
                        </Col>
                    </Row>

                                {this.state.hasSelectedTokens ? (
                                    <Row>
                                        <Col>
                                            <Alert variant="light">
                                                <p className="fs-3">
                                                    Basket{' '}
                                                    <span className="badge bg-dark">
                                                        {
                                                            Object.values(
                                                                this.state
                                                                    .selectedTokens
                                                            ).length
                                                        }
                                                    </span>
                                                </p>
                                                <ListGroup>
                                                    {Object.values(
                                                        this.state
                                                            .selectedTokens
                                                    ).map((token) => {
                                                        const actualToken =
                                                            token.token.token;
                                                        return (
                                                            <ListGroup.Item
                                                                key={
                                                                    actualToken.tokenId
                                                                }
                                                            >
                                                                <span
                                                                    className="badge"
                                                                    style={{
                                                                        textDecoration:
                                                                            'underline',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                    onClick={() => {
                                                                        this.deleteFromSelection(
                                                                            token
                                                                        );
                                                                    }}
                                                                >
                                                                    ❌ Remove
                                                                </span>
                                                                <span className="badge bg-light">
                                                                    #
                                                                    {
                                                                        actualToken.tokenId
                                                                    }
                                                                </span>{' '}
                                                                {
                                                                    actualToken.name
                                                                }{' '}
                                                                <span className="badge bg-dark">
                                                                    {
                                                                        controller.getPathSettings(
                                                                            actualToken.pathId
                                                                        ).name
                                                                    }
                                                                </span>
                                                            </ListGroup.Item>
                                                        );
                                                    })}
                                                </ListGroup>
                                            </Alert>
                                            <div className="d-grid mt-2 gap-2">
                                                <Button
                                                    variant="success"
                                                    onClick={() => {
                                                        this.finalizeSet();
                                                    }}
                                                >
                                                    Accept Selection{' '}
                                                    <span className="badge bg-light">
                                                        {
                                                            Object.values(
                                                                this.state
                                                                    .selectedTokens
                                                            ).length
                                                        }
                                                    </span>
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => {
                                                        this.setState({
                                                            selectedTokens: {},
                                                            hasSelectedTokens: false,
                                                        });
                                                    }}
                                                >
                                                    Clear Selection
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                ) : (
                                    <></>
                                )}
                                <Row className="row-cols-3 g-2">
                                    {!this.state.loading &&
                                    this.state.hasTokens === false ? (
                                        <Col>
                                            <Alert variant="light">
                                                <p className="fs-5">
                                                    Nothing Found...
                                                </p>
                                                <p>
                                                    If you recently added a token, you might need to refresh.
                                                </p>
                                                <div className="d-grid">
                                                    <Button
                                                        variant="light"
                                                        onClick={async () => {
                                                            await this.loadMytokens();
                                                            this.setState({
                                                                section: 0,
                                                            });

                                                            if (
                                                                this.props
                                                                    .checkSelection
                                                            ) {
                                                                const selection =
                                                                    {
                                                                        ...this
                                                                            .state
                                                                            .selectedTokens,
                                                                    };
                                                                this.checkTokenInSelection(
                                                                    selection
                                                                );
                                                                await waitSetState(
                                                                    this,
                                                                    {
                                                                        selectedTokens:
                                                                            selection,
                                                                        hasSelectedTokens:
                                                                            Object.keys(
                                                                                selection
                                                                            )
                                                                                .length >
                                                                            0,
                                                                        loading: false,
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        ♻️ Refresh
                                                    </Button>
                                                </div>
                                            </Alert>
                                        </Col>
                                    ) : (
                                        this.state.tokens.map(
                                            (token, index) => {
                                                /**
												If (index < (this.state.maxPerPage * this.state.page))
													continue;
												*/
                                                if (
                                                    index >=
                                                    this.state.maxPerPage *
                                                        (this.state.page + 1)
                                                ) {
                                                    return '';
                                                }

                                                return (
                                                    <Token
                                                        theToken={token.token}
                                                        className={'d-grid'}
                                                        key={index}
                                                        static={true}
                                                        style={{
                                                            cursor: 'pointer',
                                                        }}
                                                        disabled={
                                                            this.state
                                                                .selectedTokens[
                                                                token.token
                                                                    .tokenId
                                                            ] !== undefined
                                                        }
                                                        maxHeight={true}
                                                        onClick={() => {
                                                            if (
                                                                !this.props
                                                                    .allowMultiple ||
                                                                this.state
                                                                    .selectedTokens[
                                                                    token.token
                                                                        .tokenId
                                                                ] === undefined
                                                            ) {
                                                                this.onClick(
                                                                    token
                                                                );
                                                            }
                                                        }}
                                                        settings={{
                                                            noBorder: true,
                                                            hideModBadges: true,
                                                            hidePathName: true,
                                                        }}
                                                        element={
                                                            <div className="d-grid mt-2">
                                                                <Button
                                                                    variant="danger"
                                                                    hidden={
                                                                        this
                                                                            .state
                                                                            .selectedTokens[
                                                                            token
                                                                                .token
                                                                                .tokenId
                                                                        ] ===
                                                                        undefined
                                                                    }
                                                                    onClick={async () => {
                                                                        this.deleteFromSelection(
                                                                            token
                                                                        );
                                                                    }}
                                                                >
                                                                    {
                                                                        resources
                                                                            .$
                                                                            .UI
                                                                            .Action
                                                                            .Unselect
                                                                    }{' '}
                                                                    <span
                                                                        className="badge bg-light"
                                                                        hidden={
                                                                            index !==
                                                                            0
                                                                        }
                                                                    >
                                                                        First
                                                                    </span>{' '}
                                                                    <span
                                                                        className="badge bg-light"
                                                                        hidden={
                                                                            index !==
                                                                            this
                                                                                .state
                                                                                .tokens
                                                                                .length -
                                                                                1
                                                                        }
                                                                    >
                                                                        Last
                                                                    </span>
                                                                </Button>
                                                                <Button
                                                                    variant="success"
                                                                    hidden={
                                                                        this
                                                                            .props
                                                                            .allowMultiple &&
                                                                        this
                                                                            .state
                                                                            .selectedTokens[
                                                                            token
                                                                                .token
                                                                                .tokenId
                                                                        ] !==
                                                                            undefined
                                                                    }
                                                                    onClick={async () => {
                                                                        await this.onClick(
                                                                            token
                                                                        );
                                                                    }}
                                                                >
                                                                    {
                                                                        resources
                                                                            .$
                                                                            .UI
                                                                            .Action
                                                                            .Select
                                                                    }{' '}
                                                                    <span
                                                                        className="badge bg-light"
                                                                        hidden={
                                                                            index !==
                                                                            0
                                                                        }
                                                                    >
                                                                        First
                                                                    </span>{' '}
                                                                    <span
                                                                        className="badge bg-light"
                                                                        hidden={
                                                                            index !==
                                                                            this
                                                                                .state
                                                                                .tokens
                                                                                .length -
                                                                                1
                                                                        }
                                                                    >
                                                                        Last
                                                                    </span>
                                                                </Button>
                                                            </div>
                                                        }
                                                    >
                                                        {this.state
                                                            .selectedTokens[
                                                            token.token.tokenId
                                                        ] !== undefined ? (
                                                            <>
                                                                <br />
                                                                <span className="badge bg-danger me-2 fs-1 mt-2">
                                                                    Selected
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </Token>
                                                );
                                            }
                                        )
                                    )}
                                    {this.state.hasTokens &&
                                    this.state.tokens.length >
                                        this.state.maxPerPage &&
                                    (this.state.page + 1) *
                                        this.state.maxPerPage <
                                        this.state.tokens.length ? (
                                        <>
                                            <Col className="d-grid">
                                                <Card body>
                                                    <Row className="justify-content-center">
                                                        <Col lg={10}>
                                                            <img
                                                                className="mx-auto dblock img-fluid"
                                                                alt="icon"
                                                                src={ImageIcon}
                                                                onClick={() => {
                                                                    this.setState(
                                                                        {
                                                                            page:
                                                                                this
                                                                                    .state
                                                                                    .page +
                                                                                1,
                                                                        }
                                                                    );
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <div className="d-grid">
                                                        <Button
                                                            variant="light"
                                                            size="sm"
                                                            onClick={() => {
                                                                this.setState({
                                                                    page:
                                                                        this
                                                                            .state
                                                                            .page +
                                                                        1,
                                                                });
                                                            }}
                                                        >
                                                            Show More
                                                        </Button>
                                                    </div>
                                                </Card>
                                            </Col>
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                </Row>
                            </>
                        ) : (
                            <></>
                        )}
                    </Row>
                    {this.state.loading ? (
                        <Row>
                            <Col>
                                <Alert variant="light" className="text-center">
                                    <p className="fs-2">Loading...</p>
                                    If this takes a while then there might be
                                    something wrong with your Web3 wallet
                                    extension.
                                </Alert>
                            </Col>
                        </Row>
                    ) : (
                        <></>
                    )}
                    <Row hidden={!this.state.hasSelectedTokens}>
                        <Col>
                            <hr />
                            <div className="d-grid mt-2 gap-2">
                                <Button
                                    variant="success"
                                    onClick={() => {
                                        this.finalizeSet();
                                    }}
                                >
                                    Accept Selection{' '}
                                    <span className="badge bg-light">
                                        {
                                            Object.values(
                                                this.state.selectedTokens
                                            ).length
                                        }
                                    </span>
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        this.setState({
                                            selectedTokens: {},
                                            hasSelectedTokens: false,
                                        });
                                    }}
                                >
                                    Clear Selection
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        );
    }
}

// Types
FindTokenModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    onSelected: PropTypes.func,
};

export default FindTokenModal;
