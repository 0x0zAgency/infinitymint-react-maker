import React, { Component } from 'react';
import { Modal, Form, Button, Col, Row, Alert, Badge } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import Config from '../config.js';
import { FormLabelHelpStyle } from '../Resources/styles.js';
import { delay } from '../helpers.js';

class CreateStickerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            environment: null,
            loading: false,
            error: null,
        };
    }

    setFormValue(e, key) {
        this.setState({
            [key]: e.target?.value || '',
        });
    }

    toggleLoading() {
        this.setState({
            loading: !this.state.loading,
        });
    }

    setError(error) {
        this.setState({
            error: error[0]?.message || error.message,
            errorTimeout: Date.now() + Config.settings.errorTimeout,
        });
    }

    async onSubmit(e) {
        if (this.state.environment === undefined) {
            throw new Error('Please select an environment');
        }

        if (
            Config.settings.environments[this.state.environment] === undefined
        ) {
            throw new Error('Invalid environment');
        }

        if (Config.settings.environments[this.state.environment].disabled) {
            throw new Error('environment is disabled');
        }

        if (!isNaN(this.state.name)) {
            throw new TypeError('Name is invalid');
        }

        if (isNaN(this.state.environment)) {
            throw new TypeError('Env is invalid');
        }

        const sticker = {
            name: encodeURI(this.state.name),
            id: uuidv4(),
            owner: controller.accounts[0],
            environment: Number.parseInt(this.state.environment),
            created: Date.now(),
            final: {},
            paths: '',
            properties: {
                x: 0,
                y: 0,
                scale: 0.5,
            },
            state: 0, // 0 == unfinalized, 1 == finalized
        };

        storageController.values.stickers[sticker.id] = sticker;
        storageController.saveData();

        this.setState({
            success: true,
        });

        await delay(1).then(this.props.onHide);
    }

    render() {
        return (
            <Modal
                show={this.props.show}
                onHide={() => {
                    if (
                        !this.state.loading &&
                        this.props.onHide !== undefined
                    ) {
                        this.props.onHide();
                    }
                }}
            >
                <Modal.Body>
                    <Form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            this.toggleLoading();
                            this.onSubmit(e)
                                .catch((error) => {
                                    this.setState({
                                        error,
                                    });
                                })
                                .finally(() => {
                                    this.toggleLoading();
                                });
                        }}
                    >
                        {this.state.error !== null &&
                        this.state.errorTimeout > Date.now() ? (
                            <Alert variant="danger">
                                {this.state.error.message || this.state.error}
                            </Alert>
                        ) : (
                            <></>
                        )}
                        {this.state.success ? (
                            <Alert variant="success">
                                Success! Please wait while we save...
                            </Alert>
                        ) : (
                            <></>
                        )}
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label className="fs-5">Name</Form.Label>
                            <Form.Control
                                type="text"
                                size="sm"
                                onChange={(e) => this.setFormValue(e, 'name')}
                                value={this.state.name}
                                placeholder={'My Sticker'}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="url">
                            <Form.Label className="fs-5">Owner</Form.Label>
                            <Form.Control
                                type="url"
                                size="sm"
                                readOnly
                                value={controller.accounts[0]}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="url">
                            <Form.Label className="fs-5">
                                Target Environment
                            </Form.Label>
                            <Form.Select
                                size="sm"
                                onChange={(e) =>
                                    this.setFormValue(e, 'environment')
                                }
                            >
                                <option value="null"></option>
                                {Config.settings.environments.map(
                                    (value, index) => (
                                        <option
                                            key={index}
                                            value={index}
                                            disabled={value.disabled}
                                        >
                                            {value.name}
                                            {' ['}
                                            {value.type}
                                            {']'}
                                        </option>
                                    )
                                )}
                            </Form.Select>
                            <Form.Label style={FormLabelHelpStyle}>
                                This refers to where your sticker should appear
                                in the Metaverse. Please be aware that depending
                                on the environment you select there could be
                                image/audio/3d restrictions and/or requirements
                                for the sticker to meet.
                            </Form.Label>
                        </Form.Group>
                        <div className="d-grid">
                            <Button
                                variant="dark"
                                type="submit"
                                disabled={this.state.loading}
                            >
                                Create
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        );
    }
}

// Types
CreateStickerModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
};

export default CreateStickerModal;
