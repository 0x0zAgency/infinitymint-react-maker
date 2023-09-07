import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import GalleryElement from '../Components/GalleryElement.js';

function Gallery() {
    return (
        <Container className="pt-4 w-75 lg: w-75 xl: w-75 sm: w-100">
            <GalleryElement
                loadInstantly={true}
                rowNumber={4}
                sidebarWidth={4}
                hiddenSidebar={true}
                showHeader={true}
                useMemory={false}
                rowColumnClass={'row-cols-3'}
            />
            <br />
            <br />
            <br />
        </Container>
    );
}

Gallery.url = '/gallery';
Gallery.id = 'Gallery';
Gallery.settings = {
    dropdown: {
        user: '$.UI.Action.AllTokens',
    },
    navbar: '$.UI.Navbar.Gallery',
};
export default Gallery;
