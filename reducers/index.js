import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux'

import auth from './auth';

const App = combineReducers({
  auth,
  routing: routerReducer
});

export default App;
