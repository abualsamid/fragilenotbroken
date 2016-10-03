import React from 'react';








export default class AddBehavior extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      behaviors: {}
    }
    this._isSelected = this._isSelected.bind(this)
    this._select = this._select.bind(this)
  }





  _isSelected(key,dir) {
    if (!this.state.behaviors[key] || this.state.behaviors[key].value==0) {
      return "fa fa-square-o"
    }
    if (this.props.behaviors[key] ) {
      if (dir>0 &&  this.props.behaviors[key].value>0) {
        return "fa fa-check-square-o"
      }
      if (dir<0 &&  this.props.behaviors[key].value<0) {
        return "fa fa-check-square-o"
      }

    }
    return "fa fa-square-o"
  }
  _select(key, delta) {
    const self = this
    let news = Object.assign({}, self.state.behaviors)

    if(news[key]) {
      news[key] = news[key]==delta ? 0 : delta
    } else {
      news[key] = delta

    }
    self.setState({behaviors: news})
    self.props.onChange(key, delta)
    return


  }


  render() {
    const self = this

    return (
      <div>
        {
          Object.keys(this.props.behaviors).map(
            key =>
            <div className="row" key={key}>
              <div className="col-xs-4">
                {this.props.behaviors[key].caption}
              </div>
              <div className="col-xs-8">
                <div className="btn-toolbar" role="toolbar">
                  <div className="btn-group" role="group">
                    <button type="button" className="btn btn-success" onClick={ e => this._select(key,1)} style={{width: "4em"}}>
                      <i className={this._isSelected(key,1)} ></i>
                      &nbsp;
                      <i className="fa fa-thumbs-o-up"></i>
                    </button>

                  </div>
                  &nbsp;

                  <div className="btn-group" role="group">
                    <button type="button" className="btn btn-danger" onClick={e=> this._select(key,-1)} style={{width: "4em"}}>
                      <i className={this._isSelected(key,-1)} ></i>
                      &nbsp;
                      <i className="fa fa-thumbs-o-down"></i>
                    </button>

                  </div>
                </div>
              </div>
            </div>
          )

        }
      </div>

    )

  }
}
