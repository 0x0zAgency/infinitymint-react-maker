import React from 'react';
import { Col, Card, Button } from 'react-bootstrap';
import { FindStickerSVGStyle } from '../Resources/styles.js';
import Config from '../config.js';
import { tryDecodeURI, cutLongString } from '../helpers.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';

const Sticker = ({
    sticker,
    onClick,
    index,
    buttonText,
    buttonVariant,
    extraButtons,
    className,
    showExtra,
    hideButtons,
}) => (
    <Col className={className || ''} key={index}>
        <p className="fs-4">
            {' '}
            <span className="badge fs-5 bg-light me-2">
                {sticker.state === 0 || sticker.state === undefined
                    ? 'Not Ready'
                    : '✅'}
            </span>{' '}
            {cutLongString(tryDecodeURI(sticker.name), 24)}
        </p>
        <div
            className="p-2 d-grid svg-fix-tiny"
            dangerouslySetInnerHTML={{
                __html:
                    sticker.convertedPath !== undefined
                        ? sticker.convertedPath[0] || sticker.convertedPath
                        : '',
            }}
            style={FindStickerSVGStyle}
        ></div>
        <Card body>
            <span className="badge bg-dark ms-2">
                {Config.settings.environments[sticker.environment].name}
            </span>
            {showExtra === true ? (
                <span className="badge bg-dark ms-2">
                    {cutLongString(sticker.owner, 20)}
                </span>
            ) : (
                ''
            )}
            {showExtra === true ? (
                <span className="badge bg-dark ms-2">
                    {'Created: ' +
                        new Date(sticker.created).toLocaleDateString()}
                </span>
            ) : (
                ''
            )}
        </Card>
        {hideButtons !== true ? (
            <div className="d-grid mt-2 gap-2">
                {extraButtons || ''}
                <Button variant={buttonVariant || 'success'} onClick={onClick}>
                    {buttonText || resources.$.UI.Action.SelectSticker}
                </Button>
            </div>
        ) : (
            <></>
        )}
    </Col>
);

export default Sticker;
