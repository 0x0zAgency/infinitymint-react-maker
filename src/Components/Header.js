import controller from 'infinitymint-client/dist/src/classic/controller';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, Row, Col, Container } from 'react-bootstrap';
import Config from '../config';
import NavigationLink from './NavigationLink';
import resources from 'infinitymint-client/dist/src/classic/resources';

const Header = ({
    hideExtra,
    hidePoweredBy,
    headerSize,
    headerPaddingTop,
    background,
    children,
}) => {
    const [backgroundImage, setBackgroundImage] = useState(background);

    let project = controller.getProject();
    useEffect(() => {
        setBackgroundImage(
            background || Config.getImage('features')
        );
    }, [background]);

    return (
        <>
            <div
                    className="header-bg-cover"
                    style={{
                        zIndex: -1,
                        backgroundImage: `url(${backgroundImage})`,
                        minHeight: headerSize !== undefined ? headerSize : 100,
                    }}
                ></div>
            <div
                className="p-0 m-0 text-center align-items-top justify-content-center header-bg-image"
                style={{
                   
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: '100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPositionY: 'top',
                    minHeight: headerSize !== undefined ? headerSize : 0,
                    
                }}
            >
                
                <div style={{ position: 'relative', zIndex: 0 }}>
                    <div className="d-flex justify-content-center align-items-center">
                        <div
                            className="xxl: pt-6 xl: pt-5 lg: pt-5 md: pt-2 sm: pt-1"
                            style={{
                                
                                marginTop:
                                    (headerSize || 0) +
                                    (headerPaddingTop || 0) +
                                    'px',
                            }}
                        >
                            
                           
                            {hidePoweredBy !== true ? (
                                <h1
                                    style={{
                                        
                                        maxWidth: 960,
                                    
                                        WebkitTextStroke: '1px black',
                                            animation: 'wiggle 69s ease-in-out infinite',
                                            
                                          
                                    }}
                                    className="m-4 display-4"
                                >
                                    <span className='rainbow-text-animatedCyber'>There is always a time to party and NOW is that time!</span>
                                    
                                    <div className='display-7 cool-link' 
                                    style={{
                                         WebkitTextStroke: '1px black',
                                        animation: 'wiggle 34s ease-in-out infinite',
                                        
                                               
                                            }}><span className='cool-link'>Tokenized Party Management Platform</span></div>
                                    
                                </h1>
                            ) : (
                                <></>
                            )}
                            {hideExtra !== true && controller.isWeb3Valid ? (
                                <>
                                    
                                </>
                            ) : (
                                <></>
                            )}
                            {children || <></>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
