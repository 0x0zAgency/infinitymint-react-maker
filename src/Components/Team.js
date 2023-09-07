import React from 'react';
import { Row, Card, Image, Stack } from 'react-bootstrap';
import controller from 'infinitymint-client/dist/src/classic/controller.js';

function Team() {
    const showAllAuthors =
        controller.getProjectSettings().description?.authors?.map((author) => (
            <Card className="text-center" style={{width: '18rem'}}>
                <a href={author.twitter} rel="noreferrer" className="cool-link">
                    <Image
                        lg
                        roundedCircle
                        thumbnail
                        alt="∞"
                        className="mx-auto img-fluid m-4"
                        style={{ maxHeight: 256 }}
                        src={author.avatar}
                    />
                </a>
                <Card.Body>
                    <h3 style={{ fontSize: 'calc(12px + 0.8vw)' }}>
                        {author.name}
                    </h3>
                    <h5 style={{fontSize: 'calc(12px + 0.8vw)'}}>{author.description}</h5>
                    <a href={`https://${author.ens}`} rel="noreferrer nosniff">{author.ens}</a>
                </Card.Body>
            </Card>
        ));

    return (
        <Card body className="mt-2">
            <Card.Title>
                <h1 className="mt-3 text-center header-text textGold force-white display-1">
                    {controller.getDescription().name}
                </h1>
                <h1 className="fs-5  text-center">
                    The Team Behind The {controller.getDescription().token}
                </h1>
            </Card.Title>
            <Stack gap={4} className="d-flex justify-content-center align-items-center" direction="horizontal">
                <Row className="mt-3">{showAllAuthors}</Row>
            </Stack>
        </Card>
    );
}

export default Team;
