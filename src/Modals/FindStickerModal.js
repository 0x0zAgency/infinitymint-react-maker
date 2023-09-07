import React, { Component } from 'react';
import { Modal, Form, Button, Col, Row, Alert, Card } from 'react-bootstrap';

import PropTypes from 'prop-types';
import tinySVG from 'tinysvg-js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import NavigationLink from '../Components/NavigationLink.js';
import Sticker from '../Components/Sticker.js';
import { tryDecodeURI } from '../helpers.js';

class FindStickerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stickers: [],
            hasStickers: false,
            maxPerPage: 2,
            page: 0,
        };
    }

    async componentDidMount() {
        this.loadStickers();
    }

    loadStickers() {
        const stickers = Object.values(storageController.values.stickers);

        if (stickers.length === 0) {
            return;
        }

        const result = [];

        for (const [index, value] of stickers
            .filter((value) => value.state === 1)
            .entries()) {
            result[index] = { ...value.final };

            if (result[index].final !== undefined) {
                delete result[index].final;
            } // Delete the final

            result[index].state = 1; // NOTE: Strange bug? State doesn't appear to cross over to final for some reason.
        }

        this.setState({
            stickers: result,
            hasStickers: result.length > 0,
        });
    }

    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={() => {
                    if (this.props.onHide !== undefined) {
                        this.props.onHide();
                    }

                    this.setState({
                        hasStickers: false,
                        stickers: [],
                        page: 0,
                    });
                }}
                size="xl"
            >
                <Modal.Body>
                    {this.state.hasStickers ? (
                        <>
                            <Row className="row-cols-2 gy-4 gx-4">
                                {this.state.stickers.map((value, index) => {
                                    if (
                                        value.owner !== controller.accounts[0]
                                    ) {
                                        return (
                                            <Col>
                                                <Card
                                                    body
                                                    className="p-2 bg-black text-white h-100"
                                                >
                                                    <p className="fs-2">
                                                        🔒{' '}
                                                        {tryDecodeURI(
                                                            value.name
                                                        )}
                                                    </p>
                                                    This sticker is owned by{' '}
                                                    {value.owner} you will need
                                                    to be logged in with that
                                                    wallet to use it.
                                                </Card>
                                            </Col>
                                        );
                                    }

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
                                        <Sticker
                                            key={index}
                                            sticker={value}
                                            onClick={() => {
                                                this.props.onSelected(value);
                                                this.setState({
                                                    hasStickers: false,
                                                    stickers: [],
                                                    page: 0,
                                                });
                                            }}
                                        />
                                    );
                                })}
                            </Row>
                            <Row className="mt-2">
                                <Col>
                                    {this.state.hasStickers &&
                                    this.state.stickers.length >
                                        this.state.maxPerPage &&
                                    (this.state.page + 1) *
                                        this.state.maxPerPage <
                                        this.state.stickers.length ? (
                                        <>
                                            <Col className="d-grid min-vh-50">
                                                <Button
                                                    variant="light"
                                                    onClick={() => {
                                                        this.setState({
                                                            page:
                                                                this.state
                                                                    .page + 1,
                                                        });
                                                    }}
                                                >
                                                    Show More
                                                </Button>
                                            </Col>
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <>
                            <Alert variant="light" className=" text-center">
                                <p className="fs-2">No Stickers Found...</p>
                                <p>
                                    We actually remove them once you close this
                                    window to free up memory, so you might just
                                    need to hit refresh...
                                </p>
                                <p>
                                    Another reason could be that{' '}
                                    <u>
                                        you haven't finalized any stickers yet!
                                    </u>
                                </p>
                                <div className="d-grid gap-2">
                                    <Button
                                        variant="success"
                                        onClick={() => {
                                            this.loadStickers();
                                        }}
                                    >
                                        Reload Stickers
                                    </Button>
                                    <NavigationLink
                                        location={'/sticker/creator'}
                                        text={'All Stickers'}
                                        size="md"
                                        onClick={() => {
                                            this.props.onHide();
                                        }}
                                    />
                                </div>
                            </Alert>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        );
    }
}

// Types
FindStickerModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    onSelected: PropTypes.func,
};

export default FindStickerModal;
