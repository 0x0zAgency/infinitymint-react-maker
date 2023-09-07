import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Form,
    Button,
    Row,
    Col,
    Card,
    Alert,
    InputGroup,
} from 'react-bootstrap';

import { waitSetState, loadToken, loadStickers } from '../../helpers.js';

import Token from '../Token.js';
import FindTokenModal from '../../Modals/FindTokenModal.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';

import Edit from '../../Resources/edit.png';
class Preview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tokenId: 0,
            token: {},
            selectedPreview: false,
            showFindTokenModal: false,
            stickerValid: true,
            loading: true,
            stickers: [],
            stepStrength:
                storageController.getGlobalPreference('stickerStepStrength') ||
                10,
            propertiesForm: {
                x: 0,
                y: 0,
                scale: 0.5,
                origin: 'center',
                ...this.props.sticker?.properties,
            },
        };
    }

    async componentDidMount() {
        const token = storageController.getGlobalPreference('previewtoken');
        if (token !== undefined) {
            await waitSetState(this, {
                tokenId: token,
            });
        }

        await loadToken(this);

        if (this.state.isValid) await loadStickers(this);

        this.setState({
            selectedPreview: true,
            loading: false,
        });
    }

    /**
     * Sets a form value, forms used in this component are infoForm and svgForm
     * @param {string} form
     * @param {string|number} key
     * @param {any} value
     */
    async setFormValue(form, key, value) {
        await waitSetState(this, {
            [form]: {
                ...this.state[form],
                [key]: value,
            },
        });
    }

    async setFormValues(form, values) {
        let newObject = {
            ...this.state[form],
        };
        Object.keys(values).forEach(async (key) => {
            newObject[key] = values[key];
        });

        await waitSetState(this, {
            [form]: newObject,
        });
    }

    async onSubmit() {
        const object = {
            properties: {
                x: parseInt(this.state.propertiesForm.x),
                y: parseInt(this.state.propertiesForm.y),
                scale: this.state.propertiesForm.scale,
                top: this.state.propertiesForm.top,
                origin: this.state.propertiesForm.origin,
            },
        };

        // Set the values inside the sticker
        await this.props.setInSticker(object);
        // Save the sticker
        this.props.saveSticker(object);
        // Reprocess apperance (redraw) with changes
        await this.props.processApperance(object);
    }

    render() {
        return (
            <>
                <Row className="mt-4">
                    <Col>
                        <Card body>
                            <Row className="justify-content-center">
                                <Col className="pt-4">
                                    <p className="fs-2">
                                        {resources.$.UI.Action.Preview}
                                    </p>
                                    <hr />
                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="dark"
                                            onClick={() => {
                                                this.setState({
                                                    showFindTokenModal: true,
                                                });
                                            }}
                                        >
                                            {resources.$.UI.Action.FindToken}
                                        </Button>
                                        <Button
                                            variant="dark"
                                            onClick={() => {
                                                this.setState({
                                                    showCustomTokenModal: true,
                                                });
                                            }}
                                        >
                                            {resources.$.UI.Action.CustomToken}
                                        </Button>
                                    </div>
                                    {!this.state.stickerValid ? (
                                        <Alert
                                            variant="danger"
                                            className="text-center mt-4"
                                        >
                                            <p className="display-4">😀</p>
                                            <p>
                                                You need to set the apperance of
                                                your sticker if you would like
                                                to preview it!
                                            </p>
                                        </Alert>
                                    ) : (
                                        <></>
                                    )}
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Row className="justify-content-center mt-4">
                            {this.state.selectedPreview === false ? (
                                <Col>
                                    <Alert variant="warning">
                                        <p className="display-4">😀</p>
                                        <p>
                                            You need to select a token you would
                                            like to preview your sticker on!
                                        </p>
                                        <div className="d-grid mt-4">
                                            <Button
                                                variant="warning"
                                                onClick={async () => {
                                                    await waitSetState(this, {
                                                        tokenId: 0,
                                                    });
                                                    await loadToken(this);
                                                    await loadStickers(this);
                                                    storageController.setGlobalPreference(
                                                        'previewtoken',
                                                        0
                                                    );
                                                    this.setState({
                                                        selectedPreview: true,
                                                    });
                                                }}
                                            >
                                                Use The First Token
                                            </Button>
                                        </div>
                                    </Alert>
                                </Col>
                            ) : (
                                <Col>
                                    <Row className="justify-content-center">
                                        <Col
                                            lg={
                                                this.state.showPropertiesEditor
                                                    ? 8
                                                    : 6
                                            }
                                        >
                                            {this.state.stickerValid ? (
                                                <>
                                                    <Row>
                                                        <Col>
                                                            <Token
                                                                theToken={
                                                                    this.state
                                                                        .token
                                                                }
                                                                stickers={[
                                                                    ...this
                                                                        .state
                                                                        .stickers,
                                                                    {
                                                                        ...this
                                                                            .props
                                                                            .sticker,
                                                                    },
                                                                ]}
                                                                settings={{
                                                                    useFresh: true,
                                                                    static: true,
                                                                    hideAllBadges: true,
                                                                    editableStickers: true,
                                                                    hideDescription: true,
                                                                    logo: Edit,
                                                                    logoOpacity: 1.0,
                                                                    onStickerMouseUp:
                                                                        async (
                                                                            sticker,
                                                                            element,
                                                                            canvas
                                                                        ) => {
                                                                            //work out the percentage offset from the center from the element
                                                                            let x =
                                                                                (element.left -
                                                                                    canvas.width /
                                                                                        2) /
                                                                                canvas.width;
                                                                            let y =
                                                                                (element.top -
                                                                                    canvas.height /
                                                                                        2) /
                                                                                canvas.height;

                                                                            x =
                                                                                x *
                                                                                100;
                                                                            y =
                                                                                y *
                                                                                100;

                                                                            await this.setFormValues(
                                                                                'propertiesForm',
                                                                                {
                                                                                    x: x,
                                                                                    y: y,
                                                                                    scaleX: element.scaleX,
                                                                                    scaleY: element.scaleY,
                                                                                    scale: 0.5,
                                                                                    top: element.top,
                                                                                    origin: element.originX,
                                                                                }
                                                                            );

                                                                            await this.onSubmit();
                                                                        },
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Button
                                                                variant="danger"
                                                                onClick={async () => {
                                                                    await this.setFormValues(
                                                                        'propertiesForm',
                                                                        {
                                                                            x: 0,
                                                                            y: 0,
                                                                            scaleX: 0,
                                                                            scaleY: 0,
                                                                            scale: 0.5,
                                                                        }
                                                                    );
                                                                    await this.onSubmit();

                                                                    //reload window
                                                                    window.location.reload();
                                                                }}
                                                            >
                                                                Reset Sticker
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </>
                                            ) : (
                                                <Alert
                                                    variant="danger"
                                                    className="text-center"
                                                >
                                                    ⛔️ Invalid Sticker ⛔️
                                                </Alert>
                                            )}
                                        </Col>
                                        <Col
                                            hidden={
                                                !this.props.showPropertiesEditor
                                            }
                                        >
                                            <Card body>
                                                <p className="fs-5">
                                                    Display Properties
                                                </p>
                                                <hr />
                                                <Form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        this.onSubmit();
                                                    }}
                                                >
                                                    <Form.Group
                                                        className="mb-3"
                                                        controlId="formSVG"
                                                    >
                                                        <Form.Label>
                                                            Movement Step
                                                            Strength
                                                        </Form.Label>
                                                        <InputGroup className="mb-2">
                                                            <Form.Control
                                                                type="number"
                                                                value={
                                                                    this.state
                                                                        .stepStrength
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    storageController.setGlobalPreference(
                                                                        'stickerStepStrength',
                                                                        Math.max(
                                                                            1,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    );
                                                                    this.setState(
                                                                        {
                                                                            stepStrength:
                                                                                Math.max(
                                                                                    1,
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                ),
                                                                        }
                                                                    );
                                                                }}
                                                            />
                                                            <Button
                                                                variant="outline-primary"
                                                                disabled={
                                                                    this.state
                                                                        .stepStrength ===
                                                                    1
                                                                }
                                                                onClick={() => {
                                                                    storageController.setGlobalPreference(
                                                                        'stickerStepStrength',
                                                                        1
                                                                    );
                                                                    this.setState(
                                                                        {
                                                                            stepStrength: 1,
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                1+
                                                            </Button>
                                                            <Button
                                                                variant="outline-primary"
                                                                disabled={
                                                                    this.state
                                                                        .stepStrength ===
                                                                    5
                                                                }
                                                                onClick={() => {
                                                                    storageController.setGlobalPreference(
                                                                        'stickerStepStrength',
                                                                        5
                                                                    );
                                                                    this.setState(
                                                                        {
                                                                            stepStrength: 5,
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                5+
                                                            </Button>
                                                            <Button
                                                                variant="outline-primary"
                                                                disabled={
                                                                    this.state
                                                                        .stepStrength ===
                                                                    10
                                                                }
                                                                onClick={() => {
                                                                    storageController.setGlobalPreference(
                                                                        'stickerStepStrength',
                                                                        10
                                                                    );
                                                                    this.setState(
                                                                        {
                                                                            stepStrength: 10,
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                10+
                                                            </Button>
                                                            <Button
                                                                variant="outline-primary"
                                                                disabled={
                                                                    this.state
                                                                        .stepStrength ===
                                                                    25
                                                                }
                                                                onClick={() => {
                                                                    storageController.setGlobalPreference(
                                                                        'stickerStepStrength',
                                                                        25
                                                                    );
                                                                    this.setState(
                                                                        {
                                                                            stepStrength: 25,
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                25+
                                                            </Button>
                                                            <Button
                                                                variant="outline-primary"
                                                                disabled={
                                                                    this.state
                                                                        .stepStrength ===
                                                                    50
                                                                }
                                                                onClick={() => {
                                                                    storageController.setGlobalPreference(
                                                                        'stickerStepStrength',
                                                                        50
                                                                    );
                                                                    this.setState(
                                                                        {
                                                                            stepStrength: 50,
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                50+
                                                            </Button>
                                                            <Button
                                                                variant="outline-primary"
                                                                disabled={
                                                                    this.state
                                                                        .stepStrength ===
                                                                    100
                                                                }
                                                                onClick={() => {
                                                                    storageController.setGlobalPreference(
                                                                        'stickerStepStrength',
                                                                        100
                                                                    );
                                                                    this.setState(
                                                                        {
                                                                            stepStrength: 100,
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                100+
                                                            </Button>
                                                        </InputGroup>
                                                        <Form.Label>
                                                            X
                                                        </Form.Label>
                                                        <InputGroup>
                                                            <Form.Control
                                                                type="number"
                                                                value={
                                                                    this.state
                                                                        .propertiesForm
                                                                        .x
                                                                }
                                                                step={
                                                                    this.state
                                                                        .stepStrength
                                                                }
                                                                onChange={async (
                                                                    e
                                                                ) => {
                                                                    await this.setFormValue(
                                                                        'propertiesForm',
                                                                        'x',
                                                                        e.target
                                                                            .value ||
                                                                            ''
                                                                    );

                                                                    await this.onSubmit();
                                                                }}
                                                            />
                                                            <Button
                                                                variant="outline-primary"
                                                                onClick={async () => {
                                                                    await this.setFormValue(
                                                                        'propertiesForm',
                                                                        'x',
                                                                        Number.parseInt(
                                                                            this
                                                                                .state
                                                                                .propertiesForm
                                                                                .x
                                                                        ) -
                                                                            Number.parseInt(
                                                                                this
                                                                                    .state
                                                                                    .stepStrength
                                                                            )
                                                                    );

                                                                    await this.onSubmit();
                                                                }}
                                                            >
                                                                Left
                                                            </Button>
                                                            <Button
                                                                variant="outline-primary"
                                                                onClick={async () => {
                                                                    await this.setFormValue(
                                                                        'propertiesForm',
                                                                        'x',
                                                                        Number.parseInt(
                                                                            this
                                                                                .state
                                                                                .propertiesForm
                                                                                .x
                                                                        ) +
                                                                            Number.parseInt(
                                                                                this
                                                                                    .state
                                                                                    .stepStrength
                                                                            )
                                                                    );
                                                                    await this.onSubmit();
                                                                }}
                                                            >
                                                                Right
                                                            </Button>
                                                        </InputGroup>
                                                        <Form.Label>
                                                            Y
                                                        </Form.Label>
                                                        <InputGroup className="mb-3">
                                                            <Form.Control
                                                                type="number"
                                                                value={
                                                                    this.state
                                                                        .propertiesForm
                                                                        .y
                                                                }
                                                                step={
                                                                    this.state
                                                                        .stepStrength
                                                                }
                                                                onChange={async (
                                                                    e
                                                                ) => {
                                                                    await this.setFormValue(
                                                                        'propertiesForm',
                                                                        'y',
                                                                        e.target
                                                                            .value ||
                                                                            ''
                                                                    );

                                                                    await this.onSubmit();
                                                                }}
                                                            />
                                                            <Button
                                                                variant="outline-primary"
                                                                onClick={async () => {
                                                                    await this.setFormValue(
                                                                        'propertiesForm',
                                                                        'y',
                                                                        Number.parseInt(
                                                                            this
                                                                                .state
                                                                                .propertiesForm
                                                                                .y
                                                                        ) -
                                                                            Number.parseInt(
                                                                                this
                                                                                    .state
                                                                                    .stepStrength
                                                                            )
                                                                    );

                                                                    await this.onSubmit();
                                                                }}
                                                            >
                                                                Up
                                                            </Button>
                                                            <Button
                                                                variant="outline-primary"
                                                                onClick={async () => {
                                                                    await this.setFormValue(
                                                                        'propertiesForm',
                                                                        'y',
                                                                        Number.parseInt(
                                                                            this
                                                                                .state
                                                                                .propertiesForm
                                                                                .y
                                                                        ) +
                                                                            Number.parseInt(
                                                                                this
                                                                                    .state
                                                                                    .stepStrength
                                                                            )
                                                                    );

                                                                    await this.onSubmit();
                                                                }}
                                                            >
                                                                Down
                                                            </Button>
                                                        </InputGroup>
                                                        <Form.Label>
                                                            Shrink (
                                                            {
                                                                this.state
                                                                    .propertiesForm
                                                                    .scale
                                                            }
                                                            )
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="range"
                                                            className="mb-2 form-range border-0"
                                                            value={Number.parseFloat(
                                                                this.state
                                                                    .propertiesForm
                                                                    .scale
                                                            )}
                                                            max={1}
                                                            min={0.1}
                                                            step={0.1}
                                                            onChange={(e) => {
                                                                this.setFormValue(
                                                                    'propertiesForm',
                                                                    'scale',
                                                                    Number.parseFloat(
                                                                        e.target
                                                                            .value ||
                                                                            ''
                                                                    ).toFixed(3)
                                                                );
                                                            }}
                                                        />
                                                        <Form.Label>
                                                            Z-Position
                                                        </Form.Label>
                                                        <Row className="mb-2">
                                                            <Col>
                                                                <Button
                                                                    variant={
                                                                        this
                                                                            .state
                                                                            .propertiesForm
                                                                            .top !==
                                                                        true
                                                                            ? 'success'
                                                                            : 'danger'
                                                                    }
                                                                    className="w-100"
                                                                    onClick={() => {
                                                                        this.setFormValue(
                                                                            'propertiesForm',
                                                                            'top',
                                                                            false
                                                                        );
                                                                    }}
                                                                >
                                                                    Behind Token
                                                                </Button>
                                                            </Col>
                                                            <Col>
                                                                <Button
                                                                    variant={
                                                                        this
                                                                            .state
                                                                            .propertiesForm
                                                                            .top ===
                                                                        true
                                                                            ? 'success'
                                                                            : 'danger'
                                                                    }
                                                                    className="w-100"
                                                                    onClick={() => {
                                                                        this.setFormValue(
                                                                            'propertiesForm',
                                                                            'top',
                                                                            true
                                                                        );
                                                                    }}
                                                                >
                                                                    Above Token
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                        <Form.Label>
                                                            Transform Origin
                                                        </Form.Label>
                                                        <Row>
                                                            <Col>
                                                                <Button
                                                                    size="sm"
                                                                    variant={
                                                                        this
                                                                            .state
                                                                            .propertiesForm
                                                                            .origin ===
                                                                        'center'
                                                                            ? 'success'
                                                                            : 'danger'
                                                                    }
                                                                    className="w-100"
                                                                    onClick={() => {
                                                                        this.setFormValue(
                                                                            'propertiesForm',
                                                                            'origin',
                                                                            'center'
                                                                        );
                                                                    }}
                                                                >
                                                                    Middle
                                                                    Center
                                                                </Button>
                                                            </Col>
                                                            <Col>
                                                                <Button
                                                                    size="sm"
                                                                    variant={
                                                                        this
                                                                            .state
                                                                            .propertiesForm
                                                                            .origin ===
                                                                        'top_left'
                                                                            ? 'success'
                                                                            : 'danger'
                                                                    }
                                                                    className="w-100"
                                                                    onClick={() => {
                                                                        this.setFormValue(
                                                                            'propertiesForm',
                                                                            'origin',
                                                                            'top_left'
                                                                        );
                                                                    }}
                                                                >
                                                                    Top Most
                                                                    Left
                                                                </Button>
                                                            </Col>
                                                            <Col>
                                                                <Button
                                                                    size="sm"
                                                                    variant={
                                                                        this
                                                                            .state
                                                                            .propertiesForm
                                                                            .origin ===
                                                                        'bottom_right'
                                                                            ? 'success'
                                                                            : 'danger'
                                                                    }
                                                                    className="w-100"
                                                                    onClick={() => {
                                                                        this.setFormValue(
                                                                            'propertiesForm',
                                                                            'origin',
                                                                            'bottom_right'
                                                                        );
                                                                    }}
                                                                >
                                                                    Bottom Right
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                    </Form.Group>
                                                    <div className="d-grid mt-2 gap-2">
                                                        <Button
                                                            variant="primary"
                                                            type="submit"
                                                            onClick={() => {
                                                                this.onSubmit();
                                                            }}
                                                        >
                                                            {
                                                                resources.$.UI
                                                                    .Action.Save
                                                            }
                                                        </Button>
                                                    </div>
                                                </Form>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Col>
                            )}
                        </Row>
                    </Col>
                </Row>
                <FindTokenModal
                    show={this.state.showFindTokenModal}
                    onHide={() => {
                        this.setState({
                            showFindTokenModal: false,
                        });
                    }}
                    onSelected={async (token) => {
                        await waitSetState(this, {
                            tokenId: token.tokenId,
                            stickerValid: false,
                        });
                        await loadToken(this);

                        if (this.state.isValid) await loadStickers(this);
                        storageController.setGlobalPreference(
                            'previewtoken',
                            token.tokenId
                        );
                        this.setState({
                            selectedPreview: true,
                            showFindTokenModal: false,
                        });
                        this.checkSticker();
                    }}
                />
            </>
        );
    }
}

Preview.propTypes = {
    isValid: PropTypes.bool,
    validApperance: PropTypes.bool,
    sticker: PropTypes.object,
    assets: PropTypes.object,
    saveSticker: PropTypes.func,
    setInSticker: PropTypes.func,
    setSection: PropTypes.func,
    setError: PropTypes.func,
    processApperance: PropTypes.func,
    calculateStorageUsage: PropTypes.func,
};

export default Preview;
