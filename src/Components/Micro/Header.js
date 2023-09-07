import React from 'react';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import { Col, Container, Card } from 'react-bootstrap';
import NavigationLink from '../../Components/NavigationLink.js';
import Config from '../../config.js';

const Header = ({ buyButton, className = '' }) => (
    <Container className={className}>
        <Card
            fluid
            lg
            className={
                'p-0 mt-3 py-2 text-center justify-content-center text-uppercase d-flex ' +
                className
            }
        >
            <Col>
                <img
                    src={Config.getHeaderBackground()}
                    alt="#"
                    style={{ maxWidth: '100vw', minWidth: '100%' }}
                />
            </Col>
        </Card>
    </Container>
);

export default Header;
