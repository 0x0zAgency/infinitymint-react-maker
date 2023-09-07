import React, { useEffect } from 'react';
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';

const CharacterSet = [
    '♾️',
    '🪞',
    '🟨',
    '☀️',
    '🎧',
    '📁',
    '🗄️',
    '🚕',
    '⛽',
    '✈️',
    '🗿',
    '🪐',
    '🛸',
    '🚀',
    '🌈',
];
let Count = [];
let hasUnmounted = false;
let timeout;
const AddEmoji = (settings) => {
    // Keep icons below the max icons limit
    if (Count.length >= (settings?.maxIcons || 246)) {
        Count[0].remove();
        Count = Count.slice(1);
    }

    const id = document.querySelector('#loadingIcons');
    if (id === null) {
        return 2;
    }

    const elm = document.createElement('p');
    elm.innerHTML =
        Object.values(CharacterSet)[
            Math.floor(Math.random() * CharacterSet.length)
        ];

    if (Math.floor(Math.random() * 100) < 25) {
        elm.innerHTML = `<span class='loadingIconEquipable'>${'☂️'}</span>${
            elm.innerHTML
        }`;
    }

    if (Math.floor(Math.random() * 100) < 10) {
        elm.innerHTML = `<span class='loadingIconEquipable' style='margin-top: 2px !important; margin-left: -12px !important'>${'🔫'}</span>${
            elm.innerHTML
        }`;
    }

    if (Math.floor(Math.random() * 100) < 5) {
        elm.innerHTML = `<span class='loadingIconEquipable' style='margin-top: 10px !important; margin-left: 10px !important'>${'✏️'}</span>${
            elm.innerHTML
        }`;
    }

    elm.className = 'loadingIcon';
    elm.style.paddingTop =
        Math.floor(Math.random() * (settings?.range || 100)).toString() + 'px';
    elm.style.animationDuration =
        Math.max(
            settings?.minSpeed || 15,
            Math.floor(Math.random() * (settings?.speed || 30))
        ).toString() + 's';

    try {
        id.append(elm);
        Count.push(elm);
    } catch {}

    return Math.random() * (settings?.maxWaitTime || 64);
};

const startLoop = (SaveSettings) => {
    timeout = (seconds = 1) => {
        seconds = Math.max(1, seconds);
        setTimeout(() => {
            if (!hasUnmounted) {
                timeout(AddEmoji(SaveSettings));
            }
        }, seconds * 1000);
    };

    timeout();
};

const Loading = ({
    settings,
    loadingReason,
    showLoadingBar,
    loadingPercentage,
    disableMargin = false,
}) => {
    useEffect(
        () => {
            startLoop(settings);
        },
        [settings],
        () => {
            hasUnmounted = true;
            for (const value of Count) {
                try {
                    value.remove();
                } catch {}
            }

            Count = [];
        }
    );

    if (hasUnmounted) {
        return <></>;
    }

    return (
        <Row className={'text-center ' + (disableMargin ? '' : 'mt-4')}>
            <Col>
                <Card
                    body
                    style={{ overflow: 'hidden' }}
                    className="bg-dark text-white"
                >
                    <Row className="justify-content-center mt-4 mb-4 ">
                        <Col lg={2}>
                            {/* <img src={Config.getImage("loading")} alt="loading" className="mx-auto img-fluid d-none d-lg-block d-xl-block" /> */}
                        </Col>
                    </Row>
                    <Row className="justify-content-center mt-4 mb-2">
                        <Col>
                            {loadingReason !== undefined &&
                            loadingReason !== null ? (
                                <p className="fs-3 force-white">
                                    {loadingReason}
                                </p>
                            ) : (
                                <></>
                            )}
                            <p
                                className={
                                    (settings?.smallerFont
                                        ? 'display-6'
                                        : 'display-5') +
                                    ' p-0 mb-4 pb-4  force-white'
                                }
                                style={{
                                    
                                    textShadow: '0px 0px 10px gold',
                                }}
                            >
                                Please Wait
                                <span
                                    className="spinText d-block"
                                    style={{
                                        position: 'absolute',
                                        fontSize: settings?.smallerFont
                                            ? 16
                                            : 32,
                                        marginTop: settings?.smallerFont
                                            ? 30
                                            : 0,
                                        marginLeft: 4,
                                    }}
                                >
                                    🔨
                                </span>
                            </p>
                            {showLoadingBar &&
                            loadingPercentage !== undefined &&
                            !isNaN(loadingPercentage) ? (
                                <div className="d-grid mt-4 pt-4">
                                    <ProgressBar now={loadingPercentage} />
                                </div>
                            ) : (
                                <></>
                            )}
                        </Col>
                    </Row>
                    <div
                        className="d-block mt-2"
                        id="loadingIcons"
                        style={{
                            position: 'relative',
                            top:
                                settings?.top || (-settings?.range || -100) * 2,
                        }}
                    ></div>
                </Card>
            </Col>
        </Row>
    );
};

export default Loading;
