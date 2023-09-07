import React, { useEffect, useState } from 'react';
import { Card, Col } from 'react-bootstrap';
import { cutLongString, hasDestination } from '../helpers.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import tokenMethods from 'infinitymint-client/dist/src/classic/tokenMethods.js';
import modController from 'infinitymint-client/dist/src/classic/modController.js';
import Token from './Token.js';
import NavigationLink from './NavigationLink.js';

const GalleryItem = ({ token }) => {
    if (token.token !== undefined) {
        token = token.token;
    }

    const tokenNameDisplay = () => {
    
        if (token.names?.[0] !== undefined) {
            cutLongString(token.names?.[0], 24)
        }

        if (token.names?.[1] !== 'Party🎉Pass' && token.names?.[1] !== undefined){
            cutLongString(token.names?.[1], 24)
        }

        if (token.names?.[2] !== 'Party🎉Pass' && token.names?.[2] !== undefined){
            cutLongString(token.names?.[2], 24)
        }

        if (token.names?.[3] !== 'Party🎉Pass' && token.names?.[3] !== undefined){
            cutLongString(token.names?.[3], 24)
        }
    };

    const [isHovered, setHovered] = useState(false);

    const defaultClass = ' ' + (token.owner === controller.accounts[0] ? 'border-primary' : '');
    const hoverClass = ' ' + (token.owner === controller.accounts[0] ? 'border-secondary' : '');


    useEffect(() => {
        tokenMethods.onWindowResize(controller);
        setHovered(true);
        const timer = setTimeout(() => {
        setHovered(false);
        }, 5000); // Sets isHovered back to false after 5 seconds
        return () => clearTimeout(timer); // Clean up the timer
    }, []);

    return (
        <Col
            key={'col_' + token.tokenId + token.name}
            style={{
                minWidth: 256,
            }}
        >
            <Card
                body
                key={'card_' + token.tokenId + token.name}
                className={isHovered ? hoverClass : defaultClass}
                onMouseOver={() => setHovered(true)}
                onMouseOut={() => setHovered(false)}
            >
                <div
                    hidden={token.owner !== controller.accounts[0]}
                    className="div"
                    style={{
                        position: 'absolute',
                        zIndex: 99,
                        marginTop: -42,
                        marginLeft: -16,
                        textShadow: '1px 1px black',
                        transform: 'rotate(-5deg)',
                    }}
                >
                    <p className="display-7 neonText text-white">⭐️ Yours</p>
                </div>
                <p className='text-center display-9 fs-5'>
                
                
                    {cutLongString(token.name, 32)}
                    
                
                    
                </p>
                <div
                    key={Math.random()}
                    className="d-grid mb-2"
                >
                    <Token
                        key={token.tokenId}
                        theToken={token}
                        settings={{
                            opaqueDetails: true,
                            hideTokenId: true,
                            hideName: true,
                            hideDescription: true,
                            hideAllBadges: true,
                            static: false,
                            useFresh: true,
                            showEditButton:
                                token.owner === controller.accounts[0],
                            renderOnUpdate: true,
                            enableThreeJS: false,
                            downsampleRate3D: 1.5,
                            cameraFOV: 90,
                            cameraPositionZ: 100,
                            cameraPositionX: 0,
                            cameraPositionY: 180,
                            selectable3D: false,
                            disableFloor3D: true,
                            //ForceBackground: ModelBackground,
                            showHelpers3D: false,
                            lightIntensity3D: 30,
                            lightColour3D: 0xff_ff_ff,
                            ambientLightIntensity3D: 90,
                            ambientLightColour3D: 0xff_ff_e2,
                            rotationSpeed3D: 0.05,
                            id: token.tokenId,
                        }}

                        onClick={() => {
                            window.location.href = '/view/' + token.tokenId;
                        }}

                        onMouseOver={() => {
                            this.settings.enableThreeJS = true;
                        }}

                        onMouseOut={() => {
                            this.settings.enableThreeJS = false;
                        }}
                    />
                </div>
                <p className="text-center">
                    <span className="badge bg-light">
                        TokenId #{token.tokenId}
                    </span>{' '}
                    <span
                        className={
                            'badge ' +
                            (token.owner === controller.accounts[0]
                                ? 'bg-primary'
                                : 'bg-dark')
                        }
                    >
                        {cutLongString(token.owner, 24)}
                    </span>
                </p>
                <div className="d-grid gap-2">
                    {modController.isModEnabled('redemption') ? (
                        <NavigationLink
                            variant="light"
                            disabled={
                                token.owner !==
                                controller.getProjectSettings()?.contracts
                                    .Mod_Redemption
                            }
                            location={'/redemption?tokenId=' + token.tokenId}
                            size="md"
                        >
                            {resources.$.UI.Navbar.Redeem || '🏷️ Redeem'}
                        </NavigationLink>
                    ) : (
                        <></>
                    )}
                    <NavigationLink
                        variant="light"
                        location={'/view/' + token.tokenId}
                        size="md"
                    >
                        {resources.$.UI.Action.View}
                    </NavigationLink>
                    {modController.isModEnabled('marketplace') ? (
                        <NavigationLink
                            variant="light"
                            location={'/offers/' + token.tokenId}
                            size="md"
                        >
                            {resources.$.UI.Action.SendOffer}
                        </NavigationLink>
                    ) : (
                        <></>
                    )}
                    <NavigationLink
                        variant="light"
                        location={'/advertise/' + token.tokenId}
                        disabled={!hasDestination(token, 1)}
                        size="md"
                    >
                        {resources.$.UI.Action.PlaceSticker}
                    </NavigationLink>
                </div>
            </Card>
        </Col>
    );
};

export default GalleryItem;
