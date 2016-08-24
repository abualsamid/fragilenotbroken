import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux'

import auth from './auth';
import students from './students'

const App = combineReducers({
  auth,
  students,
  routing: routerReducer
});

export default App;
