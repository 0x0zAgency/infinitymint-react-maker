import React, { Component } from 'react';
import { Container, Row, Carousel, Card, Col, Ratio } from 'react-bootstrap';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import InfoFooter from '../Components/Micro/InfoFooter';

const Config = controller.getConfig();
function InfinityMint() {
    return (
        <>
            <Container fluid className="p-0">
                <Card body className="m-0 p-0 bg-black">
                    <Row>
                        <Col lg={4}>
                            <Carousel>
                                <Carousel.Item>
                                    <img
                                        src={Config.getBackground()}
                                        className="img-fluid"
                                        alt="random"
                                    />
                                </Carousel.Item>
                                <Carousel.Item>
                                    <img
                                        src={Config.getBackground()}
                                        className="img-fluid"
                                        alt="random"
                                    />
                                </Carousel.Item>
                                <Carousel.Item>
                                    <img
                                        src={Config.getBackground()}
                                        className="img-fluid"
                                        alt="random"
                                    />
                                </Carousel.Item>
                            </Carousel>
                        </Col>
                        <Col className="ps-5 pt-3">
                            <p className="display-1 font-weight-bold ">
                                BUILD IT
                            </p>
                            <p className="fs-4 text-white">
                                InfinityMint empowers artists and creators and
                                gives access to the blockchain to everyone. We
                                are a community of artists, developers, and
                                wizards.
                            </p>
                        </Col>
                    </Row>
                </Card>
            </Container>
            <Container fluid className="p-0">
                <Card body className="m-0 p-0 bg-black">
                    <Row>
                        <Col className="pe-5 pt-3">
                            <p className="display-1 font-weight-bold">
                                OWN IT
                            </p>
                            <p className="fs-4 text-white">
                                InfinityMint empowers artists and creators and
                                gives access to the blockchain to everyone. We
                                are a community of artists, developers, and
                                wizards.
                            </p>
                        </Col>
                        <Col lg={4}>
                            <Carousel>
                                <Carousel.Item>
                                    <img
                                        src={Config.getHeaderBackground()}
                                        className="img-fluid"
                                        alt="random"
                                    />
                                </Carousel.Item>
                                <Carousel.Item>
                                    <img
                                        src={Config.getHeaderBackground()}
                                        className="img-fluid"
                                        alt="random"
                                    />
                                </Carousel.Item>
                                <Carousel.Item>
                                    <img
                                        src={Config.getHeaderBackground()}
                                        className="img-fluid"
                                        alt="random"
                                    />
                                </Carousel.Item>
                            </Carousel>
                        </Col>
                    </Row>
                </Card>
            </Container>
            <Container fluid className="p-0 mb-5">
                <Card body className="m-0 p-0 bg-black">
                    <Row>
                        <Col lg={4}>
                            <Carousel>
                                <Carousel.Item>
                                    <img
                                        src={Config.getHeaderBackground()}
                                        className="img-fluid"
                                        alt="random"
                                    />
                                </Carousel.Item>
                                <Carousel.Item>
                                    <img
                                        src={Config.getHeaderBackground()}
                                        className="img-fluid"
                                        alt="random"
                                    />
                                </Carousel.Item>
                                <Carousel.Item>
                                    <img
                                        src={Config.getHeaderBackground()}
                                        className="img-fluid"
                                        alt="random"
                                    />
                                </Carousel.Item>
                            </Carousel>
                        </Col>
                        <Col className="ps-5 pt-3">
                            <p className="display-1 font-weight-bold rainbow-text-animatedRed">
                                BELIEVE IT
                            </p>
                            <p className="fs-4 text-white">
                                InfinityMint empowers artists and creators and
                                gives access to the blockchain to everyone. We
                                are a community of artists, developers, and
                                wizards.
                            </p>
                        </Col>
                    </Row>
                </Card>
            </Container>
            <InfoFooter />
        </>
    );
}

InfinityMint.settings = {
   // navbar: '$.UI.Navbar.InfinityMint',
};
InfinityMint.id = 'InfinityMint';
InfinityMint.url = '/facts';

export default InfinityMint;
