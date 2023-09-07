import React from 'react';
import {
    Alert,
    Card,
    Col,
    Container,
    ListGroup,
    Row,
    Button,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';

function Error(props) {
    return (
        <Container>
            <Row className="mt-4">
                <Col>
                    <h1 className="display-1">It Broke.</h1>
                    <p>Please check out the error below</p>
                    <Alert variant="danger">{props.error.message}</Alert>
                    <Card>
                        <Card.Header>Stack Trace</Card.Header>
                        <Card.Body>
                            <div className="d-grid mt-2">
                                {JSON.stringify(props.error.stack)}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <h1 className="display-4">Possible Solutions</h1>
                    <ListGroup>
                        <ListGroup.Item>
                            Open a terminal inside of this directory and run{' '}
                            <code>npm run updateImports</code>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Double check that manifest.json inside of{' '}
                            <code>src/Deployments</code> has valid references
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Open a terminal inside of the build tools directory
                            and type <code>node scripts/copyScripts.js</code>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Open a terminal inside of the build tools directory
                            and type <code>node scripts/copyMods.js</code>
                        </ListGroup.Item>
                    </ListGroup>
                    <Card body className="mt-4">
                        <Alert variant="warning" className="text-center">
                            <p className="fs-3">🥶</p>
                            You can try factory resetting completely. This will
                            delete all local storage data so be careful if you
                            have stickers!
                        </Alert>
                        <div className="d-grid">
                            <Button
                                variant="warning"
                                onClick={() => {
                                    storageController.wipe();
                                    storageController.saveData();
                                    window.location.reload();
                                }}
                            >
                                Factory Reset
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
            <br />
            <br />
            <br />
        </Container>
    );
}

// Types
Error.propTypes = {
    error: PropTypes.string,
};

export default Error;
