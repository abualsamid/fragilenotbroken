// polyfill webpack require.ensure
if (typeof require.ensure !== 'function') require.ensure = (d, c) => c(require)

// http://henleyedition.com/implicit-code-splitting-with-react-router-and-webpack/


// https://medium.com/@ryanflorence/welcome-to-future-of-web-application-delivery-9750b7564d9f#.tl49hltmv

export default {
  path: '/',
  getComponents(nextState, cb) {
    // webpack will put it in a different "chunk" file
    // and load it when this gets called
    require.ensure([],
      require => {
        cb(null, require('../App').default)
      }
    )
  },
  getChildRoutes(partialNextState, cb) {
    require.ensure([], (require) => {
      console.log('123')
      cb(null, [
        require('./dashboard').default,
        require('./addBehavior').default,
        require('./students').default,
        require('./chat/').default,
      ])
    })
  },
  getIndexRoute(partialNextState, callback) {
    require.ensure([], function (require) {
      callback(null, {
        component: require('../root').default,
      })
    })
  }
}
