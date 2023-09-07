import React, { Component } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Form,
    Alert,
} from 'react-bootstrap';
import tinySVG from 'tinysvg-js';
import NavigationLink from '../../Components/NavigationLink.js';

class Parser extends Component {
    constructor(props) {
        super(props);

        this.state = {
            code: '',
            svg: '',
            error: null,
            pathSize: 0,
        };
    }

    async onSubmit(e) {
        e.preventDefault();

        try {
            let [result, pathSize] = tinySVG.toSVG(
                this.state.code,
                true,
                [], // To work out pathSize
                false,
                true
            );

            const colours = [];

            for (let i = 0; i < pathSize; i++) {
                colours[i] = Number.parseInt(
                    (Math.random() * 0xff_ff_ff) % 0xff_ff_ff,
                    16
                );
            }

            // Redo it with colours generated for each path
            [result, pathSize] = tinySVG.toSVG(
                this.state.code,
                true,
                colours,
                false,
                false,
                true
            );

            this.setState({
                svg: result,
            });
        } catch (error) {
            this.setState({
                error,
            });
        }
    }

    render() {
        return (
            <>
                <Container>
                    <Row className="mt-5">
                        <Col className="text-center text-white zombieTextRed  fs-2">
                            <h1 className="display-1 zombieTextRed Blue text-white">
                                tinySVG ➡️ SVG
                            </h1>
                            <p className="fs-3 text-white">
                                Parse tinySVG into SVG.
                            </p>
                        </Col>
                    </Row>
                    <Row className="mt-5">
                        <Col xs={12}>
                            {this.state.error !== null ? (
                                <>
                                    <Alert variant="danger">
                                        {this.state.error.message}
                                    </Alert>
                                </>
                            ) : (
                                <></>
                            )}
                            <Card body>
                                <Row className="gy-4">
                                    <Col lg>
                                        <Form
                                            onSubmit={this.onSubmit.bind(this)}
                                        >
                                            <Form.Group
                                                className="mb-3"
                                                controlId="code"
                                            >
                                                <p className="fs-2">
                                                    Tiny SVG Code
                                                </p>
                                                <textarea
                                                    className="form-control"
                                                    rows={3}
                                                    type="text"
                                                    onChange={(e) => {
                                                        this.setState({
                                                            code: e.target
                                                                .value,
                                                        });
                                                    }}
                                                    placeholder="Enter tinySVG Code..."
                                                />
                                            </Form.Group>
                                            <Button
                                                variant="primary"
                                                type="submit"
                                            >
                                                Convert
                                            </Button>
                                        </Form>
                                    </Col>
                                </Row>
                                <Row className="mt-2">
                                    <Col lg={12}>
                                        <Row>
                                            <Col lg={8}>
                                                <p className="fs-2">Output</p>
                                                <Card body bg="light">
                                                    {this.state.svg !== '' ? (
                                                        <div
                                                            className="mh-50 p-2 overflow-auto"
                                                            style={{
                                                                fontSize: 10,
                                                                lineBreak:
                                                                    'anywhere',
                                                                maxHeight:
                                                                    '372px',
                                                            }}
                                                        >
                                                            {this.state.svg}
                                                        </div>
                                                    ) : (
                                                        <Alert
                                                            variant="dark"
                                                            className="mt-4 text-center"
                                                        >
                                                            Please Enter Code...
                                                        </Alert>
                                                    )}
                                                </Card>
                                            </Col>
                                            <Col lg>
                                                <p className="fs-2">Preview</p>
                                                <Card body bg="light">
                                                    <div className="d-grid gap-4">
                                                        {this.state.svg !==
                                                        '' ? (
                                                            <>
                                                                <div
                                                                    className="bg-light"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: this
                                                                            .state
                                                                            .svg,
                                                                    }}
                                                                ></div>
                                                            </>
                                                        ) : (
                                                            <Alert
                                                                variant="danger"
                                                                className="mt-4 text-center"
                                                            >
                                                                No Preview
                                                                Available
                                                            </Alert>
                                                        )}
                                                    </div>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mt-5">
                        <Col className="text-center text-white">
                            <h1 className="fs-1">
                                Want to put it back into tinySVG?
                            </h1>
                            <p className="fs-5">Yes, yes you can.</p>
                            <div className="d-grid mt-2">
                                <NavigationLink
                                    text="Converter"
                                    location="/utility/converter"
                                />
                            </div>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <br />
                </Container>
            </>
        );
    }
}

Parser.url = '/utility/parser';
Parser.developer = true;
Parser.id = 'Parser';
Parser.settings = {
    dropdown: {
        utility: '$.UI.Navbar.TinySVGToSVG',
    },
};

export default Parser;
