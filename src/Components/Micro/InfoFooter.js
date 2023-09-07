import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import Config from '../../config';

let contracts = [];

        if (Config.deployInfo?.contracts !== undefined)
            Object.keys(Config.deployInfo.contracts).forEach((key) => {
                contracts.push([key, Config.deployInfo.contracts[key]]);
            });

let etherWebsite = "https://etherscan.io/address/0x0z.eth";

{contracts.map(
    (contract) => (
        
        etherWebsite = Config.getNetwork().tokenscan + "address/" + contract[1]
         
    )
)}

const InfoFooter = ({ _hasBackground = false, className, light = false }) => (


    <Container
        fluid
        className={`px-5 py-2 ${className || ''} ${
            light ? 'bg-light' : 'bg-dark'
        }`}
        style={{
            marginTop: -6,
            borderTop: '1px solid #000000',
        }}
    >
        <Row className="h-100 mt-5 mb-5 gap-2">
            <Col lg={6}>
                <Row>
                    <Col lg>
                        <Card body className="text-center shadow-lg">
                            <div className="d-grid gap-2">
                                <Button
                                    variant="info"
                                    onClick={() => {
                                        window.open(etherWebsite);
                                    }}
                                >

                                    View Smart Contracts
                                </Button>
                                <Button
                                    variant="info"
                                    onClick={() => {
                                        window.open(
                                            'https://0x0z.eth.limo'
                                        );
                                    }}
                                >
                                   Follow the 0x🟨road.eth
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Col>
            <Col>
                <div className="block force-white">
                    <h5 className="text-center">Created by 0x0zAgency</h5>
                    <p className="text-center">
                        <a href="https://0x0z.xyz">
                           🥳Time.eth,
                        </a>{' '}
                        is the portal to superior NFT Party Pass technologies, and the key the one true Metaverse. Follow the 0x🟨road.
                    </p>
                </div>
            </Col>
        </Row>
    </Container>
);

export default InfoFooter;
