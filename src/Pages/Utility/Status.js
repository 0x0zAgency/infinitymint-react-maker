import React, { Component } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Alert,
    ListGroup,
    Spinner,
} from 'react-bootstrap';
import NavigationLink from '../../Components/NavigationLink';
import Config from '../../config';
import Loading from '../../Components/Loading';
import { waitSetState, cutLongString } from '../../helpers';
import modController from 'infinitymint-client/dist/src/classic/modController';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';

class Status extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mintsEnabled: false,
            loading: true,
            projectSettings: controller.getProjectSettings(),
        };
    }

    async developerReset() {
        storageController.wipe();
        storageController.saveData();

        window.location.reload();
    }

    async componentDidMount() {
        this.setState({
            projectSettings: controller.getProjectSettings(),
        });

        if (controller.isWalletValid) {
            let result = await controller.callMethod(
                controller.accounts[0],
                'InfinityMint',
                'mintsEnabled'
            );

            await waitSetState(this, {
                mintsEnabled: result,
            });
        }

        this.setState({
            loading: false,
        });
    }

    render() {
        let contracts = [];

        if (Config.deployInfo?.contracts !== undefined)
            Object.keys(Config.deployInfo.contracts).forEach((key) => {
                contracts.push([key, Config.deployInfo.contracts[key]]);
            });

        return (
            
            <Container className="p-4 lg: w-75 xl: w-75 sm: p-0 sm: w-100">
                {this.state.loading ? (
                    <Loading />
                ) : (
                    <>
                        <Row>
                            <Col>
                                <Card body>
                                    {this.state.projectSettings === undefined ||
                                    this.state.projectSettings === null ||
                                    this.state.projectSettings.network ===
                                        undefined ? (
                                        <Col>
                                            <Alert
                                                variant="danger"
                                                className="text-center"
                                            >
                                                <b> WARNING! </b>
                                                The current project file is
                                                invalid or bad. Please check the
                                                following:
                                                <br />
                                                local project:{' '}
                                                {
                                                    Config.settings.localProject
                                                }{' '}
                                                <br />
                                                deploy project:{' '}
                                                {Config.deployInfo?.project ||
                                                    'NO DEPLOY INFO'}{' '}
                                                <br />
                                                forced local project:{' '}
                                                {Config.settings
                                                    .useLocalProjectURI
                                                    ? 'YES'
                                                    : 'NO'}{' '}
                                                <br />
                                                developer/production:{' '}
                                                {Config.settings.production
                                                    ? 'PRODUCTION'
                                                    : 'DEVELOPER'}{' '}
                                                <br />
                                            </Alert>
                                        </Col>
                                    ) : (
                                        <></>
                                    )}
                                    {!controller.isWalletValid ? (
                                        <Row>
                                            <Col>
                                                <Alert variant="danger">
                                                    <b>WARNING!</b> Your wallet
                                                    is not connected to the
                                                    DAPP. Some things might
                                                    appear incorrect/buggy,
                                                    please connect your wallet
                                                    and make sure you are aiming
                                                    towards{' '}
                                                    {Config.getNetwork()?.name},
                                                    chainId{' '}
                                                    {Config.requiredChainId}.
                                                </Alert>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <></>
                                    )}
                                    <div className="fs-2">
                                        <span className="badge bg-light me-2 ">
                                            {this.state.mintsEnabled ? (
                                                <Spinner
                                                    animation="grow"
                                                    variant="success"
                                                />
                                            ) : (
                                                <Spinner
                                                    animation="grow"
                                                    variant="danger"
                                                />
                                            )}
                                        </span>
                                    </div>
                                    <Row className="mb-4 text-center d-block d-lg-block d-md-block d-xl-block">
                                        <Col>
                                            <h1 className="cool-link display-3">
                                                {
                                                    this.state.projectSettings
                                                        ?.project
                                                }
                                                <span
                                                    className="badge bg-light text-black"
                                                    style={{
                                                        fontSize: 10,
                                                        position: 'absolute',
                                                        marginLeft: 6,
                                                        marginTop: 26,
                                                    }}
                                                >
                                                    id:{' '}
                                                    {
                                                        this.state
                                                            .projectSettings?.id
                                                    }
                                                </span>
                                                <span
                                                    className="badge bg-secondary text-white"
                                                    style={{
                                                        fontSize: 10,
                                                        position: 'absolute',
                                                        marginLeft: 6,
                                                        marginTop: 0,
                                                    }}
                                                >
                                                    version: 1.
                                                    {
                                                        this.state
                                                            .projectSettings
                                                            ?.version
                                                    }{' '}
                                                    (
                                                    {
                                                        this.state
                                                            .projectSettings
                                                            ?.tag
                                                    }
                                                    )
                                                </span>
                                            </h1>
                                            {Config.deployInfo.isChild ? (
                                                <Row lg={6}>
                                                    <span className="badge bg-success text-black">
                                                        parent:{' '}
                                                        {
                                                            Config.deployInfo
                                                                .project
                                                        }
                                                    </span>
                                                    <br />
                                                    <span className="badge bg-success text-black">
                                                        child:{' '}
                                                        {
                                                            Config.deployInfo
                                                                .childProject
                                                        }
                                                    </span>
                                                    <br />
                                                    <br />
                                                </Row>
                                            ) : (
                                                <></>
                                            )}
                                            <span className="badge bg-light fs-6 ms-2 mt-2 text-black">
                                                updated:{' '}
                                                {new Date(
                                                    this.state.projectSettings
                                                        ?.updated ||
                                                        this.state
                                                            .projectSettings
                                                            ?.deployTime
                                                ).toString()}
                                            </span>
                                            <span className="badge bg-light fs-6 ms-2 mt-2 text-black">
                                                deployed:{' '}
                                                {new Date(
                                                    this.state.projectSettings?.deployTime
                                                ).toString()}
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row className="gap-2">
                                        <Col lg={8}>
                                            <h2 className="dislpay-5 text-white text-center">
                                                Deployed Contracts
                                                <span className="badge bg-light ms-2">
                                                    {contracts.length}
                                                </span>
                                            </h2>
                                            <div className="d-grid">
                                                <ListGroup>
                                                    {contracts.map(
                                                        (contract, index) => (
                                                            <ListGroup.Item
                                                            key={index}
                                                            className="bg-light force-black"
                                                            
                                                          >
                                                          <a href={Config.getNetwork().tokenscan + "address/" + contract[1]} target="_blank" rel="noreferrer" className='cool-link'>
                                                                <span className="badge bg-light me-1 text-primary">
                                                                    {index}
                                                                </span>{' '}
                                                                {contract[0]}{' '}
                                                                <span className="badge bg-light mt-2 d-sm-none d-md-block d-lg-block d-none text-black">
                                                                    {
                                                                        contract[1]
                                                                    }
                                                                    {Config
                                                                        .deployInfo
                                                                        .isChild ? (
                                                                        <span className="ms-2">
                                                                            {this
                                                                                .state
                                                                                .projectSettings
                                                                                ?.contracts[
                                                                                contract[0]
                                                                            ] ===
                                                                            contract[1]
                                                                                ? 'PARENT'
                                                                                : 'CHILD'}
                                                                        </span>
                                                                    ) : (
                                                                        <></>
                                                                    )}
                                                                </span>
                                                                <span className="badge bg-light d-sm-block d-md-none d-lg-none">
                                                                    {cutLongString(
                                                                        contract[1],
                                                                        8
                                                                    )}
                                                                </span>
                                                                </a>
                                                            </ListGroup.Item>
                                                        )
                                                    )}
                                                </ListGroup>
                                            </div>
                                        </Col>
                                        <Col>
                                            <p className="fs-6 text-center">
                                                Minter
                                                <span className="badge bg-danger ms-2">
                                                    DANGER
                                                </span>
                                            </p>
                                            <div className="d-grid gap-1 mb-4">
                                                <Alert
                                                    variant="danger"
                                                    className="text-center"
                                                >
                                                    This will clear everything
                                                    in your local storage.
                                                    <br />
                                                    <br />
                                                    <b>
                                                        Warning: Will clear WIP
                                                        stickers, the lot. All
                                                        things you have done
                                                        will be gone till they
                                                        are viewed again.
                                                    </b>
                                                </Alert>
                                                <Button
                                                    onClick={
                                                        this.developerReset
                                                    }
                                                    variant="danger"
                                                >
                                                    {
                                                        resources.$.UI.Action
                                                            .Reset
                                                    }
                                                </Button>
                                            </div>
                                            <p className="fs-6 text-center mt-4">
                                                Decompile & Save As Project File
                                            </p>
                                            <div className="d-grid gap-1">
                                                <Alert
                                                    variant="dark"
                                                    className="text-center"
                                                >
                                                    Turns a deployed
                                                    InfinityMint project into a
                                                    not deployed project file.
                                                </Alert>
                                                <Button
                                                    onClick={
                                                        this.developerReset
                                                    }
                                                    variant="light"
                                                >
                                                    {resources.$.UI.Action.Save}
                                                </Button>
                                                <Alert
                                                    variant="warning"
                                                    className="mt-4"
                                                >
                                                    <b>Note:</b> You will need
                                                    to navigate and save over
                                                    your project '.js' file
                                                    inside of the InfinityMint
                                                    solidity repository.{' '}
                                                    <b>
                                                        This project is called{' '}
                                                        {
                                                            Config.deployInfo
                                                                .project
                                                        }
                                                        .js
                                                    </b>
                                                </Alert>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row
                                        className="mt-2"
                                        hidden={
                                            this.state.mintsEnabled ||
                                            !controller.isAdmin
                                        }
                                    >
                                        <Col>
                                            <div className="d-grid">
                                                <Alert
                                                    variant="success"
                                                    className="text-center"
                                                >
                                                    <p className="fs-2">🤓</p>
                                                    Lets get this show on the
                                                    road! Enable the minter to
                                                    allow mints.
                                                </Alert>
                                                <Button
                                                    variant="success"
                                                    onClick={async () => {
                                                        try {
                                                            this.setState({
                                                                loading: true,
                                                            });
                                                            await controller.sendMethod(
                                                                controller
                                                                    .accounts[0],
                                                                'InfinityMint',
                                                                'setMintsEnabled',
                                                                [true]
                                                            );
                                                            await this.componentDidMount();
                                                        } catch (error) {
                                                            controller.log(
                                                                'error'
                                                            );
                                                        } finally {
                                                            this.setState({
                                                                loading: false,
                                                            });
                                                        }
                                                    }}
                                                >
                                                    Enable Minter
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row
                                        className="mt-2"
                                        hidden={
                                            !this.state.mintsEnabled ||
                                            !controller.isAdmin
                                        }
                                    >
                                        <Col>
                                            <div className="d-grid">
                                                <Alert
                                                    variant="danger"
                                                    className="text-center"
                                                >
                                                    <p className="fs-2">😈</p>
                                                    About to make some updates,
                                                    simply had enough? Disable
                                                    minting below.
                                                </Alert>
                                                <Button
                                                    variant="danger"
                                                    onClick={async () => {
                                                        try {
                                                            this.setState({
                                                                loading: true,
                                                            });
                                                            await controller.sendMethod(
                                                                controller
                                                                    .accounts[0],
                                                                'InfinityMint',
                                                                'setMintsEnabled',
                                                                [false]
                                                            );
                                                            await this.componentDidMount();
                                                        } catch (error) {
                                                            controller.log(
                                                                'error'
                                                            );
                                                        } finally {
                                                            this.setState({
                                                                loading: false,
                                                            });
                                                        }
                                                    }}
                                                >
                                                    Disable Minter
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className="d-none d-lg-block d-md-block d-xl-block">
                                        <Col>
                                            <div className="d-grid mt-2 text-center">
                                                <Alert variant="light">
                                                    <p className="display-5 ">
                                                        Deployer
                                                    </p>
                                                    <br />
                                                    <p
                                                        className="fs-5 bg-alert"
                                                        style={{
                                                            fontWeight: 900,
                                                        }}
                                                    >
                                                        {
                                                            Config.deployInfo
                                                                .deployer
                                                        }
                                                    </p>

                                                    {Config.deployInfo
                                                        .deployer ===
                                                    controller.accounts[0] ? (
                                                        <span className="ms-2 badge bg-success">
                                                            current wallet
                                                        </span>
                                                    ) : (
                                                        <></>
                                                    )}
                                                    <br />
                                                    {new Date(
                                                        Config.deployInfo
                                                            .date || Date.now()
                                                    ).toLocaleString()}
                                                </Alert>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                        <Row className="mt-4">
                            <Col>
                                <Card body>
                                    <p className="fs-2">
                                        Project File Overview{' '}
                                        <span
                                            className="badge bg-dark"
                                            style={{ fontSize: 12 }}
                                        >
                                            version: 1.
                                            {
                                                this.state.projectSettings
                                                    ?.version
                                            }{' '}
                                            ({this.state.projectSettings?.tag})
                                        </span>
                                    </p>
                                    <ListGroup>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Version{' '}
                                            <span className="badge bg-light">
                                                {this.state.projectSettings
                                                    ?.version === undefined
                                                    ? 'unknown'
                                                    : this.state.projectSettings
                                                          ?.version}
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Version Tag{' '}
                                            <span className="badge bg-light">
                                                {this.state.projectSettings
                                                    ?.tag || 'unknown'}
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Project Name{' '}
                                            <span className="badge bg-light">
                                                {this.state.projectSettings
                                                    ?.project || 'unknown'}
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Deployed{' '}
                                            <span className="badge bg-light">
                                                {new Date(
                                                    this.state.projectSettings?.deployTime
                                                ).toString()}
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Updated{' '}
                                            <span className="badge bg-light">
                                                {new Date(
                                                    this.state.projectSettings
                                                        ?.updated ||
                                                        this.state
                                                            .projectSettings
                                                            ?.deployTime
                                                ).toString()}
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Approved Wallets{' '}
                                            <span className="badge bg-light">
                                                {(
                                                    this.state.projectSettings
                                                        ?.approved || []
                                                )?.length || 0}{' '}
                                                wallets
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Paths{' '}
                                            <span className="badge bg-light">
                                                {Object.keys(
                                                    this.state.projectSettings
                                                        ?.paths
                                                ).filter(
                                                    (key) => key !== 'default'
                                                ).length || 0}{' '}
                                                paths
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Assets{' '}
                                            <span className="badge bg-light">
                                                {Object.keys(
                                                    this.state.projectSettings
                                                        ?.assets || {}
                                                ).filter(
                                                    (key) => key !== 'default'
                                                ).length || 0}{' '}
                                                assets
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Last Fetched{' '}
                                            <span className="badge bg-light">
                                                {new Date(
                                                    this.state.projectSettings
                                                        ?.fetched || 0
                                                ).toString()}
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Local Project File{' '}
                                            <span className="badge bg-light">
                                                {Config.settings.localProject ||
                                                    'external'}
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Local Project File Location{' '}
                                            <span
                                                className="badge bg-light"
                                                hidden={
                                                    Config.settings
                                                        .localProject ===
                                                    undefined
                                                }
                                            >
                                                ./src/Deployments/
                                                {Config.settings.localProject}
                                                .json
                                            </span>
                                            <span
                                                className="badge bg-warning"
                                                hidden={
                                                    Config.settings
                                                        .localProject !==
                                                    undefined
                                                }
                                            >
                                                external
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Using Local Project File:{' '}
                                            {Config.settings
                                                .useLocalProjectURI ? (
                                                <span className="badge bg-success ms-2">
                                                    true
                                                </span>
                                            ) : (
                                                <span className="badge bg-danger ms-2">
                                                    false
                                                </span>
                                            )}
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Names{' '}
                                            <span className="badge bg-light">
                                                {
                                                    this.state.projectSettings
                                                        ?.names.length
                                                }{' '}
                                                names
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Chain Name{' '}
                                            <span className="badge bg-light">
                                                {
                                                    this.state.projectSettings
                                                        ?.network?.name
                                                }
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Chain Id{' '}
                                            <span className="badge bg-light">
                                                {
                                                    this.state.projectSettings
                                                        ?.network?.chainId
                                                }
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Royalty Type{' '}
                                            <span className="badge bg-light">
                                                {
                                                    this.state.projectSettings
                                                        ?.modules?.royalty
                                                }
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Minter Type{' '}
                                            <span className="badge bg-light">
                                                {
                                                    this.state.projectSettings
                                                        ?.modules?.Buttonminter
                                                }
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Asset Controller{' '}
                                            <span className="badge bg-light">
                                                {
                                                    this.state.projectSettings
                                                        ?.modules?.controller
                                                }
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Controller Script{' '}
                                            <span className="badge bg-light">
                                                ./src/Deployments/scripts/
                                                {
                                                    this.state.projectSettings
                                                        ?.modules?.renderScript
                                                }
                                                .js
                                            </span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="bg-light text-primary">
                                            Mints{' '}
                                            {this.state.mintsEnabled ? (
                                                <span className="badge bg-success">
                                                    enabled
                                                </span>
                                            ) : (
                                                <span className="badge bg-danger">
                                                    disabled
                                                </span>
                                            )}
                                        </ListGroup.Item>
                                    </ListGroup>
                                    <code
                                        className="p-4 d-grid bg-dark text-white"
                                        style={{
                                            maxHeight: 512,
                                            overflowY: 'scroll',
                                        }}
                                    >
                                        <pre
                                            className="text-white"
                                            style={{ overflowX: 'hidden' }}
                                        >
                                            {JSON.stringify(
                                                this.state.projectSettings,
                                                null,
                                                4
                                            )}
                                        </pre>
                                    </code>
                                </Card>
                            </Col>
                        </Row>

                        <Row className="mt-4">
                            <Col>
                                <Card body>
                                    <p className="fs-2">
                                        Approved Wallets{' '}
                                        <span className="badge bg-primary ms-2">
                                            {(
                                                this.state.projectSettings
                                                    ?.approved || []
                                            )?.length || 0}{' '}
                                            wallets
                                        </span>
                                    </p>
                                    <ListGroup>
                                        {(
                                            this.state.projectSettings
                                                ?.approved || []
                                        ).map((wallet, index) => (
                                            <ListGroup.Item
                                                key={index}
                                                className="d-flex align-items-center bg-light force-black justify-content-between"
                                            >
                                                <span className="badge bg-dark p-2">
                                                    #{index}{' '}
                                                    <a
                                                        className='cool-link'
                                                        href="?"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.open(
                                                                Config.getNetwork()
                                                                    .tokenscan +
                                                                    'address/' +
                                                                    wallet
                                                            );
                                                        }}
                                                    >
                                                        sleuth
                                                    </a>
                                                </span>
                                                <div className="d-grid justify-content-center mb-2">
                                                    <span className="badge bg-light text-black fs-6 text-center">
                                                        {wallet}
                                                    </span>
                                                    {wallet ===
                                                    controller.accounts[0] ? (
                                                        <span className="badge bg-success fs-5 text-center">
                                                            CURRENT
                                                        </span>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                </Card>
                            </Col>
                        </Row>
                        <Row className="mt-4">
                            <Col>
                                <Card body>
                                    <div className="d-grid gap-2">
                                        <NavigationLink
                                            location="/mytokens"
                                            text={
                                                resources.$.UI.Action.MyTokens
                                            }
                                        />
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                        <br />
                        <br />
                        <br />
                    </>
                )}
            </Container>
        );
    }
}

Status.url = '/utility/status';
Status.developer = true;
Status.id = 'Status';
Status.settings = {
    dropdown: {
        utility: '$.UI.Navbar.Status',
    },
};

export default Status;
