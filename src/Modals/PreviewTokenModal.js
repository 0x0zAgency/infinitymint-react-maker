import React from 'react';
import { Modal, Button, Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Token from '../Components/Token.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';

const PreviewTokenModal = (props) => (
    <Modal show={props.show} onHide={props.onHide} size="lg">
        <Modal.Body>
            <Row>
                <Token
                    theToken={props.selectedPreview}
                    stickers={props.stickers || []}
                    settings={props.tokenSettings || {}}
                    width={12}
                />
            </Row>
            <Row className="mt-2">
                <Col>
                    <div className="d-grid gap-2">
                        {props.buttonElements || (
                            <>
                                <Button
                                    variant="success"
                                    type="submit"
                                    hidden={props.hideMintButton}
                                    onClick={() => {
                                        if (props.onMint) {
                                            props.onMint();
                                        }
                                    }}
                                >
                                    {resources.$.UI.Action.MintToken}
                                </Button>
                                <Button
                                    variant="light"
                                    type="submit"
                                    onClick={() => {
                                        if (props.onHide) {
                                            props.onHide();
                                        }
                                    }}
                                >
                                    {resources.$.UI.Action.Close}
                                </Button>
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </Modal.Body>
    </Modal>
);

// Types
PreviewTokenModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
};

export default PreviewTokenModal;
