import React, { Component } from 'react';
import { Modal, Form, Button, Col, Row, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import { delay, tryDecodeURI } from '../helpers.js';

class DeleteStickerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            success: false,
        };
    }

    async delete() {
        this.setState({ loading: true });
        if (storageController.values.stickers[this.props.sticker.id]) {
            delete storageController.values.stickers[this.props.sticker.id];
            storageController.saveData();
        }

        this.setState({ success: true });
        await delay(1).then(this.props.onHide);
        this.setState({ loading: false, success: false });

        if (
            this.props.onDelete !== undefined &&
            typeof this.props.onDelete === 'function'
        ) {
            this.props.onDelete();
        }
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}>
                {this.props?.sticker?.id !== undefined ? (
                    <>
                        <Modal.Body className="text-center">
                            {this.state.success ? (
                                <Alert variant="success">
                                    Success! Please wait while we save...
                                </Alert>
                            ) : (
                                <></>
                            )}
                            <p className="fs-3">Warning</p>
                            <p>Are you sure you want to delete</p>
                            <p className="fs-2">
                                {tryDecodeURI(this.props.sticker.name)}
                            </p>
                            <div className="d-grid gap-2">
                                <Button
                                    variant="danger"
                                    type="submit"
                                    disabled={this.state.loading}
                                    onClick={this.delete.bind(this)}
                                >
                                    Delete
                                </Button>
                                <Button
                                    variant="light"
                                    type="submit"
                                    disabled={this.state.loading}
                                    onClick={() => {
                                        if (this.props.onHide) {
                                            this.props.onHide();
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Modal.Body>
                    </>
                ) : (
                    <></>
                )}
            </Modal>
        );
    }
}

// Types
DeleteStickerModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    sticker: PropTypes.object,
};

export default DeleteStickerModal;
