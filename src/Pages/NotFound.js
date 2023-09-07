import React, { Component } from 'react';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';

// Images
import ImagePanda from '../Images/invalid_wallet.jpg';
import resources from 'infinitymint-client/dist/src/classic/resources.js';

class NotFound extends Component {
    constructor(props) {
        super(props);

        this.state = {
            link: window.location.href,
        };

        this.interval = null;
    }

    // TODO: is this dumb? investigate if this is dumb, it feels dumb.
    componentDidMount() {
        if (this.interval !== null) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(() => {
            if (this.state.link !== window.location.href) {
                this.setState({
                    link: window.location.href,
                });
            }
        }, 1000);
    }

    componentWillUnmount() {
        if (this.interval !== null) {
            clearInterval(this.interval);
        }
    }

    render() {
        return (
            <Container>
                <Row className="mt-5">
                    <Col>
                        <p className="display-1">404: Not Found</p>
                        <p>
                            Looks like {decodeURIComponent(this.state.link)} is
                            invalid.
                        </p>
                    </Col>
                </Row>
                <Row className="mt-4 gy-4">
                    <Col md={6}>
                        <h2>Why don't you...</h2>
                        <br />
                        <ListGroup>
                            <ListGroup.Item>
                                Try going back <a href="/">home?</a>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                Maybe even{' '}
                                <a href="/mint">
                                    mint a {resources.projectToken()}?
                                </a>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                Or possibly{' '}
                                <a href="/discord">join our discord?</a>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                Else, try{' '}
                                <a href="?" onClick={() => {}}>
                                    reloading the page.
                                </a>
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                    <Col md={6}>
                        <img
                            alt="a sad panda"
                            className="img-fluid d-block mx-auto"
                            src={ImagePanda}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }
}

NotFound.id = 'NotFound';

export default NotFound;
