import React from 'react';
import { Container, Row } from 'react-bootstrap';
import InfoFooter from '../Components/Micro/InfoFooter.js';
import ComponentTeam from '../Components/Team.js';

function Team() {
    return (
        <>
            <Container fluid>
                <ComponentTeam />
            </Container>
            <InfoFooter hasBackground={true} light={false} />
        </>
    );
}

Team.url = '/team';
Team.id = 'Team';
Team.settings = {
    navbar: '$.UI.Navbar.Team',
};
export default Team;
