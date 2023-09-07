import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Card, Form, Badge } from 'react-bootstrap';
import { tryDecodeURI, isEmpty } from '../../helpers.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import Config from '../../config.js';

class Metadata extends Component {
    constructor(props) {
        super(props);

        this.state = {
            infoForm: this.getInfoFormValues(),
            metadata: this.props?.sticker.metadata || {},
            hasChanges: false,
        };
    }

    /**
     * Saves descriptive information inside of the sticker.
     */
    onInformationSubmit() {
        const object = {
            name: this.state.infoForm.name,
            description: this.state.infoForm.description,
            twitter: this.state.infoForm.twitter,
            url: this.state.infoForm.url,
            metadata: {
                ...this.state.metadata,
                description: encodeURI(this.state.metadata?.description || ''),
            },
        };

        if (isEmpty(object.name)) {
            throw new Error('name cannot be empty');
        }

        this.props.setInSticker(object).then(() => {
            // If you are waiting you shouldn't need to pass the obj and can just save the sticker
            this.props.saveSticker();
            // Calculate new blob sizes
            this.props.calculateStorageUsage();
            this.setState({
                hasChanges: false,
            });
        });
    }

    getInfoFormValues() {
        return {
            name: this.props?.sticker?.name || '',
            description: this.props?.sticker?.description || '',
            twitter: this.props?.sticker?.twitter || '',
            url: this.props?.sticker?.url || '',
        };
    }

    /**
     * Sets a form value, forms used in this component are infoForm and svgForm
     * @param {string} form
     * @param {string|number} key
     * @param {any} value
     */
    setFormValue(form, key, value) {
        this.setState({
            [form]: {
                ...this.state[form],
                [key]: value,
            },
        });
    }

