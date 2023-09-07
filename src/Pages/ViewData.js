import React from 'react';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import PageController from 'infinitymint-client/dist/src/classic/pageController.js';
import {
    loadToken,
    loadStickers,
    send,
    call,
    waitSetState,
} from '../helpers.js';
import {
    Container,
    Row,
    Col,
    Card,
    Alert,
    ListGroup,
    Stack,
    InputGroup,
    Button,
    Form,
    Image,
} from 'react-bootstrap';
import Token from '../Components/Token';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import ipfs from 'infinitymint-client/dist/src/classic/ipfs/web3Storage.js';
import ipfsController from 'infinitymint-client/dist/src/classic/ipfs/web3Storage.js';
import NavigationLink from '../Components/NavigationLink.js';
import Loading from '../Components/Loading.js';


const keyDescriptions = {
    /*
    
    showProfile: '',
    confimedENS: '',
    partyPlanner: '🥳time.eth',
    //Maps to data from confimedENS if available. However, this token profile will overide the default display from the ENS and it can be used to update the users ENS profile with Magic🪞
    activeParty: '🥳time.eth',
    activePartyLink: 'https://magicmirror.one/🥳time.eth',
    activePartyImage: 'partytime/logo.png',
    activePartyDescription: 'Party Time',
    activePartyLocation: '🌎',
    activePartyPassword: '🔑',
    activePartyPasswordProtected: false,
    activePartyMaxCapacity: 420,
    partyBounty: 0
    
    */
    showProfile: {
        name: 'Show Profile',
        description:
            'Set the permission to show your profile on your token. This will allow everyone to see your profile on your token.',
        type: 'select',
        options: {
            true: 'Show',
            false: 'Hide',
        },
        props: {},

    },
    confimedENS: { 
        name: 'ENS (Web3 Identity)',
        description:
            'The ENS name that is used to display your profile on your token.',
        type: 'text',
        props: {},
    },
    partyPlanner: {
        name: 'Party Planner',
        description:
            'The Name of the Party Planner that people can address when they want to party with you.',
        type: 'text',
        props: {},
    },
    activeParty: {
        name: 'Active Party',
        description:
            'The name of the party that you are currently organizing or attending.',
        type: 'text',
        props: {},
    },
    activePartyLink: {
        name: 'Active Party Link',
        description:
            'The link to the party that you are currently organizing or attending.',
        type: 'text',
        props: {},
    },
    activePartyImage: {
        name: 'Active Party Image',
        description:
            'An IPFS link to an image that is used as the active Flyer for this event.',
        type: 'text',
        props: {},
    },
    activePartyDescription: {
        name: 'Active Party Description',
        description:
            'A short description of the party that you are currently organizing or attending.',
        type: 'multiline',
        props: {},
    },
    activePartyLocation: {
        name: 'Active Party Location',
        description:
            'The IRL and URL locations of the party. This can be a city, country or even a street address. You do not have to be specific if you do not want to.',
        type: 'multiline',
        props: {},
    },
    activePartyPassword: {
        name: 'Active Party Password',
        description:
            'This is your special password that you can use to invite people to your party.',
        type: 'text',
        props: {},
    },
    activePartyPasswordProtected: {
        name: 'Active Party Password Protected',
        description:
            'Set this to true if you want to protect your party with a password.',
        type: 'select',
        options: {
            true: 'Yes',
            false: 'No',
        },
        props: {},
    },
    activePartyMaxCapacity: {
        name: 'Active Party Max Capacity',
        description:
            'The maximum number of people that you want to allow at your party.',
        type: 'number',
        props: {
            min: 2,
            max: 1000,
        },
    },
    partyBounty: {
        name: 'Party Bounty',
        description:
            'The amount of ETH that you are willing to pay to the person that meet your party\'s vibe.',
        type: 'number',
        props: {
            min: 0,
            max: 1000,
        },
    },


    
};

