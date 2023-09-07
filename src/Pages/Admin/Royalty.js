import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Badge, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import Resources from 'infinitymint-client/dist/src/classic/resources.js';
import Config from '../../config.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';

class Royalty extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: 0,
            freeStickers: 0,
            freeMints: 0,
        };
    }

    async componentDidMount() {
        const projectSettings = controller.getProjectSettings();
        controller.initializeContract(
            Config.deployInfo.contracts[projectSettings.modules.royalty],
            projectSettings.modules.royalty,
            true
        );

        const result = await controller.callMethod(
            controller.accounts[0],
            projectSettings.modules.royalty,
            'values',
            [controller.accounts[0]]
        );

        const freeMints = await controller.callMethod(
            controller.accounts[0],
            projectSettings.modules.royalty,
            'freebies',
            [0]
        );

        const freeStickers = await controller.callMethod(
            controller.accounts[0],
            projectSettings.modules.royalty,
            'freebies',
            [1]
        );

        this.setState({
            value: Number.parseFloat(controller.web3.utils.fromWei(result)),
            freeStickers,
            freeMinters: freeMints,
        });
    }

    render() {
        return (
            <Container>
                {this.state.success ? (
                    <Alert
                        variant="success"
                        className="text-center"
                        style={{ borderRadius: 0 }}
                    >
                        <p className="fs-2">😊</p>
                        Successfully changed price of the minter
                    </Alert>
                ) : (
                    <></>
                )}
                <h1 className="mt-4 text-center display-5 force-white">🤑 Withdraw Profits</h1>
                <Alert variant="success">
                    Here you can see how much you have earned and withdraw it.
                </Alert>
                <Row>
                    <Col>
                        <Card bg='black' body>
                            <Row>
                                <Col>
                                    <Alert
                                        variant={
                                            this.state.value <= 0
                                                ? 'danger'
                                                : 'success'
                                        }
                                        className="fs-2 text-center"
                                    >
                                        You can currently withdraw{' '}
                                        {this.state.value}{' '}
                                        {Config.getNetwork().token}
                                    </Alert>
                                </Col>
                            </Row>
                            <Row className='d-grid gap-4'>
                                <Col>
                                    <span>
                                        <h2>Free Mints</h2>
                                        <Badge variant='info' className='fs-4'>{this.state.freeMints || 0}</Badge>
                                    </span>
                                </Col>
                                <Col>
                                    <h2>Free Stickers</h2>
                                    <Badge variant='info' className='fs-4'>{this.state.freeStickers || 0}</Badge>
                                </Col>
                            </Row>
                            <br/>
                            <Row>
                                <Col>
                                    <div className="d-grid">
                                        <Button
                                            variant="dark"
                                            disabled={this.state.value === 0}
                                            onClick={async () => {
                                                await controller.sendMethod(
                                                    controller.accounts[0],
                                                    'InfinityMint',
                                                    'withdraw'
                                                );
                                                this.setState({
                                                    success: true,
                                                    value: 0,
                                                });
                                            }}
                                        >
                                            Withdraw
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}

Royalty.url = '/admin/royalty';
Royalty.id = 'Royalty';
Royalty.settings = {
    identifier: 'royalty',
    requireAdmin: true,
    dropdown: {
        admin: '🤑 Withdraw Profits',
    },
};

export default Royalty;
