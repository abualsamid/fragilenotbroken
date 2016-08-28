import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import throttle from 'lodash/throttle';


import App from './js/App';
import AddBehavior from './js/components/addBehavior';
import Students from './js/components/students'
import Dashboard from './js/dashboard'
import Root from './js/root';

function log(...a) {
  try {
    if (process.env.NODE_ENV=="development") {
      console.log(a)
    }
  } catch(x) {
    console.log(x)
  }
}

import { loadState, saveState } from './js/localStorage';

import reducers from './js/reducers'


const persistedState = loadState();

// Add the reducer to your store on the `routing` key
const store = createStore(

  reducers,
  persistedState
)


store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)

render((
  <Provider store={store}>
    <Router history={history} >
      <Route path="/" component={App}>
        <IndexRoute component={Root} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/addBehavior" component={AddBehavior} />
        <Route path="/students" component={Students} />
      </Route>
    </Router>
  </Provider>
), document.getElementById("root"))