    render() {
        return (
            <>
                <Row className="mt-4">
                    <Col>
                        <Card bg='black'> 
                            <Card.Header>{resources.$.UI.Action.EditMetadata}</Card.Header>
                                    <Row className='p-4 d-inline-flex flex-direction-row gap-2'>
                                        <Col>
                                            <p className="fs-3">
                                                Basic Information
                                            </p>
                                            <Form>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        Name
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={tryDecodeURI(
                                                            this.state.infoForm
                                                                .name
                                                        )}
                                                        onChange={(e) => {
                                                            this.setFormValue(
                                                                'infoForm',
                                                                'name',
                                                                e.target
                                                                    .value || ''
                                                            );
                                                            this.setState({
                                                                hasChanges: true,
                                                            });
                                                        }}
                                                    />
                                                </Form.Group>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        Website
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="url"
                                                        value={
                                                            this.state.infoForm
                                                                .url
                                                        }
                                                        onChange={(e) => {
                                                            this.setFormValue(
                                                                'infoForm',
                                                                'url',
                                                                e.target
                                                                    .value || ''
                                                            );
                                                            this.setState({
                                                                hasChanges: true,
                                                            });
                                                        }}
                                                    />
                                                </Form.Group>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        Environment
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        disabled
                                                        className="border-dark"
                                                        value={
                                                            Config.settings
                                                                .environments[
                                                                this.props
                                                                    .sticker
                                                                    .environment
                                                            ].name
                                                        }
                                                    />
                                                </Form.Group>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        GUID
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        disabled
                                                        className="border-dark"
                                                        value={
                                                            this.props.sticker
                                                                .id
                                                        }
                                                    />
                                                </Form.Group>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        Chain
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        disabled
                                                        className="border-dark"
                                                        value={
                                                            Config.getNetwork()
                                                                .name
                                                        }
                                                    />
                                                </Form.Group>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        Type
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        disabled
                                                        className="border-dark"
                                                        value="vector"
                                                    />
                                                </Form.Group>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        Creator
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        disabled
                                                        className="border-dark"
                                                        value={
                                                            this.props.sticker
                                                                .owner
                                                        }
                                                    />
                                                </Form.Group>
                                            </Form>
                                        </Col>
                                        <Col>
                                            <p className="fs-3">
                                                Monetery Requirements
                                            </p>
                                            <Form>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        Max Spend{' '}
                                                        <span className="badge bg-dark">
                                                            I will not spend
                                                            more than this to
                                                            put my sticker up
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        step={0.1}
                                                        value={
                                                            this.state.metadata
                                                                ?.maxSpend || 0
                                                        }
                                                        onChange={(e) => {
                                                            this.setFormValue(
                                                                'metadata',
                                                                'maxSpend',
                                                                e.target
                                                                    .value || ''
                                                            );
                                                            this.setState({
                                                                hasChanges: true,
                                                            });
                                                        }}
                                                    />
                                                </Form.Group>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        Min Spend{' '}
                                                        <span className="badge bg-dark">
                                                            I will not spend
                                                            less than this to
                                                            put my sticker up
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        value={
                                                            this.state.metadata
                                                                ?.minSpend || 0
                                                        }
                                                        step={0.1}
                                                        onChange={(e) => {
                                                            this.setFormValue(
                                                                'metadata',
                                                                'minSpend',
                                                                e.target
                                                                    .value || ''
                                                            );
                                                            this.setState({
                                                                hasChanges: true,
                                                            });
                                                        }}
                                                    />
                                                </Form.Group>
                                                <p className="fs-3 mb-2">
                                                    Advanced Information
                                                </p>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        Description
                                                    </Form.Label>
                                                    <textarea
                                                        className="form-control bg-light text-dark"
                                                        rows={6}
                                                        value={tryDecodeURI(
                                                            this.state.metadata
                                                                ?.description ||
                                                                ''
                                                        )}
                                                        type="text"
                                                        placeholder="This sticker is..."
                                                        onChange={(e) => {
                                                            this.setFormValue(
                                                                'metadata',
                                                                'description',
                                                                e.target
                                                                    .value || ''
                                                            );

                                                            this.setState({
                                                                hasChanges: true,
                                                            });
                                                        }}
                                                    />
                                                </Form.Group>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        Brand Website{' '}
                                                        <span className="badge bg-info">
                                                            Will direct the user
                                                            there if clicked on
                                                            (uses your stickers
                                                            URL by default).
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        className="border-dark"
                                                        value={
                                                            this.state.metadata
                                                                .brandURL ||
                                                            this.state.infoForm
                                                                .url ||
                                                            ''
                                                        }
                                                        onChange={(e) => {
                                                            this.setFormValue(
                                                                'metadata',
                                                                'brandURL',
                                                                e.target
                                                                    .value || ''
                                                            );

                                                            this.setState({
                                                                hasChanges: true,
                                                            });
                                                        }}
                                                    />
                                                </Form.Group>
                                                <Form.Group
                                                    className="mb-3"
                                                    controlId="formSVG"
                                                >
                                                    <Form.Label>
                                                        Brand Colour{' '}
                                                        <span
                                                            className="badge"
                                                            style={{
                                                                backgroundColor:
                                                                    '#' +
                                                                    this.state
                                                                        .metadata
                                                                        ?.colour,
                                                            }}
                                                        >
                                                            #
                                                            {
                                                                this.state
                                                                    .metadata
                                                                    ?.colour
                                                            }
                                                        </span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        className="border-dark"
                                                        value={
                                                            '#' +
                                                            (this.state.metadata
                                                                .colour || '')
                                                        }
                                                        maxLength={7}
                                                        onChange={(e) => {
                                                            this.setFormValue(
                                                                'metadata',
                                                                'colour',
                                                                (
                                                                    e.target
                                                                        .value ||
                                                                    ''
                                                                ).replace(
                                                                    /#/g,
                                                                    ''
                                                                )
                                                            );

                                                            this.setState({
                                                                hasChanges: true,
                                                            });
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Form>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <div className="d-grid mt-2 gap-2">
                                                <Button
                                                    variant="primary"
                                                    type="submit"
                                                    hidden={
                                                        !this.state.hasChanges
                                                    }
                                                    onClick={(e) => {
                                                        this.onInformationSubmit();
                                                    }}
                                                >
                                                    {resources.$.UI.Action.Save}
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                        </Card>
                    </Col>
                </Row>
            </>
        );
    }
}

Metadata.propTypes = {
    isValid: PropTypes.bool,
    validApperance: PropTypes.bool,
    sticker: PropTypes.object,
    assets: PropTypes.object,
    saveSticker: PropTypes.func,
    setInSticker: PropTypes.func,
    setError: PropTypes.func,
    setSection: PropTypes.func,
    processApperance: PropTypes.func,
    calculateStorageUsage: PropTypes.func,
};

export default Metadata;
