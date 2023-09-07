import React, { Component } from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    Card,
    Pagination,
    ListGroup,
    Form,
    Alert,
} from 'react-bootstrap';
import Config from '../config.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
// Images
import ImageIcon from '../Images/icon-512x512.png';
import ImageMissing from '../Images/missingWeb3.png';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import TokenMethods from 'infinitymint-client/dist/src/classic/tokenMethods.js';
import { connectWallet, decideRowClass } from '../helpers.js';
import GalleryItem from './GalleryItem.js';

class GalleryElement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orderBy: 'creation',
            orderAsc: true,
            maxPerPage: 64,
            categories: {},
            loaded: false,
            results: [],
            rowClass: 'row-cols-3 gy-2',
            rowInterval: null,
            key: 0,
        };
    }

    async componentDidMount() {
        this.setState({
            rowClass: decideRowClass(
                [],
                this.props.rowColumnClass || 'row-cols-3'
            ),
        });

        if (this.props.rowNumber !== undefined) {
            this.setState({
                rowNumber: this.props.rowNumber,
            });
        }

        const orderBy = storageController.getGlobalPreference('galleryOrderBy');
        if (orderBy !== undefined) {
            this.setState({
                orderBy,
            });
        }

        let maxPerPage =
            storageController.getGlobalPreference('galleryMaxPerPage');

        if (maxPerPage === undefined) {
            maxPerPage = Config.settings.maxTokenCount;
        }

        if (maxPerPage !== undefined) {
            this.setState({
                maxPerPage,
            });
        }

        storageController.setGlobalPreference('galleryMaxPerPage', maxPerPage);

        const interval = setInterval(() => {
            try {
                const rowClass = decideRowClass(
                    this.state.results,
                    this.props.rowColumnClass || 'row-cols-3'
                );
                if (rowClass !== this.state.rowClass) {
                    this.setState({
                        rowClass,
                    });
                }
            } catch (error) {
                controller.log('failed interval', 'error');
                controller.log(error);
            }
        }, 1000);

        this.setState({
            rowInterval: interval,
        });

        if (this.props?.loadInstantly === true && controller.isWeb3Valid) {
            await this.load();
        }
    }

    async load() {
        let tokens;
        if (this.props.useMemory) {
            tokens = Object.values(storageController.values.tokens || {})
                .slice(0, this.state.maxPerPage || 12)
                .map((token) => token.token);
        } else {
            tokens = [];
            const totalSupply = await controller.callMethod(
                controller.accounts[0],
                'InfinityMintApi',
                'totalMints'
            );
            for (let i = 0; i < totalSupply; i++) {
                const result = await controller.tryGetToken(i);

                if (!result) {
                    continue;
                }

                const token = controller.getStoredToken(i);
                tokens.push(token.token || token);
            }
        }

        this.setState({
            results: tokens,
        });

        this.setState({
            loaded: true,
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.rowInterval);
    }

    toggleOrderBy(value) {
        this.setState({
            orderBy: value,
        });

        storageController.setGlobalPreference('galleryOrderBy', value);
    }

    toggleCategory(value) {
        const categories = { ...this.state.categories };
        if (categories[value] !== undefined) {
            categories[value] = undefined;
        } else {
            categories[value] = true;
        }

        this.setState({
            categories,
        });
    }

    componentDidUpdate() {
        const rowClass = decideRowClass(
            this.state.results,
            this.props.rowColumnClass || 'row-cols-3'
        );
        if (rowClass !== this.state.rowClass) {
            this.setState({
                rowClass,
            });
        }

        // Resizes all the tokens as well on row
        TokenMethods.onWindowResize(controller);
    }

    setMaxPerPage(value) {
        this.setState({
            maxPerPage: value,
        });

        storageController.setGlobalPreference('galleryMaxPerPage', value);
        this.load();
    }

    render() {
        return (
            <>
                {this.props.showHeader === true ? (
                    <>
                        <Row
                            className={
                                'mt-2 ' +
                                (this.props?.textBlack
                                    ? 'force-black'
                                    : 'text-white')
                            }
                        >
                            <Col className="text-center">
                                <h1 className=" text-white display-5">
                                    {resources.$.Pages.Gallery.Title}
                                </h1>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <></>
                )}
                <Row className="gy-4">
                    <Col
                        lg={this.props.sidebarWidth || 4}
                        hidden={this.props.hiddenSidebar === true}
                    >
                        <Card body>
                            <div className="mb-3">
                                <label htmlFor="search" className="form-label">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    id="search"
                                    name="search"
                                    disabled={!Config.isApiEnabled()}
                                    placeholder={
                                        'Epic ' +
                                        controller.getDescription().token
                                    }
                                />
                            </div>
                            <p>Order By</p>
                            <ListGroup
                                defaultActiveKey={'#' + this.state.orderBy}
                                variant="flush"
                            >
                                {Config.settings.galleryOrderBy.map(
                                    (value, index) => (
                                        <ListGroup.Item
                                            variant="light"
                                            key={'lg_'+value+(index++)}
                                            className={
                                                this.state.orderBy.toLowerCase() ===
                                                value
                                                    ? 'text-white'
                                                    : 'text-black'
                                            }
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
                                />
                            </div>
                            <p className="mt-3">Types</p>
                            <Row className="row-cols-3 gy-4 gx-4">
                                {Config.settings.galleryCategories.map(
                                    (value, index) => (
                                        <Col className="d-grid" key={index}>
                                            <Button
                                                variant={
                                                    this.state.categories[
                                                        value
                                                    ] !== undefined
                                                        ? 'dark'
                                                        : 'light'
                                                }
                                                onClick={() => {
                                                    this.toggleCategory(value);
                                                }}
                                            >
                                                {value}
                                            </Button>
                                        </Col>
                                    )
                                )}
                            </Row>
                            <p className="mt-3">Max Per Page</p>
                            <Row className="row-cols-3 gy-4 gx-4">
                                {Config.settings.maxButtons.map(
                                    (value, index) => (
                                        <Col className="d-grid" key={index}>
                                            <Button
                                                variant={
                                                    this.state.maxPerPage ===
                                                    value
                                                        ? 'dark'
                                                        : 'light'
                                                }
                                                onClick={() => {
                                                    this.setMaxPerPage(value);
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
                                    variant="success"
                                    disabled={!Config.isApiEnabled()}
                                >
                                    {resources.$.UI.Action.Search}
                                </Button>
                                <Button
                                    variant="dark"
                                    disabled={!Config.isApiEnabled()}
                                    onClick={() => {
                                        window.location.href = '#navbar';
                                    }}
                                >
                                    {resources.$.UI.Action.ToTop}
                                </Button>
                            </div>
                        </Card>
                    </Col>

                    {this.state.loaded ? (
                        <Col>
                            <Container key="galleryContainer" fluid className="overflow-hidden">
                                <div className="d-grid p-2">
                                    <Pagination className="mx-auto bg-black">
                                        <Pagination.First />
                                        <Pagination.Prev />
                                        <Pagination.Item>{1}</Pagination.Item>
                                        <Pagination.Next />
                                        <Pagination.Last />
                                    </Pagination>
                                </div>
                                {!Config.isApiEnabled() ? (
                                    <Row
                                        className={
                                            this.state.rowClass + ' gy-2 '
                                        }
                                    >
                                        {this.state.results.length === 0 ? (
                                            <>
                                                <Col>
                                                    <Card 
                                                        body
                                                        key="zeroResults">
                                                        <Row className="gap-2 p-4">
                                                            <Col lg={3}>
                                                                <div className="d-flex align-items-center justify-content-center h-100">
                                                                    <img
                                                                        className="mx-auto d-block img-fluid"
                                                                        alt="icon"
                                                                        src={
                                                                            ImageIcon
                                                                        }
                                                                    />
                                                                </div>
                                                            </Col>
                                                            <Col>
                                                                <Alert
                                                                    variant="dark"
                                                                    className="text-center mt-4"
                                                                >
                                                                    <p className="fs-2">
                                                                        🏹
                                                                    </p>
                                                                    <p className="fs-4">
                                                                        Nothing
                                                                        here...
                                                                    </p>
                                                                    Try
                                                                    adjusting
                                                                    your search
                                                                    parameters.
                                                                </Alert>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                </Col>
                                            </>
                                        ) : (
                                            <>
                                                {this.state.results.map(
                                                    (token) => (
                                                        <GalleryItem
                                                            key={token+Math.random()}
                                                            token={token}
                                                        />
                                                    )
                                                )}
                                            </>
                                        )}
                                    </Row>
                                ) : (
                                    <Card 
                                        body
                                        key="brokenApi"
                                        >
                                        <Row className="gap-2 p-4">
                                            <Col lg={3}>
                                                <div className="d-flex align-items-center justify-content-center h-100">
                                                    <img
                                                        className="mx-auto img-fluid"
                                                        alt="icon"
                                                        src={ImageMissing}
                                                    />
                                                </div>
                                            </Col>
                                            <Col>
                                                <p className="display-2 mb-4">
                                                    Oh no...
                                                </p>
                                                <p>Something went wrong.</p>
                                            </Col>
                                        </Row>
                                    </Card>
                                )}
                            </Container>
                        </Col>
                    ) : (
                        <Col>
                            <Card 
                                body
                                key="tokenLoading"
                                >
                                {controller.isWeb3Valid ? (
                                    <>
                                        <Alert
                                            key="fetchingResults"
                                            variant="success"
                                            className="text-center"
                                        >
                                            <p className="fs-1">🌐</p>
                                            Lets fetch those{' '}
                                            {
                                                controller.getDescription()
                                                    .tokenPlural
                                            }
                                        </Alert>
                                        <div className="d-grid">
                                            <Button
                                                key="fetchResults"
                                                variant="success"
                                                onClick={this.load.bind(this)}
                                            >
                                                {
                                                    resources.$.UI.Action
                                                        .FetchResults
                                                }
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Alert
                                            variant="warning"
                                            className="text-center"
                                            key="connectWalletAlert"
                                        >
                                            <p className="fs-1">🌐</p>
                                            Please connect your Web3 wallet in
                                            order to be able to view the
                                            gallery.
                                        </Alert>
                                        <div className="d-grid">
                                            <Button
                                                key="connectWalletBtn"
                                                variant="success"
                                                onClick={async () => {
                                                    await connectWallet();
                                                }}
                                            >
                                                {
                                                    resources.$.UI.Action
                                                        .ConnectWallet
                                                }
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </Col>
                    )}
                </Row>
            </>
        );
    }
}

export default GalleryElement;
