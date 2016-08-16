import React from 'react';
import AsyncComponent from './asyncComponent';
import scheduleLoad from './loader';

// const loader = (cb) => {
//   require.ensure([], (require) => {
//       cb(require('./login'))
//   });
// }
//
// scheduleLoad(loader);

export default class Async extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const component = this.props.component
    const loader = (cb) => {

      setTimeout(() => {
        require.ensure([], (require) => {
          cb(require('./' + component))
        })
      }, 3000)

      // require.ensure([], (require) => {
      //   cb(require('./' + component))
      // });
    }
    scheduleLoad(loader);
    return <AsyncComponent {...this.props} loader={loader}/>
  }
}
