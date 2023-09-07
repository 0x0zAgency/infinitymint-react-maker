import {
    Nav,
    NavDropdown,
    Container,
    Navbar,
    Alert,
    Button,
} from 'react-bootstrap';
import { Component } from 'react';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Config from '../config.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import { connectWallet, cutLongString } from '../helpers.js';
import NavbarLink from './NavbarLink.js';
import logo from '../Images/logo.png';

class WebsiteNavbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            interval: null,
            lastUpdated: Date.now(),
            hideNavbar:
                storageController.getPagePreference(
                    'hideNavbar',
                    storageController.getLocationHref()
                ) === true,
            hideBackground:
                storageController.getPagePreference(
                    'hideBackground',
                    storageController.getLocationHref()
                ) === true,
        };
    }

    componentDidMount() {
        let result = storageController.getPagePreference(
            'hideNavbar',
            null,
            false
        );
        if (result !== this.state.hideNavbar) {
            this.setState({
                hideNavbar: result,
            });
        }

        result = storageController.getPagePreference(
            'hideBackground',
            null,
            false
        );

        if (result !== this.state.hideBackground) {
            this.setState({
                hideBackground: result,
            });
        }

        if (
            storageController.getPagePreference('title', null, false) !==
            undefined
        ) {
            window.document.title =
                storageController.getPagePreference('title');
        }

        if (
            !storageController.getPagePreference('hideBackground', null, false)
        ) {
            document.querySelectorAll('body')[0].style.backgroundImage = `url(${
                storageController.getPagePreference(
                    'background',
                    null,
                    false
                ) || Config.getBackground()
            })`;
        } else {
            document.querySelectorAll('body')[0].style.backgroundImage = '';
        }
    }

    render() {
        return (
            <>
                {!this.state.hideNavbar && !controller.isWalletValid ? (
                    <>
                        <Alert variant="success" className="m-0 p-0 bg-info">
                            <p className="fs-6 p-2 mb-0 mt-2">
                                🥴 Web3 Error:{' '}
                                {controller.walletError?.message || ''}
                                <Button
                                    variant="dark"
                                    className="ms-2"
                                    onClick={async () => {
                                        await connectWallet();
                                    }}
                                >
                                    Connect Wallet
                                </Button>
                            </p>
                        </Alert>
                    </>
                ) : (
                    <></>
                )}
                <Navbar
                    variant="dark"
                    expand="xl"
                    className="p-3"
                    id="navbar"
                    // variant='dark'
                    // bg='dark'
                    // They were very insistent on this color for the navbar.
                    style={{ backgroundColor: '#000000' }}
                    hidden={this.state.hideNavbar}
                >
                    <Container fluid>
                        <Navbar
                            href="/"
                            className="d-sm-block d-md-block d-block fs-5 force-white"
                        >
                            
                            <span
                                className="badge bg-primary"
                                style={{
                                    position: 'absolute',
                                    marginTop: 48,
                                    fontSize: 9,
                                }}
                                hidden={resources.projectName().length < 12}
                            >
                                Powered By ♾️mint.eth
                            </span>
                            <img src={logo} alt='logo' width='250'
                                style={{
                                    position: 'relative',
                                    marginTop: -8,
                                }}
                            />
                        </Navbar>
                        <Navbar.Toggle
                            variant="dark"
                            bg="dark"
                            aria-controls="navbar-nav"
                            className='cool-link'
                            style={{ color: 'white', borderColor: 'white',borderWidth: 1, }}
                        />
                        <Navbar.Collapse id="navbar-nav" className="text-white">
                            <Nav className="me-auto px-2">
                                {this.props?.navbarStart !== undefined ? (
                                    Object.values(this.props.navbarStart).map(
                                        (element, index) => (
                                            <NavbarLink
                                                key={index}
                                                location={element.url}
                                                text={element.text}
                                                isNavLink={true}
                                            />
                                        )
                                    )
                                ) : (
                                    <></>
                                )}
                                {this.props?.navbar !== undefined ? (
                                    Object.values(this.props.navbar).map(
                                        (element, index) => (
                                            <NavbarLink
                                               
                                            key={index}
                                                location={element.url}
                                                text={element.text}
                                                isNavLink={true}
                                            /> 
                                        )
                                    )
                                ) : (
                                    <></>
                                )}
                            </Nav>
                            <Nav className="ms-auto px-2">
                                {this.props?.navbarEnd !== undefined ? (
                                    Object.values(this.props.navbarEnd).map(
                                        (element, index) => (
                                            <NavbarLink
                                                key={index}
                                                location={element.url}
                                                text={element.text}
                                                isNavLink={true}
                                            />
                                        )
                                    )
                                ) : (
                                    <></>
                                )}
                                {controller.isWalletValid &&
                                storageController.existsAndNotEmpty(
                                    'previews'
                                ) ? (
                                    <>
                                        <NavbarLink
                                            location="/preview"
                                            text={resources.$.UI.Navbar.Preview}
                                            isNavLink={true}
                                        />
                                    </>
                                ) : (
                                    <></>
                                )}
                            </Nav>
                            <Nav className="text-center me-2">
                                {this.props?.dropdown !== undefined ? (
                                    Object.keys(this.props.dropdown).map(
                                        (key, index) => {
                                            const value =
                                                this.props.dropdown[key];
                                            return (
                                                <NavDropdown
                                                    key={index}
                                                    title={
                                                        resources.$.UI.Navbar[
                                                            key[0].toUpperCase() +
                                                                key.slice(1)
                                                        ]
                                                    }
                                                    className="force-white"
                                                    id={'dropdown-' + key}
                                                >
                                                    {value.map((link, _i) => (
                                                        <NavbarLink
                                                            key={_i}
                                                            location={link.url}
                                                            text={link.text}
                                                        />
                                                    ))}
                                                </NavDropdown>
                                            );
                                        }
                                    )
                                ) : (
                                    <></>
                                )}
                            </Nav>
                            {Config.deployInfo?.isChild ? (
                                <Nav className="me-2 d-sm-none d-md-none d-lg-block d-none">
                                    <p className="pt-2 text-center">
                                        <object className="badge bg-info">
                                            {Config.deployInfo.childProject}
                                        </object>
                                    </p>
                                </Nav>
                            ) : (
                                <></>
                            )}
                            {controller.accounts[0] !== undefined ? (
                                <Nav className="me-2 d-sm-none d-md-none d-lg-block d-none">
                                    <p className="pt-2 text-center">
                                        <object className="badge bg-success">
                                            {cutLongString(
                                                controller.accounts[0],
                                                20
                                            )}
                                        </object>
                                    </p>
                                </Nav>
                            ) : (
                                <></>
                            )}
                            {controller.accounts[0] !== undefined ? (
                                <Nav className="ms-auto d-sm-block d-md-block d-lg-none">
                                    <p className="pt-2 text-center force-white">
                                        Your Current Wallet
                                        <br />
                                        <object className="badge bg-success">
                                            {controller.accounts[0]}
                                        </object>
                                    </p>
                                </Nav>
                            ) : (
                                <></>
                            )}
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </>
        );
    }
}

export default WebsiteNavbar;
