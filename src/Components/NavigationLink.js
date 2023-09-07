import { React, useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import resources from 'infinitymint-client/dist/src/classic/resources';

// Pretty much a copy of navbar link except for buttons and A tags, will redirect the user somewhere
export default function NavigationLink({
    location,
    text,
    isButtonLink = true,
    variant = 'light',
    size = 'lg',
    onClick,
    hidden,
    languageAction,
    style = {},
    children = <></>,
    className,
    disabled = false,
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

    if (languageAction !== undefined)
        text = resources.getUIString('Action', languageAction);

    if (isButtonLink) {
        return (
            <Button
                hidden={hidden}
                variant={variant}
                size={size}
                className={className || ''}
                disabled={disabled}
                style={style || {}}
                onClick={(e) => {
                    if (onClick !== undefined) {
                        onClick();
                    }

                    navigateToUrl(e, location);
                }}
            >
                {text || children || ''}
            </Button>
        );
    }

    return (
        <>
            {hidden ? (
                <></>
            ) : (
                <a
                    href="?"
                    disabled={disabled}
                    hidden={hidden}
                    style={{
                        ...style,
                        display: hidden ? 'none' : 'box',
                    }}
                    onClick={(e) => {
                        if (onClick !== undefined) {
                            onClick();
                        }

                        navigateToUrl(e, location);
                    }}
                >
                    {text}
                </a>
            )}
        </>
    );
}
