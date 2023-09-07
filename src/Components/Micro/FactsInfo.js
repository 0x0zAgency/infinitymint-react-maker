import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import NavigationLink from '../NavigationLink.js';
import Controller from 'infinitymint-client/dist/src/classic/controller.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';

const FactsInfo = ({ col }) => (
    <Col lg={col || 12}>
        <Card body className="mt-5">
            <h1 className="mt-5 text-center">The Facts 🤔</h1>
            <h1 className="fs-5 text-center">
                What even is Infinity Mint? Whats a{' '}
                {Controller.getDescription().name}?
            </h1>
            <Row className="p-4 gy-4 mt-4">
                <Col lg={6}>
                    <div className="content">
                        <h1 className="display-6">🖥️ NFT API</h1>
                        <p>
                            We've built into these {resources.tokenPlural()} an
                            on-chain Web3 API which developers many centuries
                            from now will be able to take advantage of. We are
                            doing this is to ensure the launch of the Ethereum
                            Ad Service (EADS.eth), which will enable content
                            owners to control sponsorship and advertising
                            revenues from the their NFTs.
                        </p>
                    </div>
                </Col>
                <Col lg={6}>
                    <div className="content">
                        <h1 className="display-6">&#9854; EVOLVING</h1>
                        <p>
                            We plan on upgrading your NFTs over time to add more
                            functionality as the metaverse progresses. We
                            already have support for bringing your{' '}
                            {resources.tokenPlural()} into game engines, and can
                            update the contract in the future with more
                            functionality.
                        </p>
                    </div>
                </Col>
            </Row>
            <Row className="p-4 gy-4">
                <Col lg={4}>
                    <div className="content">
                        <h1 className="display-6">🔒 Safe & Secure</h1>
                        <p>
                            Our smart contract is really tough! We've ran it
                            through a lot of testing and are confident in its
                            security. Don't believe us? Our Smart Contracts is
                            completely open source, check for yourself!
                        </p>
                    </div>
                </Col>
                <Col lg={4}>
                    <div className="content">
                        <h1 className="display-6">❇️ Sticker Enabled</h1>
                        <p>
                            Implemented through the{' '}
                            <a
                                href="https://eads.tech"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Ethereum Ad Service
                            </a>
                            , stickers are a new way to earn profit from your
                            NFTs by allowing people to virtually add a sticker
                            to your NFT for a price you can set.
                        </p>
                    </div>
                </Col>
                <Col lg={4}>
                    <div className="content">
                        <h1 className="display-6">⛓️ Multi-Chain</h1>
                        <p>
                            Don't like Polygon? Well we currently support...
                            <br />
                            <code>Rinkeby, Polygon, Mumbai, Ethereum</code>
                            <br />
                            And yes, we will be adding more in the future!
                        </p>
                    </div>
                </Col>
            </Row>
            <Row className="p-2">
                <Col>
                    <div className="d-grid">
                        <NavigationLink
                            location="/mint"
                            text={resources.$.UI.Action.CreateToken}
                            variant="dark"
                        />
                    </div>
                </Col>
            </Row>
        </Card>
    </Col>
);

export default FactsInfo;
