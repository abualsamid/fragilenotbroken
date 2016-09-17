import log from './log'
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }

    let x =  JSON.parse(serializedState);
    x.delete(routing)
    return x
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    if (state && state.auth && state.auth.isAuthenticated) {
      localStorage.setItem('state', JSON.stringify(state));
    } else {
      localStorage.removeItem('state');
    }
  } catch (err) {
    console.log('error saving store to local storage: ', err , state )
    // Ignore write errors.
  }
};
