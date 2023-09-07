import React, { Component } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

import resources from 'infinitymint-client/dist/src/classic/resources.js';

export default function Image({
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
                <Row>
                    <Col>
                        <Form.Group className="mt-2 text-center">
                            <Form.Label className="fs-3">
                                📁 Upload an Image
                            </Form.Label>
                            <Form.Control
                                size="md"
                                type="file"
                                className="m-2"
                                accept="image/png, image/jpeg, image/gif"
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

                                    fileReader.readAsDataURL(
                                        event.target.files[0]
                                    );
                                }}
                            />
                        </Form.Group>
                    </Col>
                    {children}
                </Row>
            </Form>
        </>
    );
}
