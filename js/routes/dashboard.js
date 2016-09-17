// polyfill webpack require.ensure
// if (typeof require.ensure !== 'function') require.ensure = (d, c) => c(require)

export default {
  path: 'dashboard',
  getComponent(nextState, cb) {
    console.log('inside get compoment for dahs.')
    require.ensure([], (require) => {
      console.log('ensuring ../dashboard ', nextState, cb )
      cb(null, require('../dashboard').default)
    })
  }
}
