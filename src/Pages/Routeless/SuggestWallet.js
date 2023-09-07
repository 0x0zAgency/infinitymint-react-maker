import React, { Component } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Header from '../../Components/Micro/Header.js';

class SuggestWallet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
        };
    }

    render() {
        return (
            <Container className="mb-2 text-center pt-5">
                <Header />
                <Row className="justify-content-center">
                    <Col lg={6}>
                        <Card body>
                            <div className="d-grid gap-2">
                                <Alert variant="warning">
                                    <p className="fs-2">😱</p>
                                    No Valid Web3 Connection was made.
                                </Alert>
                                <p className="text-center">
                                    Things might be a little broken, but you can
                                    enter anyway. Just click away the dialogue
                                    once it appears again.
                                </p>
                                <Alert
                                    variant="info"
                                    hidden={!controller.isWalletValid}
                                >
                                    Your wallet appears to be valid. You might
                                    just need to give the page a refresh!
                                </Alert>
                                <Button
                                    variant="success"
                                    hidden={!controller.isWalletValid}
                                    onClick={async () => {
                                        window.location.reload();
                                    }}
                                >
                                    Reload
                                </Button>
                                <Button
                                    variant="success"
                                    onClick={async () => {
                                        storageController.setGlobalPreference(
                                            'web3Check',
                                            true
                                        );
                                        storageController.saveData();
                                        window.location.reload();
                                    }}
                                >
                                    I UNDERSTAND
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default SuggestWallet;
