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
import Token from '../../Components/Token.js';
import { loadPath, unpackColours, waitSetState } from '../../helpers.js';
import Config from '../../config.js';
import Loading from '../../Components/Loading.js';
import Controller from 'infinitymint-client/dist/src/classic/controller.js';
import Resources from 'infinitymint-client/dist/src/classic/resources.js';
import StorageController from 'infinitymint-client/dist/src/classic/storageController.js';
import { Redirect } from 'react-router-dom';

class Minter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stickers: [],
            fakeToken: {
                owner: Controller.accounts[0],
                names: [],
                previewId: 0,
                colours: [],
                mintData: {},
                name: Controller.getDescription().token,
                pathId: 0,
                pathSize: 0,
                assets: [],
            },
            isReady: false,
            paths: [],
            sections: [],
            navigate: '',
            assets: {},
        };
    }

    async regenerateColours() {
        const projectFile = Controller.getProjectSettings();

        // Generate all colours
        if (Config.settings.useOldColours) {
            const colours = [];

            for (
                let i = 0;
                i <
                (Controller?.paths[this.state.fakeToken.pathId]?.pathSize ===
                undefined
                    ? 0
                    : Controller.paths[this.state.fakeToken.pathId].pathSize) +
                    (projectFile?.deployment?.extraColours || 6);
                i++
            ) {
                colours.push(Math.random() * 0xff_ff_ff);
            }

            this.setState({
                fakeToken: {
                    ...this.state.fakeToken,
                    colours,
                    pathSize:
                        Controller?.paths[this.state.fakeToken.pathId]
                            ?.pathSize === undefined
                            ? 0
                            : Controller.paths[this.state.fakeToken.pathId]
                                  .pathSize,
                },
            });
        } else {
            const pathSize =
                Controller?.paths[this.state.fakeToken.pathId]?.pathSize || 1;
            const extraColours = projectFile?.deployment?.extraColours || 6;
            const div = projectFile?.deployment?.colourChunkSize;
            let objects = [];
            if (pathSize <= div) {
                objects = [
                    Math.floor(Math.random() * 0xff_ff_ff),
                    pathSize,
                    Math.floor(Math.random() * 0xff_ff_ff_ff),
                    extraColours,
                ];
            } else {
                let groups = 0;
                const div = projectFile.deployment?.colourChunkSize || 4;

                for (let i = 0; i < pathSize; i++) {
                    if (i % div === 0) {
                        groups++;
                    }
                }

                let count = 0;
                const temporaryPathSize = pathSize;
                for (let i = 0; i < groups * 2; i++) {
                    if (i % 2 == 0) {
                        objects[i] = Math.floor(Math.random() * 0xff_ff_ff);
                    } else {
                        const result = temporaryPathSize - div * count++;
                        objects[i] = result > div ? div : result;
                    }
                }

                objects.push(
                    Math.floor(Math.random() * 0xff_ff_ff_ff),
                    extraColours
                );
            }

            this.setState({
                fakeToken: {
                    ...this.state.fakeToken,
                    compressedColours: objects,
                    colours: unpackColours(objects),
                    pathSize:
                        Controller?.paths[this.state.fakeToken.pathId]
                            ?.pathSize === undefined
                            ? 0
                            : Controller.paths[this.state.fakeToken.pathId]
                                  .pathSize,
                },
            });
        }
    }

    async componentDidMount() {
        const project = Controller.getProjectSettings();

        if (project.paths !== undefined) {
            this.setState({
                // Remove default fro mthe paths
                paths: Object.keys(project.paths)
                    .filter((key) => key !== 'default')
                    .map((key) => project.paths[key]),
            });
        }

        if (project.assets !== undefined) {
        }

        // Load path 0
        await this.regenerateColours();

        this.setState({
            isReady: true,
        });
    }

    render() {
        if (this.state.navigate !== '') {
            return <Redirect to={this.state.navigate} />;
        }

        return (
            <>
                <Container fluid>
                    {this.state.isReady && !this.state.loading ? (
                        <>
                            <h1 className="mt-4 text-center display-5 force-white">
                                🦺 Admin Minter
                            </h1>
                            <Alert variant="success">
                                Select a path and mint it. You can mint it to any wallet you want and even give it a custom name. You are basically a mint GOD back here.
                            </Alert>
                            <Row>
                                <Col>
                                    <Card body>
                                        <Row className="gy-2">
                                            <Col
                                                xs={12}
                                                sm={12}
                                                md={8}
                                                lg={8}
                                                xl={8}
                                                xxl={8}
                                            >
                                                <Card
                                                    body
                                                    className="bg-dark mt-2 force-white"
                                                >
                                                    <p className="fs-3 m-3">
                                                        Paths{' '}
                                                        <span className="badge ms-2 bg-light">
                                                            {
                                                                this.state.paths
                                                                    .length
                                                            }
                                                        </span>
                                                    </p>
                                                    <Row
                                                        className="align-items-center"
                                                        style={{
                                                            maxHeight: 384,
                                                            overflowY: 'scroll',
                                                        }}
                                                    >
                                                        <Col className="mx-auto">
                                                            <div className="d-grid gap-2">
                                                                {this.state
                                                                    .paths
                                                                    .length >
                                                                0 ? (
                                                                    this.state.paths.map(
                                                                        (
                                                                            path,
                                                                            index
                                                                        ) => (
                                                                            <Button
                                                                                key={
                                                                                    index
                                                                                }
                                                                                disabled={
                                                                                    path.pathId ===
                                                                                    this
                                                                                        .state
                                                                                        .fakeToken
                                                                                        .pathId
                                                                                }
                                                                                size="sm"
                                                                                onClick={async () => {
                                                                                    await this.setState(
                                                                                        {
                                                                                            loading: true,
                                                                                        }
                                                                                    );
                                                                                    const projectURI =
                                                                                        Controller.getProjectSettings();
                                                                                    await loadPath(
                                                                                        projectURI,
                                                                                        path.pathId
                                                                                    );

                                                                                    await waitSetState(
                                                                                        this,
                                                                                        {
                                                                                            loading: false,
                                                                                            fakeToken:
                                                                                                {
                                                                                                    ...this
                                                                                                        .state
                                                                                                        .fakeToken,
                                                                                                    pathId: path.pathId,
                                                                                                },
                                                                                        }
                                                                                    );
                                                                                    this.regenerateColours();
                                                                                }}
                                                                                variant={
                                                                                    path.pathId ===
                                                                                    this
                                                                                        .state
                                                                                        .fakeToken
                                                                                        .pathId
                                                                                        ? 'success'
                                                                                        : 'light'
                                                                                }
                                                                            >
                                                                                {path.name ||
                                                                                    'Path ' +
                                                                                        path}{' '}
                                                                                <span className="badge bg-dark">
                                                                                    Rarity:{' '}
                                                                                    {path.rarity ||
                                                                                        'Non'}
                                                                                </span>
                                                                            </Button>
                                                                        )
                                                                    )
                                                                ) : (
                                                                    <></>
                                                                )}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                                <Row>
                                                    <Col>
                                                        <Card
                                                            body
                                                            className="bg-dark force-white"
                                                        >
                                                            <p className="fs-3">
                                                                Asset Tree{' '}
                                                                <span className="badge bg-light">
                                                                    {
                                                                        Object.values(
                                                                            this
                                                                                .state
                                                                                .assets
                                                                        ).length
                                                                    }
                                                                </span>
                                                            </p>
                                                            {Object.values(
                                                                this.state
                                                                    .assets
                                                            ).length === 0 ? (
                                                                <Alert
                                                                    variant="warning"
                                                                    className="text-center"
                                                                >
                                                                    No Assets
                                                                </Alert>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col>
                                                <Token
                                                    theToken={
                                                        this.state.fakeToken
                                                    }
                                                    stickers={
                                                        this.state.stickers
                                                    }
                                                    textCutoff={48}
                                                    settings={{
                                                        useFresh: true,
                                                        renderOnUpdate: true,
                                                        noPadding: true,
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <div className="d-grid mt-1">
                                                    <Button
                                                        variant="dark"
                                                        size="lg"
                                                        onClick={() => {
                                                            this.regenerateColours();
                                                        }}
                                                    >
                                                        🔄 Reshuffle Colours
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card body>
                                        <Row className="gap-2">
                                            <Col>
                                                <p className="fs-2">Receiver</p>
                                                <div className="d-grid">
                                                    <Form.Control
                                                        type="text"
                                                        size="lg"
                                                        value={
                                                            this.state.fakeToken
                                                                .owner
                                                        }
                                                        onChange={(e) => {
                                                            this.setState({
                                                                fakeToken: {
                                                                    ...this
                                                                        .state
                                                                        .fakeToken,
                                                                    owner: e
                                                                        .target
                                                                        .value,
                                                                },
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </Col>
                                            <Col>
                                                <p className="fs-2">
                                                    Names{' '}
                                                    <span className="badge bg-success">
                                                        {
                                                            this.state.fakeToken
                                                                .name
                                                        }
                                                    </span>
                                                </p>

                                                <div className="d-grid">
                                                    <Form.Control
                                                        type="text"
                                                        size="lg"
                                                        value={this.state.fakeToken.names.join(
                                                            ' '
                                                        )}
                                                        onChange={(e) => {
                                                            this.setState({
                                                                fakeToken: {
                                                                    ...this
                                                                        .state
                                                                        .fakeToken,
                                                                    names: e.target.value.split(
                                                                        ' '
                                                                    ),

                                                                    name: e
                                                                        .target
                                                                        .value,
                                                                },
                                                            });
                                                        }}
                                                    />
                                                    <p className="fs-5 mt-2">
                                                        {JSON.stringify(
                                                            this.state.fakeToken
                                                                .names
                                                        )}
                                                    </p>
                                                </div>
                                            </Col>
                                        </Row>
                                        <hr />
                                        <Row>
                                            <p className="fs-2">
                                                Mint Data{' '}
                                                <span className="badge bg-success">
                                                    Advanced
                                                </span>
                                            </p>
                                            <Col>
                                                <textarea
                                                    className="form-control"
                                                    rows={3}
                                                    type="text"
                                                    style={{
                                                        resize: 'none',
                                                    }}
                                                    placeholder="{}"
                                                />
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card body>
                                        <div className="d-grid">
                                            <Button
                                                onClick={async () => {
                                                    await waitSetState(this, {
                                                        loading: true,
                                                    });

                                                    try {
                                                        const result =
                                                            await Controller.sendAndWaitForEvent(
                                                                Controller
                                                                    .accounts[0],
                                                                'InfinityMint',
                                                                'implicitMint',
                                                                Config.events
                                                                    .InfinityMint
                                                                    .Mint,
                                                                {
                                                                    filter: {
                                                                        sender: Controller
                                                                            .accounts[0],
                                                                    },
                                                                    gasLimit:
                                                                        Config
                                                                            .gasLimit
                                                                            .mint, // Replace with a config somewhere
                                                                    gasPrice:
                                                                        Config.getGasPrice(
                                                                            StorageController.getGlobalPreference(
                                                                                'gasSetting'
                                                                            )
                                                                        ),
                                                                    parameters:
                                                                        [
                                                                            this
                                                                                .state
                                                                                .fakeToken
                                                                                .owner,
                                                                            this
                                                                                .state
                                                                                .fakeToken
                                                                                .pathId,
                                                                            this
                                                                                .state
                                                                                .fakeToken
                                                                                .pathSize,
                                                                            this
                                                                                .state
                                                                                .fakeToken
                                                                                .compressedColours,
                                                                            Controller.web3.utils.asciiToHex(
                                                                                this
                                                                                    .state
                                                                                    .fakeToken
                                                                                    .mintData
                                                                            ),
                                                                            this
                                                                                .state
                                                                                .fakeToken
                                                                                .assets,
                                                                            this
                                                                                .state
                                                                                .fakeToken
                                                                                .names,
                                                                        ],
                                                                },
                                                                0
                                                            );

                                                        const tokenId =
                                                            Controller.storeToken(
                                                                result[1],
                                                                'event',
                                                                'mint',
                                                                {
                                                                    tokenURI: true,
                                                                }
                                                            );

                                                        // Redirect
                                                        await waitSetState(
                                                            this,
                                                            {
                                                                loading: false,
                                                                navigate: `/view/${tokenId}`,
                                                            }
                                                        );
                                                    } catch (error) {
                                                        console.log(error);
                                                    } finally {
                                                        await waitSetState(
                                                            this,
                                                            {
                                                                loading: false,
                                                            }
                                                        );
                                                    }
                                                }}
                                                variant="success"
                                            >
                                                Mint Token
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <Loading />
                    )}
                    <br />
                    <br />
                    <br />
                </Container>
            </>
        );
    }
}

Minter.url = '/admin/mint';
Minter.id = 'AdminMinter';
Minter.settings = {
    requireAdmin: true,
    dropdown: {
        admin: '$.UI.Navbar.AdminMint',
    },
};

export default Minter;
