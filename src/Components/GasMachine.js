import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, Form, Alert, Button, Card } from 'react-bootstrap';
import Config from '../config.js';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';

const GasMachine = ({ gasUsage }) => {
    const [GasPrice, setGasPrice] = useState(
        Config.getGasPrice(
            storageController.getGlobalPreference('gasSetting') || 'medium'
        )
    );
    const [GasSetting, setGasSetting] = useState(
        storageController.getGlobalPreference('gasSetting') || 'medium'
    );
    const [GasUpdated, setGasUpdated] = useState(Date.now());

    useEffect(() => {
        const _ = async () => {
            await Config.loadGasPrices();
            const prices = {
                ...(Config.getGasPrices() || { fast: 0, medium: 0, slow: 0 }),
            };
            setGasPrice(prices[GasSetting] || 0);

            if (
                storageController.getGlobalPreference('gasSetting') ===
                undefined
            ) {
                storageController.setGlobalPreference('gasSetting', 'medium');
            }
        };

        const interval = setInterval(() => {
            Config.loadGasPrices().then(() => {
                const prices = {
                    ...(Config.getGasPrices() || {
                        fast: 0,
                        medium: 0,
                        slow: 0,
                    }),
                };
                setGasPrice(prices[GasSetting] || 0);
                setGasUpdated(Date.now());
            });
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [GasPrice, GasSetting, GasUpdated]);

    return (
        <div className="d-grid gap-2 rounded">
            <Card body className="bg-dark pt-2 rounded" style={{ zIndex: 0 }}>
                <p
                    className="text-center mt-3 "
                    style={{ color: 'white', fontSize: 40 }}
                >
                    <span
                        style={{
                            position: 'absolute',
                            marginLeft: 124,
                            marginTop: -12,
                            fontSize: 22,
                        }}
                    >
                        The
                    </span>
                    <span
                        className="badge bg-transparent text-wrap spinText cogFont"
                        style={{
                            position: 'absolute',
                            marginTop: -28,
                            marginLeft: -24,
                            zIndex: -1,
                        }}
                    >
                        ⚙️
                    </span>{' '}
                    Gas Machine
                </p>
                <p className="text-center">
                    <span className="badge bg-light text-wrap">
                        {Config.getNetwork().name}
                    </span>
                </p>
                <p
                    className="text-center force-white"
                    style={{ fontSize: '16px' }}
                >
                    {GasPrice} wei /{' '}
                    {(GasPrice > 0 ? GasPrice / 10 ** 9 : 0).toFixed(2)} gwei{' '}
                    <span className="badge bg-light text-wrap">
                        {GasSetting}
                    </span>
                </p>
                {Config.requiredChainId === 5 ? (
                    <Alert variant="danger" className="text-center">
                        <p className="fs-1 mt-3">⚠️</p>
                        <u>Goreli</u> is very unpredictable, and the gwei given
                        is incorrect. Please manually edit the gas settings in
                        your wallet and set to <b>high</b>.
                    </Alert>
                ) : (
                    <></>
                )}
                {gasUsage !== undefined &&
                !isNaN(gasUsage) &&
                !isNaN(GasPrice) ? (
                    <p
                        className="text-center force-white"
                        style={{ fontSize: '80%' }}
                    >
                        {gasUsage} gas limit /{' '}
                        {controller.web3.utils.fromWei(
                            gasUsage * GasPrice + ' '
                        )}{' '}
                        <span className="badge bg-warning text-wrap">Fee</span>
                    </p>
                ) : (
                    <p
                        className="text-center force-white"
                        style={{ fontSize: '80%' }}
                    >
                        Unable to get estimate cost.
                    </p>
                )}
                <p
                    className="text-center force-white"
                    style={{ fontSize: '12px' }}
                >
                    Updated {new Date(GasUpdated).toTimeString()}
                </p>
                <div className="d-grid">
                    <div
                        className="btn-group"
                        role="group"
                        aria-label="Basic example"
                    >
                        <Button
                            variant="success"
                            disabled={GasSetting === 'slow'}
                            onClick={() => {
                                setGasSetting('slow');
                                const prices = {
                                    ...(Config.getGasPrices() || {
                                        fast: 0,
                                        medium: 0,
                                        slow: 0,
                                    }),
                                };
                                setGasPrice(prices.slow || 0);
                                storageController.setGlobalPreference(
                                    'gasSetting',
                                    'slow'
                                );
                            }}
                        >
                            Slow
                        </Button>
                        <Button
                            variant="warning"
                            disabled={GasSetting === 'medium'}
                            onClick={() => {
                                setGasSetting('medium');
                                const prices = {
                                    ...(Config.getGasPrices() || {
                                        fast: 0,
                                        medium: 0,
                                        slow: 0,
                                    }),
                                };
                                setGasPrice(prices.medium || 0);
                                storageController.setGlobalPreference(
                                    'gasSetting',
                                    'medium'
                                );
                            }}
                        >
                            Medium
                        </Button>
                        <Button
                            variant="danger"
                            disabled={GasSetting === 'fast'}
                            onClick={() => {
                                setGasSetting('fast');
                                const prices = {
                                    ...(Config.getGasPrices() || {
                                        fast: 0,
                                        medium: 0,
                                        slow: 0,
                                    }),
                                };
                                setGasPrice(prices.fast || 0);
                                storageController.setGlobalPreference(
                                    'gasSetting',
                                    'fast'
                                );
                            }}
                        >
                            Fast
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default GasMachine;
