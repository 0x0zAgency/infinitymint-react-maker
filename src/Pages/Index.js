import React, { useState, useEffect } from 'react';
import { Container, Row, Card, Col, Accordion } from 'react-bootstrap';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import NavigationLink from '../Components/NavigationLink.js';
import InfoFooter from '../Components/Micro/InfoFooter.js';
import Config from '../config.js';
import Header from '../Components/Header.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Token from '../Components/Token.js';

const InfoCard = (props) => (
    <Accordion defaultActiveKey={['0']} alwaysOpen>
        <Card style={{borderColor: "black" }}>
            <Card.Header style={{borderColor: "black" }} className="text-primary bg-warning display-6">
                <strong>{props.title}</strong>
            </Card.Header>
            <Card.Body className="text-black display-8">{props.text}</Card.Body>
        </Card>
        <div className="flex align-items-center justify-content-center text-center">
            <p style={{ fontSize: 32 }}>🥳</p>
        </div>
    </Accordion>
);

const Index = ({ hidePoweredBy }) => {
    let project = controller.getProject();
    let settings = {
        hideAllBadges: true,
        hideModPages: true,
        hideDescription: true,
        static: true,
        useFresh: true,
        renderOnUpdate: true,
        enableThreeJS: false,
        downsampleRate3D: 1,
        cameraFOV: 85,
        cameraPositionZ: 69,
        cameraPositionX: 0,
        cameraPositionY: 180,
        selectable3D: false,
        disableFloor3D: true,
        //ForceBackground: ModelBackground,
        showHelpers3D: false,
        lightIntensity3D: 30,
        lightColour3D: 0xff_ff_ff,
        ambientLightIntensity3D: 90,
        ambientLightColour3D: 0xff_ff_e2,
        rotationSpeed3D: 0.005,
    };
    let signature = 530849768910443023528820;

    return (
        <>
            <Container className="lg: w-75 xl: w-75 sm: p-0 sm: w-100">
                <Header headerSize={960} headerPaddingTop={-640} />
                {/** The Header */}
                {/** Font Page Copy */}
                <Container
                    style={{
                        maxWidth: '75%',
                    }}
                >
                    <Row
                        style={
                            {
                                marginTop: '-25%',
                            }
                        }
                    >
                        <Col>
                            <Card 
                                body
                                className="bg-secondary glow justify-content-center align-items-center"
                                
                                >
                                <Row className="justify-content-center align-items-center mx-4">
                                    <Col
                                        style={{
                                            textAlign: 'right',
                                        }}
                                        xs={12}
                                        sm={12}
                                        md={5}
                                        xl={5}
                                        xxl={5}
                                    >
                                        <h1 className="m-0 p-2 text-white display-8">
                                        Mint a Party Pass and unlock the power of Web3! This project is a demo of the power of InfinityMint.
                                        </h1>
                                    </Col>
                                    <Col
                                        style={{
                                            textAlign: 'center',
                                            alignContent: 'center',
                                        }}
                                        xs={12}
                                        sm={12}
                                        md={2}
                                        xl={2}
                                        xxl={2}
                                    >
                                        <img src="https://images.emojiterra.com/google/noto-emoji/unicode-15/color/512px/1f973.png" loading="lazy" width="69"
                                            style={{
                                                animation: 'wiggle 4s linear infinite',
                                            }}
                                        ></img>
                                    </Col>
                                    <Col
                                        style={{
                                            textAlign: 'left',
                                        }}
                                        xs={12}
                                        sm={12}
                                        md={5}
                                        xl={5}
                                        xxl={5}
                                    >
                                        <h2 className="m-0 p-2 text-white display-8">
                                        🎉 Now Minting: Partytime Party Passes! The most powerful party pass in the known Metaverse.
                                        </h2>
                                    </Col>
                                </Row>
                                <Row className="justify-content-center align-items-center my-4">
                                    <Col
                                        className="text-center"
                                    >
                                        <NavigationLink
                                            className="p-4 rainbow-text-animatedCyber header-subtext w-100"
                                            style={{
                                                outline: '1px solid white',
                                            }}
                                            variant="primary"
                                            size="lg"
                                            location="/mint"
                                            languageAction="CreateToken"
                                            disabled={!controller.isWeb3Valid}
                                        />
                                    </Col>
                                </Row>
                                <Row className="justify-content-center align-items-center">
                                    <Col
                                        sm={12}
                                        lg={12}
                                        xl={12}
                                        md={12}
                                        xs={12}
                                    >
                                        <Row className="justify-content-center mt-2">
                                            <Col className="text-center col-4">
                                                <a href="/mint">
                                                    <Token
                                                    key={"FakeToken_01"}
                                                        theToken={{
                                                            token: {
                                                                ...controller.makeFakeToken(
                                                                    Math.floor(Math.random() * 9),
                                                                    '🎟️'
                                                                ), // colours)
                                                                tokenId: 0,
                                                            },
                                                        }}
                                                        settings={settings}
                                                    />
                                                </a>
                                            </Col>

                                            <Col className="text-center col-4">
                                                <a href="/mint">
                                                    <Token
                                                        key={"FakeToken_02"}
                                                        theToken={{
                                                            token: {
                                                                ...controller.makeFakeToken(
                                                                    Math.floor(Math.random() * 19),
                                                                    '🎟️'
                                                                ), // colours)
                                                                tokenId: 0,
                                                            },
                                                        }}
                                                        settings={settings}
                                                    />
                                                </a>
                                            </Col>

                                            <Col className="text-center col-4">
                                                <a href="/mint">
                                                    <Token
                                                        key={"FakeToken_03"}
                                                        theToken={{
                                                            token: {
                                                                ...controller.makeFakeToken(
                                                                    Math.floor(Math.random() * 29),
                                                                    '🎟️'
                                                                ), // colours)
                                                                tokenId: 0,
                                                            },
                                                        }}
                                                        settings={settings}
                                                    />
                                                </a>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </Container>
                <Container
                    style={{
                        maxWidth: '99%',
                    }}
                >
                    <Row className="mt-4 mb-4">
                        <Card
                            body
                            className="bg-white justify-content-center align-items-center"
                        >
                            <h1 className="mt-4 display-2 text-center text-primary">
                        It's Party🥳Time! 🥳Time.eth That Is!
                            </h1>
                            <hr />
                            <h2 className="mb-4 display-7 text-center text-info">
                                Welcome to the future of Party Planning.{' '} One that is powered by Web3 and NFTs.{' '}One that puts the power of Tickets, Sponsorships, and Merchandise in the hands of the Proper Party People.{' '}One that is powered by the Ethereum Ads Service.{' '}One that is powered by InfinityMint.{' '}One that is powered by you.
                            </h2>
                            <h4 className="mx-5 mb-4 display-8 text-center text-black">
                                🎊 Featuring 16 possible variations that are generated live onchain. All with some very special features ontoken. You also get access to many features thanks to InfinityMint. 
                            </h4>
                            <h5 className="mx-5 mb-4 display-9 text-center text-danger">
                                🔞 DON'T DRINK AND DRIVE: Everything you here see is still under development. Thanks for checking out Party🥳Time and we hope to party hard with you soon. STAY SAFE!
                            </h5>
                            <span className="text-black display-6 flex text-center">
                            <NavigationLink
                                            className="p-4 rainbow-text-animatedCyber header-subtext w-100"
                                            style={{
                                                outline: '1px solid white',
                                            }}
                                            variant="primary"
                                            size="lg"
                                            location="/mint"
                                            languageAction="CreateToken"
                                            disabled={!controller.isWeb3Valid}
                                        />
                            </span>

                            <hr />

                            <InfoCard
                                
                                title="🥳 Party People Need Only Apply"
                                text="
                                If you want to take advantage of the power of Tokenization for all of your Party Time needs! Come join us in the green room and get VIP Access to this very exclusive Party. 🎊
                                "
                            />

                            <InfoCard
                                title="🎟️ Your Pass Is a Web3 Wallet"
                                text="
                                This very special Party Pass will also act like a wallet so that you can feel at ease when interacting and transacting with other Party🥳People and at Party Time Events! 🎁
                                "
                            />

                            <InfoCard
                                title="💰 Get Sponsored &amp; Monetize"
                                text="
                                Make it easy for your Party Plan to come to life with the instant ability to recieve Sponsoships right here on Party🥳Time. With the help of the Ethereum Ads Service, some real Metaverse Magic is possible. 🪙
                                "
                            />

                            <br />
                            <NavigationLink
                                            className="p-4 rainbow-text-animatedCyber header-subtext w-100"
                                            style={{
                                                outline: '1px solid white',
                                            }}
                                            variant="primary"
                                            size="lg"
                                            location="/mint"
                                            languageAction="CreateToken"
                                            disabled={!controller.isWeb3Valid}
                                        />
                        </Card>
                    </Row>
                </Container>
            </Container>
            {!hidePoweredBy && (
                <Container
                    fluid
                    className="bg-black justify-content-center align-items-center w-100 pb-5"
                >
                    <Row className="p-4">
                        <Col>
                            <h1 className="ms-4 display-6 text-center rainbow-text-animatedCyber">
                                🚀 Now Minting: {project.description.token}
                            </h1>
                            <hr />
                            <h4
                                className="display-8 text-white"
                            >
                                The {project.description.token} is a DYNAMIC
                                ERC721 based Phygital Merchandise NFT, and Metavere Portal powered by{' '}
                                <a href="https://magicmirror.one/infinitymint.eth">
                                    Infinity♾️Mint
                                </a>
                            </h4>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={6} className="w-75">
                            <Card
                                body
                                className="d-grid"
                                style={{ color: 'black', fontWeight: 'bold' }}
                            >
                                <p>
                                    <span
                                        style={{
                                            textDecoration: 'underline',
                                        }}
                                    >
                                    </span>{' '}
                                    The {project.description.token} come with
                                    some very cool Web3 tech too! For example,
                                    you will be able to change the appearance of
                                    your {project.description.token} and any
                                    application that is accessing the{' '}
                                    {project.description.token}, will also be
                                    updated. You will also be able to sponsor
                                    your {project.description.token} and extract
                                    revenues directly from the NFT. This is just
                                    the beginning of the magic of Web3.
                                </p>
                            </Card>
                        </Col>
                        <Col
                            lg={6}
                            className="w-75"
                            style={{ marginLeft: 'auto' }}
                        >
                            <Card
                                body
                                className="d-grid"
                                style={{ color: 'black', fontWeight: 'bold' }}
                            >
                                <p className="text-end">
                                    As a holder of {project.description.token},
                                    it is essentially your membership card,
                                    granting you access to all aspects of{' '}
                                    {project.project}. When you MINT a{' '}
                                    {project.description.token}, it’s way more
                                    than just another PFP project. You are at
                                    the genesis of a massive shift in Web3
                                    technology and we are happy you are here
                                    with us.
                                </p>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            )}
            <InfoFooter />
        </>
    );
};

Index.url = '/';
Index.settings = {
    navbarStart: '$.UI.Navbar.Home',
};

export default Index;