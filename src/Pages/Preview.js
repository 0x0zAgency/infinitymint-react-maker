import React, { Component } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Alert,
    Button,
    Form,
} from 'react-bootstrap';
import { Redirect, Route } from 'react-router-dom';
import NavigationLink from '../Components/NavigationLink.js';
import Token from '../Components/Token.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import Config from '../config.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import PreviewTokenModal from '../Modals/PreviewTokenModal.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import GasMachine from '../Components/GasMachine.js';
import { loadPath, unpackColours, waitSetState } from '../helpers.js';
import Loading from '../Components/Loading.js';

class Preview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isValid: false,
            previews: {},
            error: null,
            navigate: '',
            showPreviewModal: false,
            selectedPreview: {},
            loading: false,
            previewTimestamp: 0,
            previewCount: 0,
            selectedIndex: 0,
            startedMint: false,
        };
    }

    async loadPreviews() {
        let previews = {};
        const result = await controller.callMethod(
            controller.accounts[0],
            'InfinityMintApi',
            'allPreviews',
            {
                parameters: [controller.accounts[0]],
            }
        );

        if (result.length === 0) {
            return;
        }

        const array = [];

        for (const element of result) {
            array.push(
                await controller.callMethod(
                    controller.accounts[0],
                    'InfinityMintApi',
                    'getPreview',
                    {
                        parameters: [element],
                    }
                )
            );
        }

        previews = {
            returnValues: [null, array],
        };

        controller.storePreview(previews);
        return previews;
    }

    async componentDidMount() {
        let previews;
        const result = [];

        // Reset from last state
        this.setState({
            isValid: false,
            error: null,
            loading: true,
            previews: [],
        });

        let count = await controller.callMethod(
            controller.accounts[0],
            'InfinityMintApi',
            'getPreviewCount',
            {
                parameters: [controller.accounts[0]],
            }
        );
        count = Number.parseInt(count.toString());
        await waitSetState(this, {
            previewCount: count,
        });

        if (!storageController.existsAndNotEmpty('previews')) {
            try {
                await this.loadPreviews();
            } catch (error) {
                controller.log('[😞] Error', 'error');
                controller.log(error);
                return;
            }
        } else {
            // If the count is now zero, then clean the previews.
            if (count === 0) {
                storageController.values.previews = {};
                storageController.saveData();
                return;
            }

            const timestamp = await controller.callMethod(
                controller.accounts[0],
                'InfinityMintApi',
                'getPreviewTimestamp',
                {
                    parameters: [controller.accounts[0]],
                }
            );

            this.setState({
                previewTimestamp: Number.parseInt(timestamp.toString()),
            });
        }

        previews = storageController.values.previews;

        if (previews.previews === undefined) {
            return;
        }

        if (previews.address !== controller.accounts[0]) {
            storageController.values.previews = {};
            storageController.saveData();
            return;
        }

        try {
            const projectURI = controller.getProjectSettings();

            for (let [key, value] of Object.entries(previews.previews)) {
                if (typeof value === 'string') {
                    value = controller.decodeToken(value, true, true, true);
                    await loadPath(projectURI, value.pathId);
                    result.push(value);
                } else {
                    if (typeof value !== 'object') {
                        controller.log(
                            'preview ' + key + ' is not an object or a string'
                        );
                        continue;
                    }

                    const map = Object.values(Config.tokenMap);
                    const temporary = {};
                    Object.values(value).forEach((value, index) => {
                        temporary[map[index]] = value;
                    });

                    let names = [];
                    if (
                        temporary.names !== undefined &&
                        typeof temporary.names === 'object'
                    ) {
                        names = [...temporary.names];
                        const path = controller.getPathSettings(
                            temporary.pathId
                        );
                        if (path.addPathToName) {
                            names.push(path.name);
                        }

                        temporary.name = names.join(' ');
                    }

                    await loadPath(projectURI, temporary.pathId);
                    result.push({
                        ...temporary,
                        names,
                        colours: unpackColours([...temporary.colours]),
                    });
                }
            }
        } catch (error) {
            controller.log('[😞] Error', 'error');
            controller.log(error);
            this.setState({
                error,
                isValid: false,
            });
        }

        if (result.length > 0) {
            this.setState({
                isValid: true,
                previews: result,
            });
        }

        this.setState({
            loading: false,
        });
    }

    setError(error) {
        this.setState({
            error: error[0]?.message || error.message,
            errorTimeout: Date.now() + Config.settings.errorTimeout,
        });
    }

    async mintPreview(index) {
        const sel = this.state.previews[index];

        await waitSetState(this, {
            loading: true,
            startedMint: true,
            previews: [],
        });

        // Wipe other previews
        storageController.values.previews = {};
        storageController.saveData();

        const result = await controller.sendAndWaitForEvent(
            controller.accounts[0],
            'InfinityMint',
            'mintPreview',
            Config.events.InfinityMint.PreviewMint,
            {
                parameters: [sel.previewId],
                filter: {
                    sender: controller.accounts[0],
                },
                gasLimit: Config.gasLimit.mintPreview,
                gasPrice: Config.getGasPrice(
                    storageController.getGlobalPreference('gasSetting') ||
                        'medium'
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
        const tokenId = controller.storeToken(result[1], 'event', 'preview', {
            tokenURI: true,
        });

        // Redirect
        this.setState({
            isValid: false,
            loading: false,
            navigate: `/view/${tokenId}`,
        });
    }

    render() {
        if (this.state.navigate !== '') {
            return <Redirect to={this.state.navigate} />;
        }

        return (
            <>
                <Container className>
                    {this.state.error !== null &&
                    this.state.errorTimeout > Date.now() ? (
                        <Row className="mt-5">
                            <Col>
                                <Alert variant="danger">
                                    {this.state.error.message ||
                                        this.state.error}
                                </Alert>
                            </Col>
                        </Row>
                    ) : (
                        <></>
                    )}
                    {this.state.isValid && !this.state.loading ? (
                        <>
                            <Row className="mt-5">
                                <Col className="text-center text-white">
                                    <h1 className="fs-1 zombieTextRed  text-white">
                                        Your Possible Future{' '}
                                        {resources.projectToken()}
                                    </h1>
                                    <p className="fs-5 zombieTextRed  text-danger">
                                        You may only pick one.
                                    </p>
                                </Col>
                            </Row>
                            <Row
                                className="mt-4"
                                hidden={
                                    Object.values(this.state.previews)
                                        .length === 0
                                }
                            >
                                <Col>
                                    <GasMachine
                                        gasUsage={Config.gasLimit.mintPreview}
                                    />
                                </Col>
                            </Row>
                            {/** Selections */}
                            <Row className="row-cols-2 gy-4 gx-4 mt-2">
                                {this.state.previews.map((token, index) => (
                                    <Col key={index} className="d-grid">
                                        <Card body>
                                            <div className="d-grid mb-2">
                                                <Button
                                                    variant="dark"
                                                    onClick={() => {
                                                        this.setState({
                                                            showPreviewModal: true,
                                                            selectedIndex:
                                                                index,
                                                            selectedPreview:
                                                                token,
                                                        });
                                                    }}
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .InspectToken
                                                    }
                                                </Button>
                                            </div>
                                            <Row className="justify-content-center">
                                                <Token
                                                    theToken={token}
                                                    width={12}
                                                    settings={{
                                                        hideAllBadges: true,
                                                        extraPathNameBadge: true,
                                                        showRarity: true,
                                                    }}
                                                />
                                            </Row>
                                            <div className="d-grid mt-2">
                                                <Button
                                                    variant="success"
                                                    onClick={async () => {
                                                        await this.mintPreview(
                                                            index
                                                        ).catch(
                                                            this.setError.bind(
                                                                this
                                                            )
                                                        );
                                                    }}
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .MintToken
                                                    }
                                                </Button>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                            {/** Reroll */}
                            <Row
                                className="mt-5"
                                hidden={this.state.previewTimestamp === 0}
                            >
                                <Col>
                                    <div className="d-grid text-center">
                                        <h1 className="fs-3  text-white">
                                            Dont like what you've got?
                                        </h1>
                                        <p className="fs-5  text-white">
                                            You can also just wait! And you'll
                                            be given another preview opertunity.
                                        </p>
                                        <Card body>
                                            <p className="fs-5">
                                                Previews Reset
                                            </p>
                                            <p className="fs-6">
                                                {new Date(
                                                    this.state
                                                        .previewTimestamp * 1000
                                                ).toString()}
                                            </p>
                                            {Date.now() >
                                            this.state.previewTimestamp *
                                                1000 ? (
                                                <div className="d-grid">
                                                    <NavigationLink
                                                        variant="success"
                                                        location={'/Mint'}
                                                    >
                                                        Get New Previews
                                                    </NavigationLink>
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                        </Card>
                                    </div>
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <>
                            <Row className="mt-5">
                                <Col className="text-center">
                                    <h1 className="fs-1 text-white">
                                        Preview Mint
                                    </h1>
                                    <p className="fs-5  text-white">
                                        You'll need to have a preview mint ready
                                        in order for this page to be of use to
                                        you.
                                    </p>

                                    {this.state.loading &&
                                    this.state.previewCount !== 0 ? (
                                        <Loading />
                                    ) : (
                                        <></>
                                    )}
                                    {this.state.previewCount === 0 ? (
                                        <Alert
                                            variant="warning"
                                            className="text-center"
                                        >
                                            <p className="fs-2">👎 Missing</p>
                                            You currently have zero previews.
                                            Please wait for changes to be
                                            reflected if you have initiated
                                            recent transactions. Please keep
                                            pressing the refresh button.
                                        </Alert>
                                    ) : (
                                        <></>
                                    )}
                                    <div className="d-grid gap-2 mt-4">
                                        <Button
                                            size="lg"
                                            disabled={
                                                !controller.isWeb3Valid ||
                                                this.state.startedMint
                                            }
                                            onClick={async () => {
                                                const result =
                                                    await controller.callMethod(
                                                        controller.accounts[0],
                                                        'InfinityMintApi',
                                                        'getPreviewCount',
                                                        {
                                                            parameters: [
                                                                controller
                                                                    .accounts[0],
                                                            ],
                                                        }
                                                    );

                                                if (result !== 0) {
                                                    window.location.reload();
                                                } else {
                                                    this.setError({
                                                        message:
                                                            'You do not have any previews... Your transaction might need a moment to be confirmed by miners so keep hitting the check for previews button!',
                                                    });
                                                }
                                            }}
                                        >
                                            🔄 Check For Previews
                                        </Button>
                                        <NavigationLink
                                            disabled={
                                                !controller.isWeb3Valid ||
                                                this.state.previewCount !== 0
                                            }
                                            location="/mint"
                                            text={
                                                resources.$.UI.Action
                                                    .PreviewMint
                                            }
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </>
                    )}
                    <br />
                    <br />
                    <br />
                </Container>
                <PreviewTokenModal
                    show={this.state.showPreviewModal}
                    selectedPreview={this.state.selectedPreview}
                    tokenSettings={{
                        hideAllBadges: true,
                        extraPathNameBadge: true,
                        showRarity: true,
                    }}
                    onMint={async () => {
                        await this.mintPreview(this.state.selectedIndex)
                            .catch(this.setError.bind(this))
                            .finally(() => {
                                this.setState({
                                    showPreviewModal: false,
                                });
                            });
                    }}
                    onHide={() => {
                        this.setState({
                            showPreviewModal: false,
                        });
                    }}
                />
            </>
        );
    }
}

Preview.url = '/preview';
Preview.id = 'Preview';
Preview.requirements = {
    requireWallet: true,
};
export default Preview;
