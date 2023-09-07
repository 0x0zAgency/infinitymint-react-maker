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
import { Redirect } from 'react-router-dom';
import Config from '../config.js';
import Transaction from '../Components/Transaction.js';
import InstantMint from '../Components/Micro/InstantMint.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import AnimatedNumber from '../Components/AnimatedNumber.js';
import { call, send, waitSetState } from '../helpers.js';
import Token from '../Components/Token.js';

let settings = {
    hideAllBadges: true,
    hideModPages: true,
    hideDescription: true,
    static: true,
    useFresh: true,
    renderOnUpdate: true,
    enableThreeJS: false,
    downsampleRate3D: 1,
    cameraFOV: 85,
    cameraPositionZ: 69,
    cameraPositionX: 0,
    cameraPositionY: 180,
    selectable3D: false,
    disableFloor3D: true,
    //ForceBackground: ModelBackground,
    showHelpers3D: false,
    lightIntensity3D: 30,
    lightColour3D: 0xff_ff_ff,
    ambientLightIntensity3D: 90,
    ambientLightColour3D: 0xff_ff_e2,
    rotationSpeed3D: 0.005,
};

class Mint extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showOverlay: false,
            navigate: '',
            overlayTitle: 'Unknown',
            mintTransaction: {},
            element: <></>,
            previewBlocked: false,
            previewTimestamp: 0,
            previewCount: 0,
            maxTokens: false,
            mintsEnabled: false,
            overlaySubmit() {},
        };
    }

    

    setError(error) {
        this.setState({
            error: error[0]?.message || error.message,
        });
    }

    async previewMint() {
        storageController.values.previews = {};
        storageController.saveData();

        await controller.sendAndWaitForEvent(
            controller.accounts[0],
            'InfinityMint',
            'getPreview',
            Config.events.InfinityMint.Preview,
            {
                filter: {
                    sender: controller.accounts[0],
                },
                gasLimit: Config.gasLimit.preview, // Replace with a config somewhere
                gasPrice: Config.getGasPrice(
                    storageController.getGlobalPreference('gasSetting')
                ),
            }
        );

        // Redirect
        await waitSetState(this, {
            showOverlay: false,
            success: true,
            navigate: '/preview',
        });
    }

    async mint() {
        const result = await controller.sendAndWaitForEvent(
            controller.accounts[0],
            'InfinityMint',
            'mint',
            Config.events.InfinityMint.Mint,
            {
                filter: {
                    sender: controller.accounts[0],
                },
                gasLimit: Config.gasLimit.mint, // Replace with a config somewhere
                gasPrice: Config.getGasPrice(
                    storageController.getGlobalPreference('gasSetting')
                ),
            },
            !controller.isAdmin
                ? controller.web3.utils.toWei(
                      String(controller.getContractValue('getPrice')),
                      'ether'
                  )
                : 0
        );

        // Store this token
        const tokenId = controller.storeToken(result[1], 'event', 'mint', {
            tokenURI: true,
        });

        // Reset previews and save
        storageController.values.previews = {};
        storageController.saveData();

        // Redirect
        await waitSetState(this, {
            showOverlay: false,
            success: true,
            navigate: `/view/${tokenId}`,
        });
    }

    async componentDidMount() {
        try {
            let count = await call('InfinityMintApi', 'getPreviewCount', [
                controller.accounts[0],
            ]);
            count = parseInt(count.toString());
            await waitSetState(this, {
                previewCount: count,
            });
        } catch (error) {
            controller.log(error);
        }

        if (controller.isWalletValid) {
            const result = await controller.callMethod(
                controller.accounts[0],
                'InfinityMint',
                'mintsEnabled'
            );

            await waitSetState(this, {
                mintsEnabled: result,
            });
        }

        try {
            const result = await controller.callMethod(
                controller.accounts[0],
                'InfinityMintApi',
                'isPreviewBlocked',
                {
                    parameters: [controller.accounts[0]],
                }
            );

            console.log(result);

            this.setState({
                previewBlocked: result,
            });

            const timestamp = await controller.callMethod(
                controller.accounts[0],
                'InfinityMintApi',
                'getPreviewTimestamp',
                {
                    parameters: [controller.accounts[0]],
                }
            );

            this.setState({
                previewTimestamp: Number.parseInt(timestamp.toString(), 10),
            });

            // Dont do it on ganache
            if (
                Config.requiredChainId !== 1337 &&
                controller.getContractValue('balanceOf') >=
                    (controller.getProjectSettings().deployment
                        ?.maxTokensPerWallet || 256)
            ) {
                this.setState({
                    maxTokens: true,
                });
            }
        } catch (error) {
            controller.log('[😞] Error', 'error');
            controller.log(error);
        }
    }
    
    render() {
        if (this.state.navigate !== '') {
            return <Redirect to={this.state.navigate} />;
        }

        const count =
            controller.getContractValue('totalSupply') -
            controller.getContractValue('totalMints');

        const previewCount =
            controller.getProjectSettings()?.deployment?.previewCount || 0;

        return (
            <>
                <Container>
                    {this.state.success === true ? (
                        <Row className="mt-3">
                            <Col>
                                <Alert variant="success">
                                    <p clasName="fs-2">
                                        {resources.$.UI.Responses.Success}
                                    </p>
                                    Please give it a few minutes to update...
                                    Please do not reissue a transaction as you
                                    will get a revert.
                                </Alert>
                            </Col>
                        </Row>
                    ) : (
                        <></>
                    )}
                    <Row className="mt-5">
                        <Col className="text-center">
                            <h1 className="display-5 force-white">
                                {resources.$.Pages.Mint.Title}
                            </h1>
                            <p className="fs-4 force-white">
                                {resources.$.Pages.Mint.SubTitle}
                            </p>
                            <Card body className="mt-5 rainbow-text-animated">
                                {controller.isWalletValid ? (
                                    <></>
                                ) : (
                                    <Alert
                                        variant="danger"
                                        className="text-center bg-danger text-white"
                                    >
                                        You need to connect your wallet to the{' '}
                                        {Config.getNetwork().name} network
                                        before you can mint.
                                    </Alert>
                                )}
                                <div className="d-flex mt-2 mb-2 mt-auto gap-2">
                                    <Form.Control
                                        type="text"
                                        size="lg"
                                        className="text-center  display-6 w-25"
                                        placeholder={
                                            !controller.isAdmin
                                                ? `${controller.getContractValue(
                                                      'getPrice'
                                                  )} ` +
                                                  Config.getNetwork().token
                                                : '🆓 ' + Config.getNetwork().name
                                        }
                                        readOnly
                                    />
                                    <Button
                                        variant="success"
                                        size="lg"
                                        className="w-75 header-subtext glow"
                                        style={{
                                            
                                            textShadow: '0px 0px 8px gold',
                                        }}
                                        hidden={this.state.previewBlocked}
                                        disabled={
                                            !controller.isWalletValid ||
                                            count <= 0 ||
                                            this.state.previewBlocked ||
                                            this.state.maxTokens ||
                                            !this.state.mintsEnabled
                                        }
                                        onClick={() => {
                                           
                                                this.setState({
                                                    showOverlay: true,
                                                    overlayTitle: 'Mint',
                                                    element: <InstantMint />,
                                                    overlaySubmit: async () => {
                                                        await this.mint();
                                                    },
                                                });
                                            
                                        }}
                                    >
                                       Mint {resources.token()} Now!
                                    </Button>
                                </div>
                                <Alert variant="info" className="text-center">
                                    {count > 0 ? (
                                        <AnimatedNumber
                                            className="fs-1 header-text"
                                            slowness={0}
                                            reach={count}
                                            delay={0}
                                            duration={500}
                                            
                                        /> 
                                    ) : (
                                        <span className="fs-1 header-text">0</span>
                                    )} {resources.tokenPlural()} Remaining
                                </Alert>
                                <h3
                                    className="mt-4 force-white"
                                    style={{
                                        textShadow: '0px 0px 8px magenta',
                                    }}
                                >
                                    
                                </h3>
                            </Card>
                        </Col>
                    </Row>
                    {this.state.maxTokens ? (
                        <Row className="mt-2 gy-4">
                            <Col className="text-center">
                                <Alert variant="warning">
                                    <p className="display-1">😱</p>
                                    <span className="p-5 fs-3">
                                        Holy sh**! Incredible. You've hit the
                                        max tokens allowed per wallet (which is{' '}
                                        {controller.getProjectSettings()
                                            .deployment?.maxTokensPerWallet ||
                                            256}
                                        ). In order to mint more tokens. You
                                        will need to change to another wallet.
                                    </span>
                                </Alert>
                            </Col>
                        </Row>
                    ) : (
                        <></>
                    )}
                    <Row
                        className="text-center"
                        hidden={!this.state.previewBlocked}
                    >
                        <Col>
                            <Alert variant="warning">
                                You must mint one of your{' '}
                                <a href="/mint">previews</a>. You can
                                mint again after{' '}
                                {new Date(
                                    this.state.previewTimestamp * 1000
                                ).toString()}
                            </Alert>
                        </Col>
                    </Row>
                    <Row className="justify-content-center align-items-center">
                                    <Col
                                        sm={12}
                                        lg={12}
                                        xl={12}
                                        md={12}
                                        xs={12}
                                    >
                                        <Row className="justify-content-center mt-2">
                                            <Col className="text-center col-4">
                                                <a href="/mint">
                                                    <Token
                                                    key={"FakeToken_01"}
                                                        theToken={{
                                                            token: {
                                                                ...controller.makeFakeToken(
                                                                    Math.floor(Math.random() * 9),
                                                                    '🎟️'
                                                                ), // colours)
                                                                tokenId: 0,
                                                            },
                                                        }}
                                                        settings={settings}
                                                    />
                                                </a>
                                            </Col>

                                            <Col className="text-center col-4">
                                                <a href="/mint">
                                                    <Token
                                                        key={"FakeToken_02"}
                                                        theToken={{
                                                            token: {
                                                                ...controller.makeFakeToken(
                                                                    Math.floor(Math.random() * 19),
                                                                    '🎟️'
                                                                ), // colours)
                                                                tokenId: 0,
                                                            },
                                                        }}
                                                        settings={settings}
                                                    />
                                                </a>
                                            </Col>

                                            <Col className="text-center col-4">
                                                <a href="/mint">
                                                    <Token
                                                        key={"FakeToken_03"}
                                                        theToken={{
                                                            token: {
                                                                ...controller.makeFakeToken(
                                                                    Math.floor(Math.random() * 29),
                                                                    '🎟️'
                                                                ), // colours)
                                                                tokenId: 0,
                                                            },
                                                        }}
                                                        settings={settings}
                                                    />
                                                </a>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                    <Row
                        className="mt-4 text-center"
                        hidden={this.state.mintsEnabled}
                    >
                        <Col>
                            <Alert variant="warning">
                                The minter is currently disabled
                            </Alert>
                        </Col>
                    </Row>

                    <Row className="gy-2">
                        <Col
                            className="text-center h-100"
                            lg
                            style={{
                                cursor: this.state.previewBlocked
                                    ? 'no-drop'
                                    : 'pointer',
                            }}
                        >
                        </Col>
                    </Row>
                    
                    <Transaction
                        currentTransaction={this.state.mintTransaction}
                        element={this.state.element}
                        show={this.state.showOverlay}
                        title={this.state.overlayTitle}
                        onHide={() => {
                            this.setState({
                                showOverlay: false,
                            });
                        }}
                        onClick={this.state.overlaySubmit.bind(this)}
                    />
                    <br />
                    <br />
                    <br />
                </Container>
            </>
        );
    }
}

Mint.url = '/mint';
Mint.id = 'Mint';
Mint.settings = {
    navbarEnd: '$.UI.Navbar.Mint',
};


export default Mint;
