import React, { useState, useRef, useEffect } from 'react';
import { Modal, Form, Col, Row, Button, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import storageController from 'infinitymint-client/dist/src/classic/storageController';
import controller from 'infinitymint-client/dist/src/classic/controller';

function IpfsKeyModal({ show, onHide, onSetTempProject }) {


}

IpfsKeyModal.propTypes = {
    show: PropTypes.bool,
    onHide: PropTypes.func,
};

export default IpfsKeyModal;
