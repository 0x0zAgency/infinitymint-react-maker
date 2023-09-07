import { React, Component } from 'react';
import { Nav, NavDropdown, Container, Navbar } from 'react-bootstrap';
import Config from '../config.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';

// Images
import ImageIcon from '../Images/icon-512x512.png';
import NavbarLink from './NavbarLink.js';

class WebsiteFooter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            interval: null,
            lastUpdated: Date.now(),
            hideNavbar:
                storageController.getPagePreference('hideFooter') === true,
        };
    }

    render() {
        return (
            <Navbar
                variant="light"
                bg="light"
                expand="lg"
                className="navbar-hover p-1"
                fixed="bottom"
                hidden={this.state.hideNavbar}
            >
                <Container fluid>
                    <Nav className="me-auto">
                        <Navbar.Brand href="#navbar">
                            <img
                                src={ImageIcon}
                                width="30"
                                height="30"
                                className="d-inline-block align-top me-3"
                                alt="InfinityMint Logo"
                            />
                            {resources.projectName()}
                        </Navbar.Brand>
                        <Navbar.Text className="d-none d-lg-block d-xl-block">
                            Powered by ♾️mint.eth
                        </Navbar.Text>
                    </Nav>
                    <Nav className="d-none d-lg-block d-xl-block">
                        <NavDropdown
                            hidden={Config.settings.hideFooter === true}
                            title="⚙️"
                            id="token-nav-dropdown"
                            drop="up"
                            align={{ lg: 'end' }}
                        >
                            {/** if the wallet isnt valid then we don't show this stuff! */}
                            {controller.isWalletValid ? (
                                <>
                                    <NavbarLink
                                        location="/mint"
                                        text={resources.$.UI.Action.CreateToken}
                                    />
                                    <NavbarLink
                                        location="/advertise"
                                        text={resources.$.UI.Action.Advertise}
                                    />
                                    <NavDropdown.Divider />
                                    <NavbarLink
                                        location="/gallery"
                                        text={resources.$.UI.Action.AllTokens}
                                    />
                                    <NavbarLink
                                        location="/top"
                                        text={resources.$.UI.Action.TopTokens}
                                    />
                                    <NavbarLink
                                        location="/mytokens"
                                        text={resources.$.UI.Action.MyTokens}
                                    />
                                    <NavbarLink
                                        location="/sticker/creator"
                                        text={resources.$.UI.Action.MyStickers}
                                    />
                                    <NavbarLink
                                        location="/statistics"
                                        text={resources.$.UI.Misc.Statistics}
                                    />
                                </>
                            ) : (
                                <>
                                    <Nav.Link
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // Onboard.js here
                                        }}
                                    >
                                        {resources.$.UI.Action.ConnectWallet}
                                    </Nav.Link>
                                </>
                            )}
                            <NavDropdown.Divider />
                            <NavbarLink
                                location="/settings"
                                text={resources.$.UI.Misc.Settings}
                            />
                            <NavbarLink
                                location="/transactions"
                                text={resources.$.UI.Misc.Transactions}
                            />
                            <NavbarLink
                                location="/support"
                                text={resources.$.UI.Misc.Support}
                            />
                            <NavDropdown.Divider />
                            <NavDropdown.Item
                                href={Config.getNetwork().openseaAssets}
                            >
                                🏴‍☠ Opensea
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                href={Config.credits.llydiaTwitter}
                            >
                                🐦 Llydia
                            </NavDropdown.Item>
                            <NavDropdown.Item href={Config.credits.joshTwitter}>
                                🐦 Z
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                href={Config.credits.agencyTwitter}
                            >
                                🐦 0x0zAgency
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Container>
            </Navbar>
        );
    }
}

export default WebsiteFooter;
