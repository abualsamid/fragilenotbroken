// polyfill webpack require.ensure
if (typeof require.ensure !== 'function') require.ensure = (d, c) => c(require)


export default {
  path: 'students',
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('../components/students').default)
    })
  }

}
