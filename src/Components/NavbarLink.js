import { React, useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Nav, NavDropdown } from 'react-bootstrap';

// A custom nav link which redirects using router-dom instead
export default function NavbarLink({
    location,
    text,
    isNavLink = false,
    children,
}) {
    // Navs state
    const [navigate, setNavigate] = useState();

    // What to do on click
    const navigateToUrl = (e, location) => {
        e.preventDefault();
        setNavigate(location);
    };

    // Set it to undefined again after it has updated to stop loop
    useEffect(() => {
        setNavigate(undefined);
    }, [navigate]);

    if (navigate !== undefined) {
        return <Redirect to={navigate}></Redirect>;
    }

    children = children || '';

    if (!isNavLink) {
        return (
            <NavDropdown.Item
                onClick={(e) => {
                    navigateToUrl(e, location);
                }}
            >
                {text}
            </NavDropdown.Item>
        );
    }

    return (
        <Nav.Link
            className="text-center"
            onClick={(e) => {
                navigateToUrl(e, location);
            }}
        >
            {text}
            {children}
        </Nav.Link>
    );
}
