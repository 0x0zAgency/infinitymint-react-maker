import React from 'react';
import { ListGroup, Form, Alert, Button, Card } from 'react-bootstrap';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Config from '../../config.js';
import resources from 'infinitymint-client/dist/src/classic/resources.js';
import GasMachine from '../GasMachine.js';

// Micro components have no props
const InstantMint = () => (
    <>
        <GasMachine gasUsage={Config.gasLimit.mint} />
        <div className="d-grid mt-2 gap-2">
            <Form.Control
                type="text"
                size="lg"
                placeholder={
                    controller.accounts[0] !==
                    controller.getProjectSettings().deployer
                        ? controller.getContractValue('getPrice') +
                          Config.getNetwork().token
                        : 'FREE FOR YOU'
                }
                readOnly
            />
            <Form.Control
                type="text"
                size="sm"
                placeholder={Config.getNetwork().name}
                readOnly
            />
            <Form.Control
                type="text"
                size="sm"
                placeholder={controller.accounts[0]}
                readOnly
            />
        </div>
    </>
);

export default InstantMint;
