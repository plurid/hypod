import React from 'react';
import ReactDOM from 'react-dom';

import Client from './Client';



/** Uncomment to use the service worker caching the static vendor.js and favicons */
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/service-worker.js');
// }

const performerApp = document.getElementById('performer-application');


ReactDOM.hydrate(
    <Client />,
    performerApp,
);
