import React, { Component } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import { connectWallet } from '../../helpers.js';
import Header from '../../Components/Micro/Header.js';
import Config from '../../config.js';

class RequireWallet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
        };
    }

    render() {
        return (
            <>
                <Container className="">
                    <Row>
                        <Col className="text-center">
                            <div className="mt-5 pt-4 force-white">
                                <p
                                    style={{
                                        fontWeight: 'bolder',
                                    }}
                                    className="header-text mb-0"
                                >
                                    {controller.getDescription().name}
                                    <span className="badge bg-primary fs-6 ms-2">
                                        {Config.getNetwork().name}
                                    </span>
                                </p>
                                <p className="mb-5 fs-4 text-white">
                                    by InfinityMint♾️
                                </p>
                            </div>
                            <Header button="false" />
                        </Col>
                    </Row>
                    <Row className="justify-content-center mt-2">
                        <Col lg={8}>
                            <Row className="gap-2">
                                <Col className="d-grid">
                                    {!controller.isWalletValid ? (
                                        <Alert
                                            variant="primary"
                                            className="p-3"
                                        >
                                            <p
                                                className="fs-2 bg-primary text-center p-2"
                                                style={{
                                                    fontWeight: 'bolder',
                                                }}
                                            >
                                                Web3 Error
                                            </p>
                                            <p className="fs-4 mb-0">
                                                <u>
                                                    {controller.walletError
                                                        ?.message || ''}
                                                    .
                                                </u>
                                            </p>
                                        </Alert>
                                    ) : (
                                        <></>
                                    )}
                                </Col>
                            </Row>
                            <Row>
                                <Col className="d-grid">
                                    <Button
                                        variant="success bounce"
                                        onClick={async () => {
                                            await connectWallet();
                                        }}
                                    >
                                        CONNECT YOUR WALLET
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <br />
                    <br />
                </Container>
            </>
        );
    }
}

export default RequireWallet;