class ViewData extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            success: false,
            tokenId: this?.props?.match?.params?.tokenId || 0,
            token: {},
            keys: {},
            isValid: false,
            error: null,
            loaded: false,
        };

        // We have to bind to `this` to read the properties
        // See: <https://stackoverflow.com/questions/32317154/react-uncaught-typeerror-cannot-read-property-setstate-of-undefined>
        this.handleChange = this.handleChange.bind(this);
    }

    async componentDidMount() {
        await loadToken(this);

        if (this.state.isValid) await loadStickers(this);

        try {
            let result = await call('Mod_FlagManager', 'getTokenFlag', [
                this.state.token.owner,
                this.state.tokenId,
                'data',
            ]);

            if (!result)
                await waitSetState(this, {
                    keys: {},
                });
            else {
                let data = await (
                    await fetch(`https://ipfs.io/ipfs/${result}`)
                ).json();
                await waitSetState(this, {
                    keys: data,
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.setState({
                loaded: true,
            });
        }

        if (!this.state.keys?.confimedENS) {
            let clubNumber;

            if (typeof this.state.token.mintData === 'string') {
                if (this.state.token.mintData.startsWith('0x')) {
                    let result = controller.web3.utils.toAscii(
                        this.state.token.mintData
                    );

                    if (result.startsWith('m'))
                        result = result.substring(1, result.length);

                    try {
                        clubNumber = JSON.parse(result)?.digit;
                    } catch (error) {}
                } else clubNumber = this.state.token.mintData;
            } else clubNumber = this.state.token.mintData?.digit;

            clubNumber = parseInt(
                clubNumber || Math.floor(100 + Math.random() * 9999)
            );
            this.setState({
                keys: {
                    ...this.state.keys,
                    //confimedENS: clubNumber, //keep this off unless you want to fix it and make it work with the new ENS scripts. Happy forking!
                },
            });
        }
    }

    handleChange(e) {
        console.log(e.target.files);
        this.setState({
            file: URL.createObjectURL(e.target.files[0]),
        });
    }

    async setContentOnToken() {
        this.setState({
            loaded: false,
        });

        if (!storageController.getGlobalPreference('web3StorageApiKey'))
            throw new Error('No Web3 Storage API Key');

        ipfsController.createInstance(
            storageController.getGlobalPreference('web3StorageApiKey')
        );
        let cid;
        if (this.state.keys === null) return;

        if (this.state.keys !== null || this.state.keys !== undefined)
            cid = await ipfsController.uploadFile(
                'index.json',
                JSON.stringify(this.state.keys)
            );

        await send('Mod_FlagManager', 'setTokenFlag', [
            this.state.tokenId,
            'data',
            cid + '/index.json',
        ]);

        this.setState({
            success: true,
            loaded: true,
        });
    }

    render() {
        const data =
            controller.getPathSettings(this.state.token?.pathId || 0)?.data ||
            {};

        return (
            <Container className="p-0 w-75">
                {this.state.success && (
                    <Alert
                        variant="success"
                        className="text-center"
                        style={{ borderRadius: 0 }}
                    >
                        <p className="fs-2">😊</p>
                        Successfully edited your token data.
                    </Alert>
                )}
                {this.state.error && (
                    <Alert
                        variant="error"
                        className="text-center"
                        style={{ borderRadius: 0 }}
                    >
                        <p className="fs-2">😢</p>
                        {this.state.error?.message || this.state.error}
                    </Alert>
                )}
                <Card body>
                    <Card.Title>
                        <h1 className="mt-4 display-5 text-center">
                        🎛️ Ontoken Control Panel
                        </h1>
                    </Card.Title>
                    <Card.Body className="text-center">
                    <Alert variant="success">
                                    <p className="fs-4 text-center">
                                Here you can control the data that is stored on your token {this.state.token.name}. 
                            </p>
                        </Alert>
                       
                        <Row>
                            <Col className="d-grid">
                                <NavigationLink
                                    variant="info"
                                    languageAction={'Back'}
                                    size="lg"
                                    isButtonLink={true}
                                    location={'/view/' + this.state.tokenId}
                                />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
                <>
                    {this.state.loaded ? (
                        <>
                            {this.state.isValid ? (
                                <Row>
                                    <Col sm={12} md={6} lg={6} xl={6} xxl={6}>
                                        <Card body>
                                            <Row>
                                                <Col className="py-1 m-1" lg>
                                                    {Object.keys(data).map(
                                                        (category) => {
                                                            const val =
                                                                data[category];

                                                            return (
                                                                <>
                                                                    {Object.keys(
                                                                        val
                                                                    ).map(
                                                                        (
                                                                            dataKey
                                                                        ) => {
                                                                            const dataValue =
                                                                                this
                                                                                    .state
                                                                                    ?.keys[
                                                                                    dataKey
                                                                                ] ||
                                                                                data[
                                                                                    dataKey
                                                                                ];
                                                                            const description =
                                                                                keyDescriptions[
                                                                                    dataKey
                                                                                ] || {
                                                                                    name: dataKey,
                                                                                    description:
                                                                                        'Please enter a ' +
                                                                                        dataKey,
                                                                                    type: 'any',
                                                                                };

                                                                            const func =
                                                                                (
                                                                                    desc,
                                                                                    CustomElement = ListGroup.Item,
                                                                                    key
                                                                                ) => (
                                                                                    <CustomElement>
                                                                                        <Stack>
                                                                                            <div>
                                                                                                <p className="display-7 text-dark">
                                                                                                    {
                                                                                                        desc.name
                                                                                                    }
                                                                                                </p>
                                                                                                <Alert
                                                                                                    hidden={
                                                                                                        !desc.description
                                                                                                    }
                                                                                                    variant={
                                                                                                        desc.type ===
                                                                                                        'none'
                                                                                                            ? 'warning'
                                                                                                            : 'info'
                                                                                                    }
                                                                                                >
                                                                                                    {
                                                                                                        desc.description
                                                                                                    }
                                                                                                </Alert>
                                                                                            </div>

                                                                                            {desc.type !==
                                                                                                'none' &&
                                                                                            desc.type !==
                                                                                                'multiline' &&
                                                                                            desc.type !==
                                                                                                'select' ? (
                                                                                                <InputGroup className="mb-2">
                                                                                                    <Form.Control
                                                                                                        placeholder={
                                                                                                            key
                                                                                                        }
                                                                                                        aria-label={
                                                                                                            key
                                                                                                        }
                                                                                                        type={
                                                                                                            desc.type
                                                                                                        }
                                                                                                        value={
                                                                                                            this
                                                                                                                ?.state
                                                                                                                ?.keys?.[
                                                                                                                key
                                                                                                            ] ||
                                                                                                            dataValue
                                                                                                        }
                                                                                                        onChange={(
                                                                                                            e
                                                                                                        ) => {
                                                                                                            this.setState(
                                                                                                                {
                                                                                                                    keys: {
                                                                                                                        ...this
                                                                                                                            .state
                                                                                                                            .keys,
                                                                                                                        [key]: e
                                                                                                                            .target
                                                                                                                            .value,
                                                                                                                    },
                                                                                                                }
                                                                                                            );
                                                                                                        }}
                                                                                                        className="bg-primary text-white"
                                                                                                        aria-describedby="basic-addon1"
                                                                                                        {...desc.props}
                                                                                                    />
                                                                                                </InputGroup>
                                                                                            ) : (
                                                                                                <>
                                                                                                    {desc.type ===
                                                                                                    'select' ? (
                                                                                                        <>
                                                                                                            <select
                                                                                                                className="form-select bg-primary text-white"
                                                                                                             
                                                                                                                {...desc.props}
                                                                                                                onChange={(
                                                                                                                    e
                                                                                                                ) => {
                                                                                                                    this.setState(
                                                                                                                        {
                                                                                                                            keys: {
                                                                                                                                ...this
                                                                                                                                    .state
                                                                                                                                    .keys,
                                                                                                                                [key]: e
                                                                                                                                    .target
                                                                                                                                    .value,
                                                                                                                            },
                                                                                                                        }
                                                                                                                    );
                                                                                                                }}
                                                                                                            >
                                                                                                                {Object.keys(
                                                                                                                    desc.options ||
                                                                                                                        {}
                                                                                                                ).map(
                                                                                                                    (
                                                                                                                        optionKey
                                                                                                                    ) => {
                                                                                                                        if (
                                                                                                                            !desc
                                                                                                                                .options[
                                                                                                                                optionKey
                                                                                                                            ]
                                                                                                                        )
                                                                                                                            return (
                                                                                                                                <>

                                                                                                                                </>
                                                                                                                            );

                                                                                                                        return (
                                                                                                                            <option
                                                                                                                                value={
                                                                                                                                    optionKey
                                                                                                                                }
                                                                                                                            >
                                                                                                                                {
                                                                                                                                    desc
                                                                                                                                        .options[
                                                                                                                                        optionKey
                                                                                                                                    ]
                                                                                                                                }
                                                                                                                            </option>
                                                                                                                        );
                                                                                                                    }
                                                                                                                )}
                                                                                                            </select>
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            {desc.type ===
                                                                                                            'multiline' ? (
                                                                                                                <textarea
                                                                                                                    className="d-grid mb-2 w-100 bg-primary text-white"
                                                                                                                    rows={
                                                                                                                        4
                                                                                                                    }
                                                                                                                    value={
                                                                                                                        this
                                                                                                                            ?.state
                                                                                                                            ?.keys?.[
                                                                                                                            key
                                                                                                                        ] ||
                                                                                                                        dataValue
                                                                                                                    }
                                                                                                                    onChange={(
                                                                                                                        e
                                                                                                                    ) => {
                                                                                                                        this.setState(
                                                                                                                            {
                                                                                                                                keys: {
                                                                                                                                    ...this
                                                                                                                                        .state
                                                                                                                                        .keys,
                                                                                                                                    [key]: e
                                                                                                                                        .target
                                                                                                                                        .value,
                                                                                                                                },
                                                                                                                            }
                                                                                                                        );
                                                                                                                    }}
                                                                                                                    {...desc.props}
                                                                                                                ></textarea>
                                                                                                            ) : (
                                                                                                                <>

                                                                                                                </>
                                                                                                            )}
                                                                                                        </>
                                                                                                    )}
                                                                                                </>
                                                                                            )}
                                                                                        </Stack>
                                                                                    </CustomElement>
                                                                                );

                                                                            let res =
                                                                                (
                                                                                    <>
                                                                                        {func(
                                                                                            description,
                                                                                            Card.Body,
                                                                                            dataKey
                                                                                        )}
                                                                                    </>
                                                                                );

                                                                            if (
                                                                                description.children
                                                                            ) {
                                                                                return (
                                                                                    <ListGroup.Item className="m-0">
                                                                                        {func(
                                                                                            description,
                                                                                            Card.Body,
                                                                                            dataKey
                                                                                        )}
                                                                                        <Stack
                                                                                            direction={
                                                                                                description.dir
                                                                                                    ? description.dir
                                                                                                    : 'horizontal'
                                                                                            }
                                                                                        >
                                                                                            {Object.keys(
                                                                                                description.children
                                                                                            ).map(
                                                                                                (
                                                                                                    childKey
                                                                                                ) => {
                                                                                                    let child =
                                                                                                        description
                                                                                                            .children[
                                                                                                            childKey
                                                                                                        ];

                                                                                                    child.name =
                                                                                                        child.name ||
                                                                                                        childKey;

                                                                                                    return (
                                                                                                        <Col className="m-0">
                                                                                                            {func(
                                                                                                                child,
                                                                                                                Card.Body,
                                                                                                                dataKey +
                                                                                                                    '_' +
                                                                                                                    childKey
                                                                                                            )}
                                                                                                        </Col>
                                                                                                    );
                                                                                                }
                                                                                            )}
                                                                                        </Stack>
                                                                                    </ListGroup.Item>
                                                                                );
                                                                            }

                                                                            return res;
                                                                        }
                                                                    )}
                                                                </>
                                                            );
                                                        }
                                                    )}
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Col>
                                    <Col className="p-1">
                                        <Row>
                                            <Token
                                                theToken={this.state.token}
                                                stickers={this.state.stickers}
                                                textCutoff={64}
                                                maxWidth={true}
                                                settings={{
                                                    hideDescription: true,
                                                    useFresh: false,
                                                    static: true,
                                                    onlyBorder: false,
                                                    showEditButton:
                                                        this.state.token
                                                            .owner ===
                                                        controller.accounts[0],
                                                    enableThreeJS: false,
                                                    downsampleRate3D: 1,
                                                    cameraFOV: 69,
                                                cameraPositionZ: 90,
                                                cameraPositionX: 0,
                                                cameraPositionY: 180,
                                                    selectable3D: true,
                                                    disableFloor3D: true,
                                                    // ForceBackground: ModelBackground,
                                                    showHelpers3D: false,
                                                    lightIntensity3D: 100,
                                                    lightColour3D: 0xff_ff_ff,
                                                    ambientLightIntensity3D: 50,
                                                    ambientLightColour3D: 0xff_ff_ff,
                                                    rotationSpeed3D: 0.009,
                                                }}
                                            />
                                        </Row>
                                        <Card body>
                                            <Row>
                                                <Col className="d-grid gap-2">
                                                    <Button
                                                        variant="success"
                                                        onClick={() => {
                                                            this.setContentOnToken(
                                                                this.state.keys
                                                            ).catch((e) => {
                                                                this.setState({
                                                                    error: e,
                                                                });
                                                            });
                                                        }}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button variant="danger">
                                                        Reset
                                                    </Button>
                                                    <Form.Label
                                                        htmlFor="formFileLg"
                                                        class="form-label text-center mt-2 fs-4"
                                                    >
                                                        Upload new cover image
                                                    </Form.Label>
                                                    <Form.Control
                                                        onChange={
                                                            this.handleChange
                                                        }
                                                        class="form-control form-control-lg"
                                                        id="formFileLg"
                                                        type="file"
                                                    />
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Col>
                                </Row>
                            ) : (
                                <>
                                    {this.state.error !== undefined &&
                                        this.state.error !== null && (
                                            <Row className="mt-2">
                                                <Col>
                                                    <Alert
                                                        variant="danger"
                                                        className="text-center"
                                                    >
                                                        <p className="display-2">
                                                            😨
                                                        </p>
                                                        {this.state.error
                                                            ?.message ||
                                                            this.state.error}
                                                    </Alert>
                                                </Col>
                                            </Row>
                                        )}
                                </>
                            )}
                        </>
                    ) : (
                        <Loading />
                    )}
                </>
                <br />
                <br />
                <br />
            </Container>
        );
    }
}

export default ViewData;

ViewData.url = '/view/:tokenId/data';
ViewData.id = 'ViewData';
ViewData.settings = {};

PageController.registerPage(ViewData);
