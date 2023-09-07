import React, { Component } from 'react';
import {
    Badge,
    Container,
    Row,
    Col,
    Card,
    Alert,
    ListGroup,
    Button,
    Form,
    Pagination,
} from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import CreateStickerModal from '../Modals/CreateStickerModal.js';
import LoadStickerModal from '../Modals/LoadStickerModal.js';
import NavigationLink from '../Components/NavigationLink.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import Config from '../config.js';
import DeleteStickerModal from '../Modals/DeleteStickerModal.js';
import SaveStickerModal from '../Modals/SaveStickerModal.js';
import FindStickerModal from '../Modals/FindStickerModal.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import { cutLongString, tryDecodeURI } from '../helpers.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Box from '../Components/Box.js';

class StickerCreator extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            showCreateModal: false,
            showLoadModal: false,
            showFindStickerModal: false,
            showDeleteModal: false,
            showSaveModal: false,
            location: '',
            stickers: {},
            preview: {},
            selectedSticker: {},
            hasStickers: false,
            orderBy: 'created',
            orderAsc: false,
            maxPerPage: 64,
            rowNumber: 2,
        };

        this.willUnmount = false;
    }

    toggleOrderBy(value) {
        this.setState({
            orderBy: value,
        });

        storageController.setPagePreference('orderBy', value);
    }

    setMaxPerPage(value) {
        this.setState({
            maxPerPage: value,
        });

        storageController.setPagePreference('maxPerPage', value);
    }

    componentDidMount() {
        this.setState({
            location: '',
        });

        if (this.props.rowNumber !== undefined) {
            this.setState({
                rowNumber: this.props.rowNumber,
            });
        }

        const maxPerPage = storageController.getPagePreference('maxPerPage');
        if (maxPerPage !== undefined) {
            this.setState({
                maxPerPage,
            });
        }

        const orderBy = storageController.getPagePreference('orderBy');
        if (orderBy !== undefined) {
            this.setState({
                orderBy,
            });
        }

        if (storageController.existsAndNotEmpty('stickers')) {
            this.setState({
                stickers: Object.values(storageController.values.stickers),
                hasStickers: true,
            });
        }

        clearInterval(this.interval);
        this.interval = setInterval(() => {
            const length = Object.values(
                storageController.values.stickers
            ).length;
            if (!this.willUnmount && this.state.stickers.length !== length) {
                this.setState({
                    stickers: Object.values(storageController.values.stickers),
                    hasStickers: length !== 0,
                });
            }
        }, 2000); // Check every 2 second for an update
    }

    componentWillUnmount() {
        this.willUnmount = true;
        clearInterval(this.interval);
    }

    render() {
        let stickers = [];
        if (this.state.hasStickers) {
            stickers = !this.state.orderAsc
                ? this.state.stickers.reverse()
                : this.state.stickers;
        }

        if (this.state.location !== '') {
            return <Redirect to={this.state.location} />;
        }

        return (
            <>
                <Container className="p-4 lg: w-75 xl: w-75 sm: p-0 sm: w-100">
                    <Row
                        className={
                            this.props?.textBlack ? 'text-black' : 'text-white'
                        }
                    >
                        <Col className="text-center">
                            <h1>
                                The Sticker Creator
                            </h1>
                            <p className="fs-6">
                                Create EADS.eth stickers to offer sponsorship
                                and advertising opportunities for the tokens in
                                the {resources.projectTokenPlural()} ecosystem.
                            </p>
                        </Col>
                    </Row>

                    <Row className="mt-2 pb-5 gy-2">
                        <div className="d-grid">
                            <Pagination className="bg-black mx-auto">
                                <Pagination.First />
                                <Pagination.Prev />
                                <Pagination.Item>{1}</Pagination.Item>
                                <Pagination.Next />
                                <Pagination.Last />
                            </Pagination>
                        </div>
                        <Col lg={4}>
                            <Card body>
                                <div className="d-grid gap-2">
                                    {/** open up load */}
                                    <Button
                                        variant="success"
                                        size="lg"
                                        onClick={() =>
                                            this.setState({
                                                showCreateModal: true,
                                            })
                                        }
                                    >
                                        {resources.$.UI.Action.CreateSticker}
                                    </Button>
                                    {/** open up load */}
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={() =>
                                            this.setState({
                                                showLoadModal: true,
                                            })
                                        }
                                    >
                                        {resources.$.UI.Action.LoadStickers}
                                    </Button>
                                    <Button
                                        variant="info"
                                        size="lg"
                                        onClick={() =>
                                            this.setState({
                                                selectedSticker:
                                                    this.state.stickers,
                                                showSaveModal: true,
                                            })
                                        }
                                    >
                                        {resources.$.UI.Action.DownloadStickers}
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="lg"
                                        onClick={() =>
                                            this.setState({
                                                showFindStickerModal: true,
                                            })
                                        }
                                    >
                                        {resources.$.UI.Action.RevertSticker}
                                    </Button>
                                </div>
                            </Card>
                            <Card body className="mt-4">
                                <p>Order By</p>
                                <ListGroup
                                    defaultActiveKey={'#' + this.state.orderBy}
                                    variant="light"
                                >
                                    {Config.settings.stickerOrderBy.map(
                                        (value, index) => (
                                            <ListGroup.Item
                                                variant="dark"
                                                key={index}
                                                action
                                                onClick={() => {
                                                    this.toggleOrderBy(
                                                        value.toLowerCase()
                                                    );
                                                }}
                                                href={'#' + value.toLowerCase()}
                                                aria-current="true"
                                            >
                                                {value}
                                            </ListGroup.Item>
                                        )
                                    )}
                                </ListGroup>
                                <div className="d-grid mt-4">
                                    <Form.Check
                                        type="switch"
                                        label="Ascending (smallest to largest)"
                                        onChange={(e) => {
                                            this.setState({
                                                orderAsc: e.target.checked,
                                            });
                                        }}
                                    />
                                </div>
                                <p className="mt-3">Max Per Page</p>
                                <Row className="row-cols-3 gy-4 gx-4">
                                    {Config.settings.maxButtons.map(
                                        (value, index) => (
                                            <Col
                                                className="d-grid p-1"
                                                key={index}
                                            >
                                                <Button
                                                    variant={
                                                        this.state
                                                            .maxPerPage ===
                                                        value
                                                            ? 'dark'
                                                            : 'light'
                                                    }
                                                    onClick={() => {
                                                        this.setMaxPerPage(
                                                            value
                                                        );
                                                    }}
                                                >
                                                    {value}
                                                </Button>
                                            </Col>
                                        )
                                    )}
                                </Row>
                                <div className="d-grid mt-4 gap-2">
                                    <Button
                                        variant="dark"
                                        onClick={() => {
                                            window.location.href = '#navbar';
                                        }}
                                    >
                                        {resources.$.UI.Action.ToTop}
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                        <Col lg>
                            {!this.state.hasStickers ? (
                                <Alert
                                    variant="danger"
                                    className="force-white mt-1"
                                >
                                    No Stickers Found
                                </Alert>
                            ) : (
                                stickers.map((value, index) => {
                                    if (index >= this.state.maxPerPage) {
                                        return <></>;
                                    }

                                    if (
                                        value.owner !== controller.accounts[0]
                                    ) {
                                        return (
                                            <Row className="mb-2" key={index}>
                                                <Col lg={12}>
                                                    <Card
                                                        body
                                                        className="p-2 bg-black text-white"
                                                    >
                                                        <p className="fs-2">
                                                            🔒{' '}
                                                            {tryDecodeURI(
                                                                value.name
                                                            )}
                                                        </p>
                                                        This sticker is owned by{' '}
                                                        <u>{value.owner}</u>.
                                                        You must switch to that
                                                        address in your wallet
                                                        to be able to edit this
                                                        sticker.
                                                    </Card>
                                                </Col>
                                            </Row>
                                        );
                                    }

                                    return (
                                        <Row className="mb-2" key={index}>
                                            <Col lg={12}>
                                                <Card body>
                                                    <Row>
                                                        <Col
                                                            className="d-grid p-2"
                                                            lg={9}
                                                        >
                                                            <div className="fs-4 text-white">
                                                                <span>
                                                                    <h4>
                                                                        {cutLongString(
                                                                            value.name,
                                                                            20
                                                                        )}
                                                                    </h4>
                                                                    <p className="fs-6">
                                                                        Created{' '}
                                                                        {new Date(
                                                                            value.created
                                                                        ).toLocaleString()}
                                                                    </p>
                                                                </span>
                                                                <hr />
                                                                <Badge className="fs-6">
                                                                    {
                                                                        Config
                                                                            .settings
                                                                            .environments[
                                                                            value
                                                                                .environment
                                                                        ].name
                                                                    }
                                                                </Badge>
                                                                <Badge
                                                                    className={
                                                                        'fs-6 ms-2'
                                                                    }
                                                                >
                                                                    {
                                                                        Config
                                                                            .settings
                                                                            .environments[
                                                                            value
                                                                                .environment
                                                                        ].type
                                                                    }
                                                                </Badge>
                                                                <Badge
                                                                    className={
                                                                        ' ' +
                                                                        (value.state ===
                                                                        1
                                                                            ? 'bg-success'
                                                                            : 'bg-warning') +
                                                                        ' fs-6 ms-2'
                                                                    }
                                                                >
                                                                    {value.state ===
                                                                        0 ||
                                                                    value.state ===
                                                                        undefined
                                                                        ? 'Not Ready'
                                                                        : 'Ready'}
                                                                </Badge>
                                                                <Badge
                                                                    bg="white"
                                                                    className={
                                                                        'text-black fs-6 mt-2 d-none d-lg-block d-xl-block'
                                                                    }
                                                                >
                                                                    Created by{' '}
                                                                    {
                                                                        value.owner
                                                                    }
                                                                </Badge>
                                                            </div>
                                                        </Col>
                                                        <Col>
                                                            <Card body>
                                                                <div className="d-grid gap-2">
                                                                    <NavigationLink
                                                                        variant="light"
                                                                        text={
                                                                            value.state ===
                                                                            1
                                                                                ? resources
                                                                                      .$
                                                                                      .UI
                                                                                      .Action
                                                                                      .Revert
                                                                                : resources
                                                                                      .$
                                                                                      .UI
                                                                                      .Action
                                                                                      .Edit
                                                                        }
                                                                        size="md"
                                                                        location={
                                                                            '/sticker/' +
                                                                            value.id
                                                                        }
                                                                    />
                                                                    <Button
                                                                        variant="light"
                                                                        onClick={() => {
                                                                            this.setState(
                                                                                {
                                                                                    selectedSticker:
                                                                                        value,
                                                                                    showSaveModal: true,
                                                                                }
                                                                            );
                                                                        }}
                                                                    >
                                                                        {
                                                                            resources
                                                                                .$
                                                                                .UI
                                                                                .Action
                                                                                .Download
                                                                        }
                                                                    </Button>
                                                                    <Button
                                                                        disabled={
                                                                            value.state ===
                                                                            1
                                                                        }
                                                                        variant="danger"
                                                                        onClick={() => {
                                                                            this.setState(
                                                                                {
                                                                                    selectedSticker:
                                                                                        value,
                                                                                    showDeleteModal: true,
                                                                                }
                                                                            );
                                                                        }}
                                                                    >
                                                                        {
                                                                            resources
                                                                                .$
                                                                                .UI
                                                                                .Action
                                                                                .Delete
                                                                        }
                                                                    </Button>
                                                                </div>
                                                            </Card>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            </Col>
                                        </Row>
                                    );
                                })
                            )}
                        </Col>
                    </Row>
                </Container>
                <LoadStickerModal
                    show={this.state.showLoadModal}
                    onHide={() => {
                        this.setState({
                            showLoadModal: !this.state.showLoadModal,
                        });
                    }}
                />
                <CreateStickerModal
                    show={this.state.showCreateModal}
                    onHide={() => {
                        this.setState({
                            showCreateModal: !this.state.showCreateModal,
                        });
                    }}
                />
                <FindStickerModal
                    show={this.state.showFindStickerModal}
                    onHide={() => {
                        this.setState({
                            showFindStickerModal:
                                !this.state.showFindStickerModal,
                        });
                    }}
                    onSelected={(sticker) => {
                        this.setState({
                            location: '/sticker/' + sticker.id,
                        });
                    }}
                />
                <DeleteStickerModal
                    show={this.state.showDeleteModal}
                    sticker={this.state.selectedSticker}
                    onHide={() => {
                        this.setState({
                            showDeleteModal: !this.state.showDeleteModal,
                        });
                    }}
                />
                <SaveStickerModal
                    show={this.state.showSaveModal}
                    sticker={this.state.selectedSticker}
                    onHide={() => {
                        this.setState({
                            showSaveModal: !this.state.showSaveModal,
                        });
                    }}
                />
            </>
        );
    }
}

StickerCreator.url = '/sticker/creator';
StickerCreator.id = 'StickerCreator';
StickerCreator.settings = {
    dropdown: {
        stickers: '$.UI.Action.CreateSticker',
    },
};
export default StickerCreator;
