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

class ConvertSVG extends Component {
    constructor(props) {
        super(props);

        this.state = {
            code: '',
            tinysvg: '',
            error: null,
            pathSize: 0,
            compressed: '',
            colours: [],
            compressedSize: 0,
        };
    }

    async onSubmit(e) {
        e.preventDefault();

        try {
            if (this.state.code === '') {
                throw new Error('no svg input');
            }

            // Reset
            this.setState({
                tinysvg: '',
                pathSize: 0,
                colours: [],
            });

            const result = tinySVG.toTinySVG(this.state.code, true);
            const compressed = tinySVG.compress(result);

            this.setState({
                tinysvg: result.paths,
                pathSize: result.pathSize,
                colours: result.colours,
                compressed,
                compressedSize: (new Blob([compressed]).size / 1024).toFixed(2), // Kb
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
                        <Col className="text-center text-white">
                            <h1 className="fs-1">SVG ➡️ tinySVG</h1>
                            <p className="fs-5">Convert an SVG into tinySVG</p>
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
                                    <Col>
                                        <Form
                                            onSubmit={this.onSubmit.bind(this)}
                                        >
                                            <Form.Group
                                                className="mb-3"
                                                controlId="code"
                                            >
                                                <p className="fs-2">SVG Code</p>
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
                                                    placeholder="Enter SVG Code..."
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
                                    <Col lg={6}>
                                        <p className="fs-2">
                                            Pathsize{' '}
                                            <span className="badge bg-success">
                                                {this.state.pathSize}
                                            </span>
                                        </p>
                                        <Card body bg="light">
                                            <div
                                                className="mh-50 p-2 overflow-auto"
                                                style={{
                                                    fontSize: 10,
                                                    lineBreak: 'anywhere',
                                                    maxHeight: '300px',
                                                }}
                                            >
                                                {this.state.tinysvg === ''
                                                    ? 'Nothing'
                                                    : this.state.tinysvg}
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col lg={6}>
                                        <p className="fs-2">
                                            After Compression{' '}
                                            <span className="badge bg-success">
                                                {this.state.compressedSize}kb
                                            </span>
                                        </p>
                                        <Card body bg="light">
                                            <div
                                                className="mh-50 p-2 overflow-auto"
                                                style={{
                                                    fontSize: 10,
                                                    lineBreak: 'anywhere',
                                                    maxHeight: '300px',
                                                }}
                                            >
                                                {this.state.tinysvg === ''
                                                    ? 'Nothing'
                                                    : this.state.compressed}
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                                <Row className="mt-4">
                                    <Col>
                                        {' '}
                                        <p className="fs-2">
                                            Colours{' '}
                                            <span className="badge bg-success">
                                                {this.state.colours.length}
                                            </span>
                                        </p>
                                    </Col>
                                </Row>
                                <Row className="mt-2 gy-4 gx-4 row-cols-4">
                                    {this.state.colours.length > 0 ? (
                                        this.state.colours.map((colour) => (
                                            <>
                                                <Col>
                                                    <Card
                                                        body
                                                        style={{
                                                            backgroundColor:
                                                                tinySVG.toHexFromDecimal(
                                                                    colour
                                                                ),
                                                        }}
                                                    >
                                                        <p className="fs-5">
                                                            <span className="badge bg-light">
                                                                {tinySVG.toHexFromDecimal(
                                                                    colour
                                                                )}
                                                            </span>
                                                        </p>
                                                    </Card>
                                                </Col>
                                            </>
                                        ))
                                    ) : (
                                        <Col>
                                            <div className="d-grid">
                                                <Alert variant="dark">
                                                    No Colours
                                                </Alert>
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mt-5">
                        <Col className="text-center text-white">
                            <h1 className="fs-1">
                                Want to put it back into tinySVG?
                            </h1>
                            <p className="fs-5">
                                Thats cool, press the button bellow. Go on, do
                                it!
                            </p>
                            <div className="d-grid mt-2">
                                <NavigationLink
                                    text="Parser"
                                    location="/utility/parser"
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

ConvertSVG.url = '/utility/converter/';
ConvertSVG.developer = true;
ConvertSVG.id = 'ConvertSVG';
ConvertSVG.settings = {
    dropdown: {
        utility: '$.UI.Navbar.SVGToTinySVG',
    },
};

export default ConvertSVG;
