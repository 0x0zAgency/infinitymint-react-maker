import { Alert, ProgressBar } from 'react-bootstrap';
import React from 'react';
import Config from '../../config.js';

const StickerHealth = ({ sticker, assets }) => {
    let totalSize = 0;
    let pathSize = 0;

    if (assets.svg !== undefined && assets.svg.length > 0) {
        pathSize = [...assets.svg].pop();
    }

    if (assets.sticker !== undefined && assets.sticker.length > 0) {
        totalSize = [...assets.sticker].pop();
    }

    let pathPercentage = Math.min(
        100,
        Math.max(0, (100 / Config.settings.maxPathSize) * (pathSize * 1024))
    );

    let totalPercentage = Math.min(
        100,
        Math.max(0, (100 / Config.settings.maxStickerSize) * (totalSize * 1024))
    );

    pathPercentage = Math.floor(pathPercentage);
    totalPercentage = Math.floor(totalPercentage);

    let pathVariant = 'success';
    if (pathPercentage > 90) {
        pathVariant = 'danger';
    } else if (pathPercentage > 50) {
        pathVariant = 'warning';
    }

    let totalVariant = 'success';
    if (totalPercentage > 90) {
        totalVariant = 'danger';
    } else if (totalPercentage > 50) {
        totalVariant = 'warning';
    }

    return (
        <div className="d-grid gap-2">
            <p className="fs-5">
                🔍 Apperance Size (
                {pathSize +
                    'kb / ' +
                    (Config.settings.maxPathSize / 1024).toFixed(2) +
                    'kb'}
                )
            </p>
            <ProgressBar
                now={pathPercentage}
                variant={pathVariant}
                className="fs-6 p-2 bg-light text-white"
                label={
                    pathSize +
                    'kb / ' +
                    (Config.settings.maxPathSize / 1024).toFixed(2) +
                    'kb'
                }
                style={{ height: 32, color: 'white' }}
                animated
                striped
            />
            <p className="fs-5 mt-4">
                🗂️ Sticker Size (
                {totalSize +
                    'kb / ' +
                    (Config.settings.maxStickerSize / 1024).toFixed(2) +
                    'kb'}
                )
            </p>
            <ProgressBar
                now={totalPercentage}
                variant={totalVariant}
                className="fs-6 p-2 bg-light text-white"
                style={{ height: 32, color: 'white' }}
                label={
                    totalSize +
                    'kb / ' +
                    (Config.settings.maxStickerSize / 1024).toFixed(2) +
                    'kb'
                }
                animated
                striped
            />
            <div className="d-grid mt-4">
                {totalPercentage >= 100 || pathPercentage >= 100 ? (
                    <Alert variant="danger" className="text-center mt-3">
                        <p className="fs-1 mb-4">😭</p>
                        You need to cut down on those bytes!
                    </Alert>
                ) : (
                    <>
                        {totalPercentage >= 50 || pathPercentage >= 50 ? (
                            <Alert
                                variant="warning"
                                className="text-center mt-3"
                            >
                                <p className="fs-1 mb-4">😱</p>
                                You are approaching the limit without IPFS...
                                You have left{' '}
                                {(
                                    Config.settings.maxStickerSize / 1024 -
                                    totalSize
                                ).toFixed(2) + 'kb'}{' '}
                                bytes.
                            </Alert>
                        ) : (
                            <Alert
                                variant="success"
                                className="text-center mt-3"
                            >
                                <p className="fs-1 mb-4">🤠</p>
                                You are under the limit! You get a maximum of{' '}
                                {(
                                    Config.settings.maxStickerSize / 1024
                                ).toFixed(2) + 'kb'}{' '}
                                per sticker.
                            </Alert>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StickerHealth;
