import React, { Component } from 'react';
import { Container, Row, Col, Alert, Card, Button, Badge } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Token from '../Components/Token.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import Config from '../config.js';

// Images
import ImageIcon from '../Images/icon-512x512.png';
import NavigationLink from '../Components/NavigationLink.js';
import { decideRowClass, loadPath, waitSetState } from '../helpers.js';
import tokenMethods from 'infinitymint-client/dist/src/classic/tokenMethods.js';
import Loading from '../Components/Loading.js';

let _errorTimeout;
class MyTokens extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tokens: {},
            isValid: false,
            location: '',
            page: 0,
            loading: false,
            error: undefined,
            primaryWallet: controller.accounts[0],
            errorTimeout: 30,
            rowClass: decideRowClass(),
        };
    }

    async componentDidMount() {
        this.setState({
            loading: true,
        });
        if (!controller.isWeb3Valid) {
            this.setState({
                loading: false,
                error: 'No Web3 Connection',
            });
            return;
        }

        try {
            await waitSetState(this, {
                primaryWallet: controller.accounts[0],
            });
            await this.getTokens(this.state.page);
        } catch (error) {
            controller.log('Could not load tokens', 'warning');
            this.setError(error);
            controller.log(error);
            this.setState({
                isValid: false,
            });
        } finally {
            this.setState({
                loading: false,
            });
        }

        const interval = setInterval(() => {
            try {
                const rowClass = decideRowClass(
                    Object.values(this.state.tokens)
                );
                if (rowClass !== this.state.rowClass) {
                    this.setState({
                        rowClass,
                    });
                }
            } catch (error) {
                controller.log('failed interval', 'error');
                controller.log(error);
            }
        }, 2000);

        this.setState({
            rowInterval: interval,
        });
    }

    async componentDidUpdate() {
        if (this.state.primaryWallet !== controller.accounts[0]) {
            await waitSetState(this, {
                primaryWallet: controller.accounts[0],
            });
            await this.getTokens(this.state.page);
        }

        // Resizes all the tokens as well on row
        tokenMethods.onWindowResize(controller);
    }

    cleanupError(seconds = 5) {
        clearTimeout(_errorTimeout);
        return new Promise((_resolve, _reject) => {
            _errorTimeout = setTimeout(() => {
                this.setState({
                    error: undefined,
                });
            }, seconds * 1000);
        });
    }

    setError(error) {
        this.setState({
            error: error.message || error.error || error,
        });
        this.cleanupError(5);
    }

    async getTokens(page) {
        this.setState({
            isValid: false,
            tokens: [],
        });
        try {
            let tokens = await controller.getTokens(
                Config.settings.maxTokenCount,
                page
            );

            const projectURI = controller.getProjectSettings();
            for (const token of tokens) {
                if (token.token.token.pathId !== undefined) {
                    // eslint-disable-next-line no-await-in-loop
                    await loadPath(projectURI, token.token.token.pathId);
                }
            }

            tokens = tokens.filter(
                (value) => value.token.token.owner === this.state.primaryWallet
            );

            await waitSetState(this, {
                tokens,
                isValid: tokens.length > 0,
            });
        } catch (error) {
            controller.log('[😞] Error', 'error');
            controller.log(error);
            this.setError({
                error,
            });
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.rowInterval);
    }

    render() {
        if (this.state.location !== '') {
            return <Redirect to={this.state.location} />;
        }

        const fowardPage = () => {
            const page = this.state.page + 1;
            this.setState({
                loading: true,
                page,
            });
            this.getTokens(page).finally(() => {
                this.setState({
                    loading: false,
                });
            });
        };

        const backPage = () => {
            const page = Math.max(0, this.state.page - 1);
            this.setState({
                loading: true,
                page,
            });
            this.getTokens(page).finally(() => {
                this.setState({
                    loading: false,
                });
            });
        };

        return (
            <>
                {this.state.loading ? (
                    <Container>
                        <Loading />
                    </Container>
                ) : (
                    <Container className="p-4 lg: w-75 xl: w-75 sm: p-0 sm: w-100">
                        <Row>
                            <Col className="text-center justify-content-center align-items-center">
                            <h1 className="text-center text-white display-5 mt-4">
                                    {resources.getPageString(
                                        'MyTokens',
                                        'Title',
                                        true
                                    )}{' '}
                                </h1>
                                <Alert variant="success">
                                    <p className="fs-4 text-center">
                            {resources.getPageString(
                                            'MyTokens',
                                            'SubTitle'
                                        )}
                            </p>
                        </Alert>
                                
                                <Badge
                                    pill
                                    bg='primary'
                                    className='p-3 fs-6 mx-2'
                                >
                                    Total:{' '}
                                    {Math.min(
                                        controller.getContractValue('balanceOf')
                                    ).toString()}
                                </Badge>
                               
                                <Badge
                                    pill
                                    bg='secondary'
                                    className="p-3 fs-6 mx-2"
                                    style={{ textDecoration: 'underline' }}
                                >
                                    Showing Page {this.state.page} (showing{' '}
                                    {this.state.tokens.length})
                                </Badge>
                                <div className="d-grid mt-2 gap-2">
                                    {this.state.tokens.length >
                                    Config.settings.maxTokenCount - 1 ? (
                                        <Button
                                            variant="light"
                                            onClick={fowardPage}
                                        >
                                            Advance To Page{' '}
                                            {this.state.page + 1}
                                        </Button>
                                    ) : (
                                        <></>
                                    )}
                                    {this.state.page - 2 >= 0 ? (
                                        <Button
                                            variant="light"
                                            onClick={backPage}
                                        >
                                            Back To Page {this.state.page - 1}
                                        </Button>
                                    ) : (
                                        <></>
                                    )}
                                    {this.state.page > 0 ? (
                                        <Button
                                            variant="light"
                                            onClick={() => {
                                                this.setState({ page: 0 });
                                                this.getTokens(0);
                                            }}
                                        >
                                            Back To Page Zero
                                        </Button>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            </Col>
                        </Row>
                        {this.state.error !== undefined &&
                        this.state.error !== null ? (
                            <Row className="mt-2">
                                <Col>
                                    <Alert
                                        variant="danger"
                                        className="text-center"
                                    >
                                        <p className="display-2">😨</p>
                                        {this.state.error?.message ||
                                            this.state.error}
                                    </Alert>
                                </Col>
                            </Row>
                        ) : (
                            <></>
                        )}
                        <Row
                            className={
                                this.state.rowClass + ' gy-2 gx-2 mt-2 mb-2'
                            }
                        >
                            {this.state.isValid && controller.isWalletValid ? (
                                <>
                                    {this.state.tokens.map((value, index) => (
                                        <Token
                                            theToken={value.token}

                                            key={index}
                                            
                                            style={{
                                                padding: '2px',
                                                minWidth: '65%',
                                                minHeight: '420px',
                                                display: 'inline-block',
                                            }}


                                            settings={{
                                                hideDescription: false,
                                                extraPathNameBadge: true,
                                                showEditButton: true,
                                                useFresh: true,
                                                onlyBorder: true,
                                                showEditButton: true,
                                                renderOnUpdate: false,
                                                opaqueDetails: true,
                                                hideDescription: true,

                                                enableThreeJS: false,
                                                downsampleRate3D: 1,
                                                cameraFOV: 95,
                                                cameraPositionZ: 69,
                                                cameraPositionX: 0,
                                                cameraPositionY: 180,
                                                selectable3D: false,
                                                disableFloor3D: true,
                                                //ForceBackground: ModelBackground,
                                                showHelpers3D: false,
                                                lightIntensity3D: 20,
                                                lightColour3D: 0xff_ff_ff,
                                                ambientLightIntensity3D: 90,
                                                ambientLightColour3D: 0xff_ff_ff,
                                                rotationSpeed3D: 0.00,
                            
                                                
                                            }}
                                            onClick={() => {
                                                this.setState({
                                                    location:
                                                        '/view/' +
                                                        value.token.tokenId,
                                                });
                                            }}
                                            onEditClick={() => {
                                                this.setState({
                                                    location:
                                                        '/edit/' +
                                                        value.token.tokenId +
                                                        '/tokenuri',
                                                });
                                            }}
                                        />
                                    ))}

                                    {this.state.tokens.length >
                                    Config.settings.maxTokenCount - 1 ? (
                                        <Col className="d-grid">
                                            <Card body>
                                                <Row className="justify-content-center">
                                                    <Col lg={9}>
                                                        <img
                                                            className="mx-auto d-block img-fluid"
                                                            alt="icon"
                                                            src={ImageIcon}
                                                            onClick={fowardPage}
                                                        />
                                                    </Col>
                                                </Row>
                                                <div className="d-grid gap-2">
                                                    <Alert
                                                        variant="light"
                                                        className="text-center"
                                                    >
                                                        Looks like you have
                                                        quite the collection.
                                                    </Alert>
                                                    <Button
                                                        variant="light"
                                                        size="sm"
                                                        onClick={fowardPage}
                                                    >
                                                        Show More
                                                    </Button>
                                                    {this.state.page > 0 ? (
                                                        <>
                                                            {' '}
                                                            <Button
                                                                variant="light"
                                                                size="sm"
                                                                onClick={
                                                                    backPage
                                                                }
                                                            >
                                                                Go Back
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </div>
                                            </Card>
                                        </Col>
                                    ) : (
                                        <></>
                                    )}
                                </>
                            ) : (
                                <Col>
                                    <Card body>
                                        <Row className="justify-content-center">
                                            <Col lg={8}>
                                                <img
                                                    className="mx-auto d-block img-fluid"
                                                    alt="icon"
                                                    src={ImageIcon}
                                                    onClick={fowardPage}
                                                />
                                            </Col>
                                        </Row>
                                        <div className="d-grid">
                                            <Alert
                                                variant="danger"
                                                className="text-center"
                                            >
                                                You have yet to mint any{' '}
                                                {resources.tokenPlural()}, why
                                                dont you?
                                            </Alert>
                                            <NavigationLink
                                                variant="light"
                                                location={'/mint'}
                                                text={
                                                    resources.$.UI.Action
                                                        .MintToken
                                                }
                                            />
                                        </div>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                        <br />
                        <br />
                        <br />
                    </Container>
                )}
            </>
        );
    }
}

MyTokens.url = '/mytokens';
MyTokens.id = 'MyTokens';
MyTokens.settings = {
    requireWallet: true,
    dropdown: {
        user: '$.UI.Action.MyTokens',
    },
};
export default MyTokens;
