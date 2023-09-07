import React, { useRef } from 'react';
import {
    Modal,
    Form,
    Col,
    Row,
    Button,
    ListGroup,
    Card,
    Alert,
} from 'react-bootstrap';
import PropTypes from 'prop-types';

const variants = {
    name: 'success',
};

function GemInfoModal({
    show,
    onHide,
    mod = {
        manifest: {},
    },
}) {
    return (
        <Modal show={show} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>{mod.name || 'Unknown'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col>
                        <Row className="p-1">
                            <Col>
                                <ListGroup>
                                    {Object.entries(mod?.manifest || {}).map(
                                        ([key, mod], index) => (
                                            <ListGroup.Item
                                                key={index}
                                                variant={
                                                    variants[key] || 'secondary'
                                                }
                                            >
                                                <p>
                                                    <span className="badge bg-dark">
                                                        {key}
                                                    </span>
                                                </p>

                                                <p
                                                    className="fs-6 text-black"
                                                    style={{
                                                        fontWeight:
                                                            key === 'name'
                                                                ? 'bold'
                                                                : 'normal',
                                                    }}
                                                >
                                                    {typeof mod !== 'object'
                                                        ? mod.toString() ||
                                                          'no ' +
                                                              key +
                                                              ' provided...'
                                                        : JSON.stringify(mod)}
                                                </p>
                                            </ListGroup.Item>
                                        )
                                    )}
                                </ListGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Card>
                                    <Card.Header>
                                        <span className="badge bg-light">
                                            version{' '}
                                            {mod?.manifest?.version || '?.?'}
                                        </span>{' '}
                                        {mod.enabled ? (
                                            <span className="badge bg-success">
                                                enabled
                                            </span>
                                        ) : (
                                            <span className="badge bg-danger">
                                                disabled
                                            </span>
                                        )}
                                    </Card.Header>
                                    <Card.Body>
                                        <Row className="gap-2">
                                            <Col>
                                                <Row>
                                                    <Col>
                                                        <p className="fs-4 mb-2">
                                                            Deployed Contracts{' '}
                                                            <style className="badge bg-dark fs-6">
                                                                {
                                                                    (
                                                                        mod?.receipts ||
                                                                        []
                                                                    ).length
                                                                }
                                                            </style>
                                                        </p>
                                                        <ListGroup>
                                                            {(
                                                                mod?.receipts ||
                                                                []
                                                            ).map(
                                                                (
                                                                    receipt,
                                                                    _i
                                                                ) => {
                                                                    return (
                                                                        <ListGroup.Item
                                                                            key={
                                                                                _i
                                                                            }
                                                                            className="text-center"
                                                                        >
                                                                            {
                                                                                receipt.contractName
                                                                            }{' '}
                                                                            <span className=" badge bg-dark d-sm-none d-md-none d-lg-block d-none">
                                                                                {
                                                                                    receipt.address
                                                                                }
                                                                            </span>
                                                                        </ListGroup.Item>
                                                                    );
                                                                }
                                                            )}
                                                        </ListGroup>
                                                    </Col>
                                                </Row>
                                                <Row className="mt-2">
                                                    <Col>
                                                        <p className="fs-4 mb-2">
                                                            Pages{' '}
                                                            <style className="badge bg-dark fs-6">
                                                                {
                                                                    (
                                                                        mod.pages ||
                                                                        []
                                                                    ).length
                                                                }
                                                            </style>
                                                        </p>
                                                        <ListGroup>
                                                            {(
                                                                mod.pages || []
                                                            ).map(
                                                                (page, _i) => {
                                                                    if (
                                                                        !page ||
                                                                        page ===
                                                                            null
                                                                    )
                                                                        return (
                                                                            <>

                                                                            </>
                                                                        );

                                                                    return (
                                                                        <ListGroup.Item
                                                                            key={
                                                                                _i
                                                                            }
                                                                            className="text-center"
                                                                        >
                                                                            {
                                                                                page?.name
                                                                            }
                                                                            <span className="badge bg-dark ms-2 d-sm-none d-md-none d-lg-block d-none">
                                                                                ./Deployments/mods/
                                                                                {
                                                                                    page?.src
                                                                                }
                                                                                .js
                                                                            </span>
                                                                            <a
                                                                                className="text-info mx-1 small"
                                                                                href={
                                                                                    page.url !==
                                                                                    undefined
                                                                                        ? page?.url?.replace(
                                                                                              ':tokenId',
                                                                                              0
                                                                                          )
                                                                                        : ''
                                                                                }
                                                                                hidden={
                                                                                    page?.url ===
                                                                                        undefined ||
                                                                                    page
                                                                                        ?.url
                                                                                        ?.length ===
                                                                                        0
                                                                                }
                                                                            >
                                                                                visit
                                                                            </a>
                                                                        </ListGroup.Item>
                                                                    );
                                                                }
                                                            )}
                                                        </ListGroup>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <div className="d-grid mt-2">
                            <Button
                                variant="danger"
                                onClick={() => {
                                    onHide();
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
}

GemInfoModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
};

export default GemInfoModal;
