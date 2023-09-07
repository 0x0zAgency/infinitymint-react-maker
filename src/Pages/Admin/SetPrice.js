import React, { Component } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Alert,
    Form,
} from 'react-bootstrap';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import Config from '../../config.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Loading from '../../Components/Loading.js';
import { call } from '../../helpers.js';

const prices = [
    [0, 0.01, 0.02, 0.03, 0.04],
    [0.05, 0.06, 0.07, 0.08, 0.09],
    [0.1, 0.2, 0.3, 0.4, 0.5],
];

class SetPrice extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: 0.01,
            onchainValue: '?',
            hasPermission: false,
        };
    }

    async componentDidMount() {
        this.setState({
            loading: true,
        });

        try {
            const projectSettings = controller.getProjectSettings();
            controller.initializeContract(
                Config.deployInfo.contracts[projectSettings.modules.royalty],
                projectSettings.modules.royalty,
                true
            );

            this.setState({
                hasPermission: await call(
                    'InfinityMintProject',
                    'isAuthenticated',
                    [controller.accounts[0]]
                ),
            });

            const result = await controller.callMethod(
                controller.accounts[0],
                'InfinityMintApi',
                'getPrice'
            );

            this.setState({
                onchainValue: Number.parseFloat(
                    controller.web3.utils.fromWei(result)
                ),
                value: Number.parseFloat(controller.web3.utils.fromWei(result)),
            });
        } catch (error) {
            controller.log(error);
        } finally {
            this.setState({
                loading: false,
            });
        }
    }

    render() {
        return (
            <>
                {this.state.loading ? (
                    <Container>
                        <Loading></Loading>
                    </Container>
                ) : (
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
                        <h1 className="mt-4 text-center display-5 force-white">💵 Set Mint Price</h1>
                        <Alert variant="success">
                            Here you can set the price of the minter. This is
                            the price that will be charged for each mint.
                        </Alert>
                        <Row>
                            <Col>
                                <Card body>
                                    {prices.map((priceGroup) => (
                                        <Row className="mt-2 gap-2">
                                            {priceGroup.map((price) => (
                                                <Col>
                                                    <div className="d-grid gap-2">
                                                        <Button
                                                            disabled={
                                                                !this.state
                                                                    .hasPermission
                                                            }
                                                            variant={
                                                                price ===
                                                                this.state.value
                                                                    ? 'success'
                                                                    : 'danger'
                                                            }
                                                            onClick={() => {
                                                                this.setState({
                                                                    value: price,
                                                                });
                                                            }}
                                                        >
                                                            {price}{' '}
                                                            {
                                                                Config.getNetwork()
                                                                    .token
                                                            }
                                                        </Button>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    ))}
                                    <Row className="mt-2">
                                        <Col>
                                            <h2 className='text-primary'>Custom Price</h2>
                                            <Form.Group
                                                className="mb-3"
                                                controlId="price"
                                            >
                                                <Form.Control
                                                    type="number"
                                                    size="sm"
                                                    disabled={
                                                        !this.state
                                                            .hasPermission
                                                    }
                                                    value={this.state.value}
                                                    onChange={(e) =>
                                                        this.setState({
                                                            value: isNaN(
                                                                e.target.value
                                                            )
                                                                ? 0.001
                                                                : Number.parseFloat(
                                                                      e.target
                                                                          .value
                                                                  ),
                                                        })
                                                    }
                                                    placeholder={'0.0'}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Alert variant="success">
                                            <p className="fs-2">🔔</p>
                                            <p>
                                                The current price is{' '}
                                                <b>
                                                    {this.state.onchainValue}{' '}
                                                    {Config.getNetwork().token}
                                                </b>
                                            </p>
                                        </Alert>
                                        <Alert
                                            variant="danger"
                                            hidden={this.state.hasPermission}
                                        >
                                            <p className="fs-2">⚠️</p>
                                            <p>
                                                You currently do not have
                                                permission to change the price.
                                                Please contact the project
                                                owner.
                                            </p>
                                        </Alert>
                                        <Col>
                                            <div className="d-grid">
                                                <Button
                                                    variant="dark"
                                                    disabled={
                                                        !this.state
                                                            .hasPermission
                                                    }
                                                    onClick={async () => {
                                                        const projectSettings =
                                                            controller.getProjectSettings();
                                                        await controller.sendMethod(
                                                            controller
                                                                .accounts[0],
                                                            projectSettings
                                                                .modules
                                                                .royalty,
                                                            'changePrice',
                                                            [
                                                                controller.web3.utils
                                                                    .toWei(
                                                                        this.state.value.toString()
                                                                    )
                                                                    .toString(),
                                                            ]
                                                        );

                                                        this.setState({
                                                            success: true,
                                                        });
                                                    }}
                                                >
                                                    Set Price
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                )}
                <br />
                <br />
                <br />
            </>
        );
    }
}

SetPrice.url = '/admin/price';
SetPrice.id = 'SetPrice';
SetPrice.settings = {
    identifier: 'setPrice',
    requireAdmin: true,
    dropdown: {
        admin: '💵 Set Minter Price',
    },
};

export default SetPrice;
