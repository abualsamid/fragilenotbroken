import React from 'react';
import { render } from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import throttle from 'lodash/throttle';
import { loadState, saveState } from './utils/localStorage';
import reducers from './reducers'
import Routes from './routes/'


const persistedState = loadState();

// Add the reducer to your store on the `routing` key
const store = createStore(
  reducers   ,
  persistedState
)


store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)


render(
  (
    <Provider store={store}>
      <Router routes={Routes} history={history} />
    </Provider>
  ),
  document.getElementById('root')
)
