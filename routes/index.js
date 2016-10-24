// polyfill webpack require.ensure
if (typeof require.ensure !== 'function') require.ensure = (d, c) => c(require)

// http://henleyedition.com/implicit-code-splitting-with-react-router-and-webpack/


// https://medium.com/@ryanflorence/welcome-to-future-of-web-application-delivery-9750b7564d9f#.tl49hltmv

export default {
  path: '/',
  getComponent(nextState, cb) {
    // webpack will put it in a different "chunk" file
    // and load it when this gets called
    require.ensure([],
      require => {
        cb(null, require('../components/App').default)
      }
    )
  },
  getChildRoutes(partialNextState, cb) {
    require.ensure([], (require) => {
      cb(null, [
        require('./dashboard').default,
        require('./addBehavior').default,
        require('./students').default,
        require('./chat/').default,
      ])
    })
  },
  getIndexRoute(partialNextState, callback) {
    require.ensure([], (require) => {
      callback(null, {
        component: require('../components/root').default,
      })
    })
  }
}
