import React from 'react';
import { Form } from 'react-bootstrap';
import controller from 'infinitymint-client/dist/src/classic/controller.js';
import Config from '../../config.js';
import GasMachine from '../GasMachine.js';

// Micro components have no props
const PreviewMint = () => (
    <>
        <p>
            Preview minting gives you a selection of tokens which you can then
            turn into a real token.
        </p>
        <GasMachine gasUsage={Config.gasLimit.preview} />
        <div className="d-grid mt-2 gy-2 gap-2">
            <Form.Control
                type="text"
                size="lg"
                placeholder="Just the gas"
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

export default PreviewMint;
