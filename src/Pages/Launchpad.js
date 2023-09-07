/* eslint-disable max-depth */
import React, { Component } from 'react';
import { Container, Row, Col, Alert, Card, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import {
    loadToken,
    loadStickers,
    hasDestination,
    hasDeployment,
    getDeploymentAddress,
    hasLink,
    decideRowClass,
} from '../helpers.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import NavigationLink from '../Components/NavigationLink.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import GasMachine from '../Components/GasMachine.js';
import Loading from '../Components/Loading.js';
import Config from '../config.js';
import modController from 'infinitymint-client/dist/src/classic/modController.js';
import Box from '../Components/Box.js';

let _errorTimeout;
class Launchpad extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // eslint-disable-next-line react/prop-types
            tokenId: this?.props?.match?.params?.tokenId || 0,
            tokenData: {},
            token: {
                pathSize: 13,
                colours: [],
            },
            rowInterval: null,
            hasStickerContract: false,
            hasWalletContract: false,
            tags: {},
            links: [],
            rowClass: decideRowClass(),
            isValid: false,
            location: '',
            stickers: [],
            loading: true,
            isWaiting: false,
            hasStickers: false,
        };
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
            error,
        });
        this.cleanupError(5);
    }

    async componentDidMount() {
        await this.load();

        this.setState({
            rowInterval: setInterval(() => {
                this.setState({
                    rowClass: decideRowClass(),
                });
            }, 1000),
        });
    }

    async componentWillUnmount() {
        clearInterval(this.state.rowInterval);
    }

    async load() {
        try {
            // Load the token and return the flags
            await loadToken(this, true, true);

            await this.checkLinks();

            if (this.state.isValid) {
                // Load the stickers
                await loadStickers(this);

                /*console.log('🆔 0️⃣ ' + hasDestination(this.state.token, 0));
                console.log('🆔 1️⃣ ' + hasDestination(this.state.token, 1));
                console.log('🆔 2️⃣ ' + hasDestination(this.state.token, 2));
                console.log('🆔 3️⃣ ' + hasDestination(this.state.token, 3));*/

                /// TODO: Replace with the actual name of the link contract
                if (controller.hasFlag('awaitingEADStickersLink')) {
                    if (hasDestination(this.state.token, 1)) {
                        //console.log('🆔 ' + 'Has Destination 1');
                        controller.setFlag(0, 'awaitingEADStickersLink', false);
                        controller.setFlag(
                            0,
                            'awaitingEADStickersDestination',
                            false
                        );
                    }

                    this.setState({
                        hasStickerContract: true,
                    });
                }

                if (this.state.token.owner !== controller.accounts[0]) {
                    this.setState({
                        location: '/view/' + this.state.tokenId,
                    });
                }

                /// TODO: Replace with the actual name of the link contract
                if (
                    hasDestination(this.state.token, 0) ||
                    controller.hasFlag('awaitingInfinityMintWalletLink')
                ) {
                    //console.log('🆔 ' + 'Has Destination 0');
                    if (hasDestination(this.state.token, 0)) {
                        controller.setFlag(
                            0,
                            'awaitingInfinityMintWalletLink',
                            false
                        );
                        controller.setFlag(
                            0,
                            'awaitingInfinityMintWalletDestination',
                            false
                        );
                    }

                    this.setState({
                        hasWalletContract: true,
                    });

                    /// TODO: Replace with the actual name of the link contract
                }

                if (
                    hasDestination(this.state.token, 2) ||
                    controller.hasFlag('awaitingMod_MultiMinterOracleLink')
                ) {
                    console.log('🆔 ' + 'Has Destination 2');
                    if (hasDestination(this.state.token, 2)) {
                        controller.setFlag(
                            2,
                            'awaitingMod_MultiMinterOracleLink',
                            false
                        );
                        controller.setFlag(
                            2,
                            'awaitingMod_MultiMinterOracleDestination',
                            false
                        );
                    }
                    
                   
                }
                
            }
        } catch (error) {
            controller.log('[😞] Error', 'error');
            controller.log(error);
        }
    }

    parseArgs(defaultArgs = []) {
        if (defaultArgs.length === 0) {
            return [];
        }

        return defaultArgs
            .map((args) => args[2])
            .map((parameter) => {
               
                switch (parameter.toLowerCase()) {
                    case 'tokenid': {
                        //console.log('🆔 ' + parameter);
                        return this.state.tokenId;
                    }

                    case 'erc721':
                    case 'erc721destination':
                    case 'infinitymint': {
                        console.log('🆔 ' + parameter);
                        return Config.getDeploymentDestination('InfinityMint');
                    }

                    case 'infinitymintvalues':
                    case 'valuesdestination': {
                        console.log('🆔 ' + parameter);
                        return Config.getDeploymentDestination(
                            'InfinityMintValues'
                        );
                        
                    }

                    
                    case 'wallet': {
                        console.log('🆔 ' + parameter);
                        return (
                            this.state.token?.destinations[0] ||
                            Config.nullAddress
                        );
                        
                    }

                    case 'stickers': {
                        console.log('🆔 ' + parameter);
                        return (
                            this.state.token?.destinations[1] ||
                            Config.nullAddress
                        );
                        
                    }

                    case 'mod_multiminteroracle': {
                        console.log('🆔 ' + parameter);
                        return (
                            this.state.token?.destinations[2] ||
                            Config.nullAddress
                        );
                        
                    }

                    case 'owner':
                    case 'sender': {
                        console.log('🆔 ' + parameter);
                        return controller.accounts[0];
                    }

                    default: {
                        console.log('🆔 ' + parameter);
                        return (
                            
                            this.state.token?.destinations[
                                controller.getProjectSettings()?.links[
                                    parameter
                                ]?.index
                            ] || ''
                        );
                    }
                }
            });
    }

    async linkContract(link) {
        this.setState({
            success: false,
            loading: true,
        });

        try {
            let args = [];
            let contract = 'InfinityMintLinker';
            let method = 'setLink';

            if (link.useDefaultLinker) {
                args = [
                    this.state.tokenId,
                    link.key,
                    storageController.values.deployments[this.state.tokenId][
                        link.contract
                    ].address,
                ];
            } else {
                contract = link.contract;
                method = link.method;

                if (link.args !== undefined) {
                    args = this.parseArgs(link.args);
                }
            }

            await controller.sendMethod(
                controller.accounts[0],
                contract,
                method,
                args
            );

            controller.setFlag(
                this.state.tokenId,
                'awaiting' + link.contract + 'Link',
                false
            );
            console.log('awaiting' + link.contract + 'Link');
            controller.setFlag(
                this.state.tokenId,
                'awaiting' + link.contract + 'Destination',
                true
            );
            console.log('awaiting' + link.contract + 'Destination');
            controller.setFlag(
                this.state.tokenId,
                'error' + link.contract + 'Link',
                false
            );
            this.setState({
                loading: false,
                success: true,
            });
            await this.load();
        } catch (error) {
            controller.setFlag(
                this.state.tokenId,
                'error' + link.contract + 'Link',
                true
            );
            controller.log(error);
            this.setError(error);
        } finally {
            this.setState({
                loading: false,
            });
        }
    }

    async checkLinks() {
        const projectSettings = controller.getProjectSettings();

        if (
            projectSettings.links === undefined ||
            projectSettings.links.length === 0
        ) {
            return;
        }

        const links = [];
        const actualLinks = Object.values(projectSettings.links);
        for (const link of actualLinks) {
            try {
                link.valid = true;
                if (link.useHooks !== undefined && link.useHooks.length > 0) {
                    for (let x = 0; x < link.useHooks.length; x++) {
                        // eslint-disable-next-line no-await-in-loop
                        const result = await modController.callModMethod(
                            'onCheckLink',
                            {
                                link: link.key,
                                token: this.state.token,
                                linkObject: link,
                            },
                            link.useHooks[x]
                        );

                        if (result !== false) {
                            link.valid = true;
                        }

                        if (typeof result === 'string') {
                            link.message = result;
                        }

                        if (link.valid) {
                            // eslint-disable-next-line no-await-in-loop
                            const result = await modController.callModMethod(
                                'onLinkSuccess',
                                {
                                    link: link.key,
                                    token: this.state.token,
                                    linkObject: link,
                                },
                                link.useHooks[x]
                            );
                            if (result !== undefined && result !== null) {
                                link.children = result;
                            }
                        }
                    }
                }
            } catch (error) {
                console.log(error);
                link.error = error;
                link.valid = false;
            }

            links.push(link);
        }

        this.setState({
            links,
        });
    }

    async deployContract(link, args = []) {
        this.setState({
            success: false,
            loading: true,
        });

        const { contract } = link;

        try {
            
            console.log('Deploying: ' + contract);
            console.log('Args: ' + this.parseArgs(args));
            const result = await controller.deployContract(
                'Fake_' + contract,
                this.parseArgs(args)
            );

            

            if (
                storageController.values.deployments[this.state.tokenId] ===
                undefined
            ) {
                storageController.values.deployments[this.state.tokenId] = {};
            }

            storageController.values.deployments[this.state.tokenId][contract] =
                { address: result.address || result._address, link };
            storageController.saveData();

            controller.setFlag(
                this.state.tokenId,
                'awaiting' + contract + 'Link',
                true
            );

            this.setState({
                loading: false,
                success: true,
            });

            await this.load();
        } catch (error) {
            controller.log(error);
            this.setError(error);
        } finally {
            this.setState({
                loading: false,
            });
        }
    }

    render() {
        const projectSettings = controller.getProjectSettings();

        if (this.state.location !== '') {
            return <Redirect to={this.state.location} />;
        }

        return (
            <>
                {this.state.loading ? (
                    <Container>
                        <Loading />
                    </Container>
                ) : (
                    <Container className="mt-4 p-2 w-75 lg: w-75 xl: w-75 sm: w-100">
                        <Row>
                            <Col className="text-center">
                                <h1 className=" display-5 force-white">
                                    🚀 Token Launchpad
                                </h1>

                                <Alert variant="success">
                                    <p className="display-9 text-center">
                                        Launch upgrades for your Dynamic NFT by
                                        attaching INFINITY💎GEMS. Think of them as Plug-ins that unleash
                                        the magic and amazing power of Web3. These 💎gems are
                                        smart contract expansions that add utility and features
                                        to your tokens. 
                                    </p>
                                </Alert>
                            </Col>
                        </Row>

                        <Row>
                            <Col className="d-grid mx-2 gap-2">
                               
                                    <Button
                                        variant="dark"
                                        size="lg"
                                        onClick={async () => {
                                            try {
                                                delete storageController.values
                                                    .tokens[this.state.tokenId];
                                                storageController.saveData();

                                                this.setState({
                                                    token: {
                                                        pathSize: 0,
                                                        colours: [],
                                                        stickers: [],
                                                    },
                                                    loading: true,
                                                    isValid: false,
                                                });

                                                await this.load();
                                            } catch (error) {
                                                this.setError(error);
                                            }
                                        }}
                                    >
                                        {resources.$.UI.Action.Refresh}
                                    </Button>
                                   
                                    </Col>
                                    <Col className="d-grid mx-2 gap-2">
                                    
                                    <NavigationLink
                                        variant='dark'
                                        location={'/edit/' + this.state.tokenId}
                                        text={resources.$.UI.Action.Back}
                                    />
                               
                            </Col>
                        </Row>
                        {this.state.success ? (
                            <Row className="mt-2">
                                <Col>
                                    <Box tag={'😺'} variant="success">
                                        <h3>Success! </h3>
                                        Please try reloading this token for
                                        changes to appear.
                                    </Box>
                                </Col>
                            </Row>
                        ) : (
                            <></>
                        )}
                        {this.state.error !== undefined &&
                        this.state.error !== null ? (
                            <Row className="mt-2">
                                <Col>
                                    <Alert variant="danger">
                                        <p className="fs-2">
                                            ⛔️ Error!
                                            <br />
                                            <span className="fs-4">
                                                {this.state.error.message}
                                            </span>
                                        </p>
                                    </Alert>
                                </Col>
                            </Row>
                        ) : (
                            <></>
                        )}
                        <Row hidden={!this.state.isValid}>
                            <Col>
                                <Card 
                                    className='bg-black text-white mt-4'
                                   
                                >
                                    <Card.Header className='bg-black text-center'>
                                        <h1 className=" bg-black display-7 glow">Available Infinity💎Gems{' '}<span className="badge bg-success">
                                            {this.state.links.length}
                                        </span></h1>
                                        
                                        
                                    </Card.Header>
                                    <Card.Body>
                                        <Row
                                            className={
                                                this.state.rowClass + ''
                                            }
                                        >
                                            {this.state.links.map(
                                                // eslint-disable-next-line complexity
                                                (link, index) => {
                                                    let meetsRequirements = true;

                                                    if (
                                                        link.requirements !==
                                                        undefined
                                                    ) {
                                                        for (const requirement of link.requirements) {
                                                            if (
                                                                !hasLink(
                                                                    this.state
                                                                        .token,
                                                                    requirement
                                                                )
                                                            ) {
                                                                meetsRequirements = false;
                                                            }
                                                        }
                                                    }

                                                    const isAwaitingLink = !(
                                                        link.deployable &&
                                                        !controller.hasFlag(
                                                            this.state.tokenId,
                                                            'awaiting' +
                                                                link.contract +
                                                                'Link'
                                                        )
                                                    );
                                                    return (
                                                        <Col key={index} className='mb-2'>
                                                            <Card className="h-100">
                                                                <Card.Header className="display-9 bg-black">
                                                                    <Row>
                                                                        <Col>
                                                                        💎
                                                                            <span className="ms-2 text-white">
                                                                                {/* eslint-disable-next-line no-negated-condition */}
                                                                                {link.title !==
                                                                                undefined
                                                                                    ? link.title
                                                                                    : link.key}
                                                                            </span>{' '}
                                                                        </Col>
                                                                        <Col
                                                                            xs={2}
                                                                            sm={2}
                                                                            md={2}
                                                                            lg={2}
                                                                            xl={2}
                                                                            xxl={2}
                                                                            >
                                                                                <Button
                                                                        variant="dark"
                                                                        size="sm"
                                                                        style={{
                                                                            float: 'right',
                                                                        }}
                                                                        onClick={async () => {
                                                                            try {
                                                                                delete storageController
                                                                                    .values
                                                                                    .tokens[
                                                                                    this
                                                                                        .state
                                                                                        .tokenId
                                                                                ];
                                                                                storageController.saveData();

                                                                                this.setState(
                                                                                    {
                                                                                        token: {
                                                                                            pathSize: 0,
                                                                                            colours:
                                                                                                [],
                                                                                            stickers:
                                                                                                [],
                                                                                        },
                                                                                        loading: true,
                                                                                        isValid: false,
                                                                                    }
                                                                                );

                                                                                await this.load();
                                                                            } catch (error) {
                                                                                this.setError(
                                                                                    error
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        {
                                                                            resources
                                                                                .$
                                                                                .UI
                                                                                .Action
                                                                                .RefreshMini
                                                                        }
                                                                    </Button>
                                                                        </Col>
                                                                    </Row>
                                                                   
                                                                    
                                                                </Card.Header>
                                                                <Card.Body>
                                                                    {/* eslint-disable-next-line no-negated-condition */}
                                                                    {link.description !==
                                                                    undefined ? (
                                                                        <div
                                                                            className=" bg-light text-black rounded p-2 mb-2"
                                                                            style={{
                                                                                height: 200,
                                                                                overflowY:
                                                                                    'auto',
                                                                                overflowX:
                                                                                    'hidden',
                                                                            }}
                                                                        >
                                                                            <p className="display-9">
                                                                                ✍️
                                                                                Description
                                                                            </p>
                                                                            <p className="small">
                                                                                {
                                                                                    link.description
                                                                                }
                                                                                {
                                                                                   // link.args
                                                                                }
                                                                                
                                                                            </p>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="small">
                                                                            No
                                                                            Description
                                                                            Available...
                                                                        </p>
                                                                    )}
                                                                    {hasDeployment(
                                                                        this
                                                                            .state
                                                                            .token,
                                                                        link.index
                                                                    ) ? (
                                                                        <Alert
                                                                            variant="info"
                                                                            className="text-center"
                                                                        >
                                                                            <p className="fs-2">
                                                                                😇
                                                                            </p>
                                                                            Deployment
                                                                            Live
                                                                            at{' '}
                                                                            {getDeploymentAddress(
                                                                                this
                                                                                    .state
                                                                                    .token,
                                                                                link
                                                                            )}
                                                                            <br />
                                                                            {controller.hasFlag(
                                                                                this
                                                                                    .state
                                                                                    .tokenId,
                                                                                'awaiting' +
                                                                                    link.contract +
                                                                                    'Destination'
                                                                            ) ? (
                                                                                <span className="badge bg-primary mt-2 fs-6">
                                                                                    Awaiting
                                                                                    Reflection
                                                                                    Onchain
                                                                                </span>
                                                                            ) : (
                                                                                <>

                                                                                </>
                                                                            )}
                                                                        </Alert>
                                                                    ) : (
                                                                        <></>
                                                                    )}
                                                                    {hasDestination(
                                                                        this
                                                                            .state
                                                                            .token,
                                                                        link.index
                                                                    ) ? (
                                                                        <Alert
                                                                            variant="success"
                                                                            className="text-center"
                                                                        >
                                                                            ♾️Link Established for this token.
                                                                        </Alert>
                                                                    ) : (
                                                                        <Alert
                                                                            variant="warning"
                                                                            className="text-center"
                                                                            hidden={
                                                                                !hasDeployment(
                                                                                    this
                                                                                        .state
                                                                                        .token,
                                                                                    link.index
                                                                                )
                                                                            }
                                                                        >
                                                                            🚀
                                                                            Now
                                                                            that
                                                                            you
                                                                            have
                                                                            deployed
                                                                            your{' '}
                                                                            {
                                                                                link.key
                                                                            }{' '}
                                                                            contract.
                                                                            You
                                                                            need
                                                                            to
                                                                            link
                                                                            it
                                                                            to
                                                                            this
                                                                            current
                                                                            token.
                                                                        </Alert>
                                                                    )}
                                                                    {link.valid ? (
                                                                        <>
                                                                            {hasDestination(
                                                                                this
                                                                                    .state
                                                                                    .token,
                                                                                link.index
                                                                            ) &&
                                                                            link.children !==
                                                                                undefined ? (
                                                                                <>
                                                                                    {
                                                                                        link.children
                                                                                    }
                                                                                </>
                                                                            ) : (
                                                                                <>

                                                                                </>
                                                                            )}
                                                                            {/* eslint-disable-next-line no-negated-condition */}
                                                                            {link.message !==
                                                                            undefined ? (
                                                                                <Alert variant="success">
                                                                                    {
                                                                                        link.message
                                                                                    }
                                                                                </Alert>
                                                                            ) : (
                                                                                <>

                                                                                </>
                                                                            )}
                                                                            {/* eslint-disable-next-line no-negated-condition */}
                                                                            {!meetsRequirements ? (
                                                                                <Alert
                                                                                    variant="danger"
                                                                                    className="text-center"
                                                                                >
                                                                                    <p className="fs-2">
                                                                                        ❌
                                                                                    </p>
                                                                                    You
                                                                                    are
                                                                                    required
                                                                                    to
                                                                                    link
                                                                                    the
                                                                                    following
                                                                                    before
                                                                                    getting
                                                                                    round
                                                                                    to
                                                                                    this,
                                                                                    check
                                                                                    you&apos;ve
                                                                                    got
                                                                                    the
                                                                                    following
                                                                                    <br />
                                                                                    {(
                                                                                        link.requirements ||
                                                                                        []
                                                                                    ).map(
                                                                                        (
                                                                                            requirement
                                                                                        ) => (
                                                                                            <>
                                                                                                <br />{' '}
                                                                                                {hasLink(
                                                                                                    this
                                                                                                        .state
                                                                                                        .token,
                                                                                                    requirement
                                                                                                )
                                                                                                    ? '✔️'
                                                                                                    : '❌'}{' '}
                                                                                                {
                                                                                                    requirement
                                                                                                }{' '}
                                                                                                <span className="badge bg-dark">
                                                                                                    {/* eslint-disable-next-line no-negated-condition */}
                                                                                                    {projectSettings
                                                                                                        .links[
                                                                                                        requirement
                                                                                                    ] !==
                                                                                                    undefined
                                                                                                        ? projectSettings
                                                                                                              .links[
                                                                                                              requirement
                                                                                                          ]
                                                                                                              .contract
                                                                                                        : 'Unknown: ' +
                                                                                                          requirement}
                                                                                                </span>
                                                                                            </>
                                                                                        )
                                                                                    )}
                                                                                </Alert>
                                                                            ) : (
                                                                                <>

                                                                                </>
                                                                            )}
                                                                            {link.deployable &&
                                                                            controller.hasFlag(
                                                                                this
                                                                                    .state
                                                                                    .token
                                                                                    .tokenId,
                                                                                'error' +
                                                                                    link.contract +
                                                                                    'Link'
                                                                            ) ? (
                                                                                <div className="d-grid">
                                                                                    <Alert
                                                                                        variant="danger"
                                                                                        className="text-center"
                                                                                    >
                                                                                        An
                                                                                        error
                                                                                        occured
                                                                                        while
                                                                                        trying
                                                                                        to
                                                                                        link
                                                                                        this
                                                                                        current
                                                                                        deployment.
                                                                                        So
                                                                                        we
                                                                                        are
                                                                                        going
                                                                                        to
                                                                                        give
                                                                                        you
                                                                                        the
                                                                                        option
                                                                                        to
                                                                                        deploy
                                                                                        another
                                                                                        one
                                                                                        if
                                                                                        you
                                                                                        want.
                                                                                    </Alert>
                                                                                    <Button
                                                                                        variant="danger"
                                                                                        onClick={async () => {
                                                                                            await this.deployContract(
                                                                                                link,
                                                                                                link.args
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        Redeploy
                                                                                        Contract
                                                                                    </Button>
                                                                                </div>
                                                                            ) : (
                                                                                <>

                                                                                </>
                                                                            )}
                                                                            {/* eslint-disable-next-line no-negated-condition */}
                                                                            {!hasDestination(
                                                                                this
                                                                                    .state
                                                                                    .token,
                                                                                link.index
                                                                            ) ? (
                                                                                //console.log(link.title + ': ' + link.args + ' | ' + link.index + ' ' + link.deployable),
                                                                                <div className="d-grid mt-2">
                                                                                    {!hasDeployment(
                                                                                        this
                                                                                            .state
                                                                                            .token,
                                                                                        link.index
                                                                                    ) &&
                                                                                    link.deployable &&
                                                                                    !isAwaitingLink ? (
                                                                                        <Button
                                                                                            variant="success"
                                                                                            disabled={
                                                                                                !meetsRequirements ||
                                                                                                controller.hasFlag(
                                                                                                    this
                                                                                                        .state
                                                                                                        .token
                                                                                                        .tokenId,
                                                                                                    'awaiting' +
                                                                                                        link.contract +
                                                                                                        'Destination'
                                                                                                )
                                                                                            }
                                                                                            onClick={async () => {
                                                                                                console.log("🆔 " + link.title + ": " + link.index + " : " + link.args);
                                                                                                await this.deployContract(
                                                                                                    link,
                                                                                                    link.args
                                                                                                );
                                                                                            }}

                                                                                            //onMouseOver={console.log(link + ' ' + link.title + ': ' + link.args + ' | ' + link.index + ' ' + link.deployable)}
                                                                                        >
                                                                                            Deploy
                                                                                            Required
                                                                                            Contract
                                                                                        </Button>
                                                                                    ) : (
                                                                                        <Button
                                                                                            variant="success"
                                                                                            disabled={
                                                                                                !meetsRequirements ||
                                                                                                controller.hasFlag(
                                                                                                    this
                                                                                                        .state
                                                                                                        .token
                                                                                                        .tokenId,
                                                                                                    'awaiting' +
                                                                                                        link.contract +
                                                                                                        'Destination'
                                                                                                )
                                                                                            }
                                                                                            onClick={async () => {
                                                                                                await this.linkContract(
                                                                                                    link
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            Link
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <>

                                                                                </>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Alert variant="warning">
                                                                                <p>
                                                                                    Cannot
                                                                                    Link
                                                                                    At
                                                                                    This
                                                                                    Time
                                                                                </p>
                                                                                {link
                                                                                    .error
                                                                                    ?.message ||
                                                                                    'Unknown Reason'}
                                                                            </Alert>
                                                                        </>
                                                                    )}
                                                                </Card.Body>
                                                                <Card.Footer>
                                                                    <span className="badge bg-dark">
                                                                        {index}
                                                                    </span>
                                                                </Card.Footer>
                                                            </Card>
                                                        </Col>
                                                    );
                                                }
                                            )}
                                        </Row>
                                        <Row className="mt-3">
                                            <Col
                                                hidden={
                                                    !this.state.isValid ||
                                                    this.state.loading
                                                }
                                            >
                                                <GasMachine />
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Row className="mt-4">
                            <Col>
                                <div className="d-grid gap-2">
                                    <NavigationLink
                                        location={'/edit/' + this.state.tokenId}
                                        text={resources.$.UI.Action.Back}
                                    />
                                    <NavigationLink
                                        location={'/mytokens'}
                                        text={resources.$.UI.Action.MyTokens}
                                    />
                                </div>
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

Launchpad.url = '/edit/:tokenId/deploy';
Launchpad.id = 'Launchpad';
Launchpad.requirements = {
    requireWallet: true,
};

export default Launchpad;
