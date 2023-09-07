import React from 'react';
import { Alert, Row, Col } from 'react-bootstrap';

const Box = ({ children, tag, variant, className }) => (
    <Alert variant={variant || 'primary'} className={className || 'mb-0'}>
        <Row>
            <Col
                xs={1}
                style={{
                    width: 64,
                    fontSize: 8,
                    textAlign: 'center',
                }}
            >
                <h1 className="mt-2">{tag || '💡'}</h1>
            </Col>
            <Col className='pt-2'>{children}</Col>
        </Row>
    </Alert>
);

export default Box;
