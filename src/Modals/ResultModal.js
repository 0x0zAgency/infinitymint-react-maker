import React, { Component } from 'react';
import { Modal, Form, Button, Col, Row, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import validator from 'validator';
import { delay } from '../helpers.js';

class ResultModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            invalid: false,
            success: false,
        };

        this.willUnmount = false;
    }

    async componentDidMount() {
        this.willUnmount = false;
    }

    async componentWillUnmount() {
        this.willUnmount = true;
    }

    render() {
        const render =
            this.props.result !== undefined &&
            typeof this.props.result === 'object'
                ? JSON.stringify(this.props.result)
                : this.props?.result?.search(
                      'data:application/json;base64,'
                  ) === 0
                ? atob(this.props.result.split(',')[1])
                : this.props.result;
        return (
            <Modal
                show={this.props.show}
                onHide={() => {
                    if (this.props.keepOpen !== true) {
                        this.props.onHide();
                    }
                }}
                size="lg"
            >
                <Modal.Body>
                    {this.state.invalid ? (
                        <Alert variant="danger">Json is invalid</Alert>
                    ) : (
                        ''
                    )}
                    {this.state.success ? (
                        <Alert variant="success">Json is valid</Alert>
                    ) : (
                        ''
                    )}
                    <p className="fs-2 text-center">
                        {this.props.title || 'Your Result'}
                    </p>
                    {this.props.hideResult !== true ? (
                        <>
                            {this.props.draw === undefined ? (
                                <div className="d-grid mt-2 ">
                                    <textarea rows={12} readOnly={true}>
                                        {render}
                                    </textarea>
                                </div>
                            ) : React.isValidElement(
                                  this.props.draw(render, this.props.result)
                              ) ? (
                                this.props.draw(render, this.props.result)
                            ) : (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: this.props.draw(
                                            render,
                                            this.props.result
                                        ),
                                    }}
                                ></div>
                            )}
                        </>
                    ) : (
                        <></>
                    )}

                    <div className="d-grid mt-2 gap-2">
                        <Button
                            hidden={typeof this.props.result !== 'object'}
                            variant="success"
                            onClick={async () => {
                                if (validator.isJSON(render)) {
                                    this.setState({
                                        success: true,
                                    });
                                } else {
                                    this.setState({
                                        invalid: true,
                                    });
                                }

                                delay(2).then(() => {
                                    if (!this.willUnmount) {
                                        this.setState({
                                            success: false,
                                            invalid: false,
                                        });
                                    }
                                });
                            }}
                        >
                            Validate JSON
                        </Button>
                        {this.props.onClick !== undefined ? (
                            <>
                                <Button
                                    variant="success"
                                    onClick={this.props.onClick}
                                >
                                    Submit
                                </Button>
                            </>
                        ) : (
                            <></>
                        )}
                        <Button variant="danger" onClick={this.props.onHide}>
                            Close
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}

// Types
ResultModal.propTypes = {
    show: PropTypes.bool,
    keepOpen: PropTypes.bool,
    hideResult: PropTypes.bool,
    onHide: PropTypes.func,
    draw: PropTypes.func,
    result: PropTypes.object,
};

export default ResultModal;
