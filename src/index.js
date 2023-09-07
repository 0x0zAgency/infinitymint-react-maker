import React from 'react';
import ReactDOM from 'react-dom';
// Bootstrap js stuff
import 'bootstrap/dist/js/bootstrap.bundle';
// Main website component
import MainComponent from './Website/MainComponent.js';
// Error page
import Error from './Pages/Routeless/Error.js';
import * as ReactConfig from './config';
import classic from 'infinitymint-client/dist/src/classic';

// Custom Awedacity Specific Styles
import './Resources/blockquote.css';
import './Resources/animations.css';
import './Resources/heading-styles.css';
import './Resources/navbar.css';
import './Resources/app.css';
import storageController from 'infinitymint-client/dist/src/classic/storageController.js';

const { controller } = classic;
//Lets go!
(async () => {
    try {
        storageController.loadSavedData();
        await controller.start(ReactConfig);

        // Render react
        ReactDOM.render(<MainComponent />, document.querySelector('#root'));
    } catch (error) {
        ReactDOM.render(
            <Error error={error} />,

            document.querySelector('#root')
        );
    }
})();
