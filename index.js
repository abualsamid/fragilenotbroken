import React from 'react';
import { render } from 'react-dom';
import { match, Router, Route, browserHistory, IndexRoute } from 'react-router';
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux'
import throttle from 'lodash/throttle';


import App from './js/App';
import Root from './js/root'
import Dashboard from './js/dashboard'
import AddBehavior from './js/components/addBehavior'
import Students from './js/components/students'
import Routes from './js/routes/'

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
  reducers   ,
  persistedState
)


store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)

const rootRoute = {
  childRoutes: [ {
    path: '/',
    // component: require('./js/App').default,
    getComponents(nextState, callback) {
      require.ensure([], function (require) {
        callback(null, require('./js/App').default)
      })
    },
    getIndexRoute(partialNextState, callback) {
      require.ensure([], function (require) {
        callback(null, {
          component: require('./js/root').default,
        })
      })
    },


    childRoutes: [
      require('./js/routes/dashboard').default,
      require('./js/routes/students').default,
      require('./js/routes/addBehavior').default,
    ]
  } ]
}


render(
  (
    <Provider store={store}>
      <Router routes={Routes} history={history} />
    </Provider>
  ),
  document.getElementById('root')
)


//
// render(
//   (
//     <Provider store={store}>
//       <Router history={history} >
//         <Route path="/" component={App}>
//           <IndexRoute component={Root} />
//           <Route path="/dashboard" component={Dashboard} />
//           <Route path="/addBehavior" component={AddBehavior} />
//           <Route path="/students" component={Students} />
//         </Route>
//       </Router>
//     </Provider>
//   ),
//   document.getElementById('root')
// )

/*
<Router history={history} >
  <Route path="/" component={App}>
    <IndexRoute component={Root} />
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/addBehavior" component={AddBehavior} />
    <Route path="/students" component={Students} />
  </Route>
</Router>
*/
