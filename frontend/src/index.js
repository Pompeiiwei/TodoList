import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AppContextProvider } from './AppContextProvider';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import dayjs from 'dayjs';
import DayjsUtils from '@date-io/dayjs';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

//Task 1
import { Auth0Provider } from '@auth0/auth0-react';
import { getConfig } from './config';
import { createBrowserHistory } from 'history';
const onRedirectCallback = (appState) => {
  createBrowserHistory().push(
    appState && appState.returnTo ? appState.returnTo : window.location.pathname
  );
  // window.location.reload();
};
const config = getConfig();
const providerConfig = {
  domain: config.domain,
  clientId: config.clientId,
  ...(config.audience ? { audience: config.audience } : null),
  redirectUri: window.location.origin,
  onRedirectCallback,
};

const relativeTime = require('dayjs/plugin/relativeTime');
const localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

ReactDOM.render(
  <Auth0Provider {...providerConfig}>
    <MuiPickersUtilsProvider utils={DayjsUtils}>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </MuiPickersUtilsProvider>
  </Auth0Provider>,
  document.getElementById('root')
);

// Change to "register()" to enable service workers (production only)
serviceWorkerRegistration.unregister();
