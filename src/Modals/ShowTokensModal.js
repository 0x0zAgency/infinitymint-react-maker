import React, { Component } from 'react';
import { Modal, Form, Button, Col, Row, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Token from '../Components/Token.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';

class ShowTokensModal extends Component {
    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide} size="lg">
                <Modal.Body>
                    <p className="fs-2">
                        Showing {resources.tokenPlural()}{' '}
                        <span className="badge bg-dark">
                            {this.props.tokens === undefined
                                ? 0
                                : Object.values(this.props.tokens).length}
                        </span>
                    </p>
                    <hr />
                    <Row className="row-cols-3">
                        {this.props.tokens === undefined ? (
                            <Col></Col>
                        ) : (
                            Object.values(this.props.tokens).map((token) => (
                                <Token
                                    theToken={token.token}
                                    settings={{
                                        hideAllTags: true,
                                        hidePathName: true,
                                        hideModBadges: true,
                                        hideLinkBadges: true,
                                        noBorder: true,
                                    }}
                                    static={true}
                                />
                            ))
                        )}
                    </Row>
                    <Row>
                        <Col>
                            <div className="d-grid" onClick={this.props.onHide}>
                                <Button variant="dark">
                                    {resources.$.UI.Action.Close}
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
ShowTokensModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
};

export default ShowTokensModal;
