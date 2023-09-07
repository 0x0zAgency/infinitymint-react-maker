import React, { Component } from 'react';
import { Modal, Form, Button, Col, Row, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import resources from 'infinitymint-client/dist/src/classic/resources.js';

class FinalizedStickerModal extends Component {
    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}>
                <Modal.Body>
                    <Alert variant="success" className="text-center">
                        <p className="fs-2">
                            {resources.$.UI.Responses.Success}
                        </p>
                        You are ready to put your sticker onto things!
                    </Alert>

                    <div className="d-grid">
                        <Button
                            variant="success"
                            onClick={() => {
                                this.props.onSubmit();
                            }}
                        >
                            Get Out Of Here
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}

// Types
FinalizedStickerModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    onSubmit: PropTypes.func,
};

export default FinalizedStickerModal;
