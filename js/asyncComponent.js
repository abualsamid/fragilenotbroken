import React from 'react';

export default class AsyncComponent extends React.Component {
    constructor(props) {
      console.log('in async component constructor')
      super(props)
      this.state = {
        component: null
      }
    }
    componentDidMount() {
        this.props.loader((componentModule) => {
          console.log('in async component cdm ', componentModule)
          this.setState({
              component: componentModule.default
          });
        });
    }
    renderPlaceholder() {
      return <div className="container" style={{textAlign:"center"}}>
        <img src='./img/splash.jpg' width="85%" />
      </div>
    }
    render() {
      console.log('render in async ', this.state)

      if (this.state.component) {
        console.log('rendering component...')
        return <this.state.component {...this.props} />
      }
      return (this.props.renderPlaceholder || this.renderPlaceholder)();
    }
}

AsyncComponent.propTypes = {
    loader: React.PropTypes.func.isRequired,
    renderPlaceholder: React.PropTypes.func
};
