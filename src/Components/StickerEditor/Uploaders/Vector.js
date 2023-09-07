import React, { Component } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import resources from 'infinitymint-client/dist/src/classic/resources.js';

export default function Vector({
    sticker,
    onSubmit,
    onChange,
    defaultText,
    showSaveButton = true,
    children,
}) {
    return (
        <>
            <Form onSubmit={onSubmit}>
                <Row className="gy-2">
                    <Col lg={children ? 8 : 12}>
                        <Form.Group className="mb-2">
                            <Form.Label>📁 Paste SVG Code</Form.Label>
                            <textarea
                                className="form-control bg-light text-dark"
                                rows={20}
                                value={defaultText}
                                type="text"
                                style={{
                                    resize: 'none',
                                }}
                                placeholder="<svg>...</svg>"
                                onChange={onChange}
                            />
                        </Form.Group>
                        <div className="d-grid mt-3 gap-2">
                            <Button
                                variant="primary"
                                type="submit"
                                hidden={!showSaveButton}
                            >
                                {resources.$.UI.Action.Save}
                            </Button>
                        </div>
                    </Col>
                    {children}
                </Row>
                <Row>
                    <Col>
                        <Form.Group
                            className="mt-2 text-center"
                            controlId="formSVGFile"
                        >
                            <Form.Label className="fs-3">
                                📁 Upload an Vector
                            </Form.Label>
                            <Form.Control
                                size="md"
                                type="file"
                                className="m-2"
                                accept="image/svg+xml"
                                onChange={(event) => {
                                    const fileReader = new FileReader();
                                    fileReader.addEventListener('load', () => {
                                        onChange({
                                            target: {
                                                value: fileReader.result,
                                            },
                                        });
                                        onSubmit({
                                            preventDefault: () => {},
                                        });
                                    });

                                    fileReader.readAsText(
                                        event.target.files[0]
                                    );
                                }}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </>
    );
}
