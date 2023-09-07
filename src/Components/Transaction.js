import React, { useState, useEffect } from 'react';
import { Button, Offcanvas, Alert } from 'react-bootstrap';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import Config from '../config.js';
import Loading from './Loading.js';

export default function Transaction({ element, show, title, onHide, onClick }) {
    const [loading, setLoading] = useState(false);
    const [lostTx, setLostTx] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    let isUnmounted = false;

    const confirm = async () => {
        if (!isUnmounted) {
            setLoading(true);
        }

        let hasRan = false;
        const timeout = setTimeout(() => {
            if (!hasRan) {
                setLostTx(true);
            }
        }, 10_000 * Config.settings.txWait);
        try {
            await onClick();
            hasRan = true;
        } catch (error) {
            if (!isUnmounted) {
                setErrorMessage(error[0]?.message || error.message);
            }
        } finally {
            if (!isUnmounted) {
                setLoading(false);
            }

            clearTimeout(timeout);
        }
    };

    useEffect(
        () => {},
        [],
        () => {
            isUnmounted = true;
        }
    );

    return (
        <>
            <Offcanvas
                show={show}
                placement="start"
                onHide={() => {
                    if (loading) {
                        return;
                    }

                    setErrorMessage(null);
                    setLostTx(false);
                    onHide();
                }}
            >
                {loading ? (
                    <Offcanvas.Header>
                        <Offcanvas.Title className="fs-3">
                            Moving Blocks 🧱{' '}
                            <span className="badge bg-info">
                                Please Wait...
                            </span>
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                ) : (
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title className="fs-3">
                            Moving Blocks 🧱
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    
                )}
                <Offcanvas.Body>
                <div className="d-grid gap-2 mt-2">
                        <Button
                            variant="success"
                            size="lg"
                            disabled={loading}
                            onClick={() => {
                                setErrorMessage(null);
                                confirm();
                            }}
                        >
                            {resources.$.UI.Action.Accept}
                        </Button>
                        
                    </div>
                    {!loading ? (
                        <div className="d-grid">{element}</div>
                    ) : (
                        <div className="mb-4">
                            <Loading settings={{ smallerFont: true }} />
                        </div>
                    )}
                    {errorMessage !== null ? (
                        <Alert variant="danger" className="mt-3 text-center">
                            <p className="display-2">😨</p>
                            {errorMessage}
                        </Alert>
                    ) : (
                        <></>
                    )}
                    {lostTx !== false && errorMessage === null ? (
                        <Alert variant="danger" className="mt-3 text-center">
                            <p className="display-2">💔</p>
                            <p>
                                It appears we might have lost your transaction.
                                But don't worry!
                                <br />
                                <br />
                                Check your wallet to see if the transaction has
                                been mined yet. If it has, click the button
                                below.
                            </p>
                            <p>
                                The site will might update automatically, if not
                                just refresh until it appears.
                            </p>
                            <br />
                            <u>
                                Hold off on minting/previewing until the
                                original tx moves else you might get a revert!
                            </u>
                            <div className="d-grid mt-2">
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        onHide();
                                        setErrorMessage(null);
                                    }}
                                >
                                    {resources.$.UI.Action.Close}
                                </Button>
                            </div>
                        </Alert>
                    ) : (
                        <></>
                    )}
                    <div className="d-grid gap-2 mt-2">
                        <Button
                            variant="success"
                            size="lg"
                            disabled={loading}
                            onClick={() => {
                                setErrorMessage(null);
                                confirm();
                            }}
                        >
                            {resources.$.UI.Action.Accept}
                        </Button>
                        <Button
                            variant="danger"
                            size="lg"
                            disabled={loading}
                            onClick={async () => {
                                setErrorMessage(null);
                                onHide();
                            }}
                        >
                            {resources.$.UI.Action.Reject}
                        </Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}
