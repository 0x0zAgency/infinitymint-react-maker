import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Col, Row, Card } from 'react-bootstrap';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Token from '../Components/Token.js';
import NavigationLink from '../Components/NavigationLink.js';

function TokenURIModal(props) {
    return (
        <Modal show={props.show} onHide={props.onHide} size="lg">
            <Card body className="bg-light text-center">
                <Row className="justify-content-center mb-1">
                    <Token
                        key={props.theToken.tokenId + '_tokenuri'}
                        theToken={props.theToken}
                        stickers={props.stickers}
                        width={5}
                        settings={{
                            onlyBorder: false,
                            hideDescription: true,
                            hideAllBadges: true,
                            renderOnUpdate: true,
                             
                        }}
                    ></Token>
                </Row>
                <Col className="d-flex flex-column justify-content-center align-items-center">
                    <Card.Title>
                        <h1 className="display-7 text-primary text-center">You now own: {props.theToken.name}!</h1>
                    </Card.Title>
                    <span className="badge bg-success w-50 fs-4">
                        Rarity{' '}
                        {controller.getPathRarity(props.theToken.pathId) ||
                            (Object.keys(
                                controller.getProjectSettings().paths
                            ).filter((key) => key !== 'default').length /
                                100) *
                                100}
                        %
                    </span>
                </Col>
                <Card.Body className="pb-2">
                    Your Token is just about ready to get busy looking awesome
                    around the Metaverse. Would you like to change the default
                    appearance manually or have us control it for you?
                </Card.Body>
                <Row className="gy-2 gap-2">
                    <Col lg>
                        <div className="d-grid mt-2">
                            <Button
                                variant="success"
                                className="success"
                                disabled={true}
                            >
                                <strong className="text-white">
                                    🎛 Automatic Management
                                </strong>
                            </Button>
                        </div>
                    </Col>
                    <Col lg>
                        <div className="d-grid mt-2">
                            <NavigationLink
                                variant="info"
                                bg="warning"
                                className="bg-info"
                                location={
                                    '/edit/' +
                                    props.theToken.tokenId +
                                    '/tokenuri'
                                }
                                text={
                                    <strong className="text-white">
                                        ✍️ Manual Management
                                    </strong>
                                }
                                size="md"
                            ></NavigationLink>
                        </div>
                    </Col>
                </Row>
                <div className="d-grid mt-2">
                    <Button
                        variant="danger"
                        bg="dark"
                        className="bg-warning"
                        onClick={() => {
                            controller.setFlag(
                                props.theToken.tokenId,
                                'dontNotify',
                                true
                            );
                            props.onHide();
                        }}
                    >
                        Don't Show Me This Box Again
                    </Button>
                </div>
            </Card>
        </Modal>
    );
}

TokenURIModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
    theToken: PropTypes.object,
};

export default TokenURIModal;
