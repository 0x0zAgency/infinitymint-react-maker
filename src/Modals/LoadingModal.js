import React, { Component } from 'react';
import { Modal, Form, Button, Col, Row, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Config from '../config.js';

// Images
import ImageLoading from '../Images/loading.gif';
import NavigationLink from '../Components/NavigationLink.js';

class LoadingModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            lastAction: {
                valid: false,
                args: [],
            },
            interval: null,
            displayMessage: false,
        };

        this.count = 0;
        this.willUnmount = false;
        this.state.timeout = null;
    }

    async componentDidMount() {
        this.setState({
            displayMessage: false,
        });

        clearInterval(this.state.interval);
        const interval = setInterval(() => {
            if (!this.willUnmount) {
                if (controller.isLoading !== this.state.show) {
                    this.setState({
                        show: controller.isLoading,
                    });
                }

                if (controller.isLoading) {
                    this.setState({
                        lastAction: controller.lastAction,
                        valid: true,
                        // Other loading stuff here
                    });
                }
            }
        }, 500);

        this.setState({
            interval,
        });
    }

    componentDidUpdate() {
        clearInterval(this.state.timeout);
        if (
            this.props.show === true &&
            this.state.timeout === null &&
            !this.state.displayMessage
        ) {
            this.count = Config.settings.txWait;
            this.setState({
                timeout: setInterval(() => {
                    if (
                        this.props.show === true &&
                        !this.willUnmount &&
                        this.state.lastAction?.type !== 'call' &&
                        this.count-- <= 0
                    ) {
                        this.setState({
                            displayMessage: true,
                        });
                        clearInterval(this.state.timeout);
                    }
                }, 1000),
            });
        }
    }

    componentWillUnmount() {
        this.willUnmount = true;
        if (this.state.interval != null) {
            clearInterval(this.state.interval);
        }

        if (this.state.timeout != null) {
            clearInterval(this.state.timeout);
        }
    }

    render() {
        let result;
        try {
            result = controller.web3.utils.fromWei(this.state.lastAction.value);
        } catch {
            result = this.state.lastAction.value;
        }

        return (
            <Modal show={this.state.show} className='bg-black'>
                <Modal.Body className="text-center">
                    <Row className="justify-content-center">
                        <Col xs={6}>
                            <img
                                alt="loading"
                                className="img-fluid d-block mx-auto"
                                src={ImageLoading}
                            />
                        </Col>
                    </Row>
                    {this.state.valid ? (
                        <>
                            <p className="fs-5">
                                {this.state.lastAction?.method || ''} ➡️{' '}
                                {(
                                    this.state.lastAction?.contract || ''
                                ).replace('Fake_', 'Virtual_')}{' '}
                                <span className="badge bg-success">
                                    {this.state.lastAction.type}
                                </span>
                            </p>
                            {this.state.displayMessage ? (
                                <Alert variant="info text-center">
                                    <p className="fs-5">Seems A Bit Slow...</p>
                                    <p>
                                        Your transaction might have gone through
                                        already, check your wallet for a
                                        successful transaction. If it is
                                        successful, then you can click the
                                        button below.
                                    </p>
                                    <div className="d-grid mt-2">
                                        {this.state.lastAction.method ===
                                            'mint' ||
                                        this.state.lastAction.method ===
                                            'mintPreview' ? (
                                            <>
                                                <NavigationLink
                                                    location="/mytokens"
                                                    text="My tokens"
                                                />
                                            </>
                                        ) : this.state.lastAction.method ===
                                          'getPreview' ? (
                                            <>
                                                <NavigationLink
                                                    location="/preview"
                                                    text="Preview"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <p>
                                                    This tranasction should
                                                    persist in the background.
                                                </p>
                                                <Button
                                                    variant="light"
                                                    onClick={this.props.onHide}
                                                >
                                                    Close
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </Alert>
                            ) : (
                                <></>
                            )}
                            <div className="d-grid mt-2 gap-2">
                                <Form.Control
                                    type="text"
                                    size="sm"
                                    placeholder={
                                        `${
                                            this.state.lastAction.value > 0
                                                ? result
                                                : 0
                                        } ` + Config.getNetwork().token
                                    }
                                    readOnly
                                />
                                <Form.Control
                                    type="text"
                                    size="sm"
                                    placeholder={JSON.stringify(
                                        this.state.lastAction.args
                                    )}
                                    readOnly
                                />
                                <Form.Control
                                    type="text"
                                    size="sm"
                                    placeholder={controller.accounts[0]}
                                    readOnly
                                />
                                <Form.Control
                                    type="text"
                                    size="sm"
                                    placeholder={Config.getNetwork().name}
                                    readOnly
                                />
                                <Button variant="dark" disabled>
                                    {this.state.lastAction?.type === 'call'
                                        ? 'Getting data from the blockchain...'
                                        : 'Awaiting Communication From Wallet...'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <></>
                    )}
                </Modal.Body>
            </Modal>
        );
    }
}

// Types
LoadingModal.propTypes = {
    show: PropTypes.bool,
};

export default LoadingModal;
