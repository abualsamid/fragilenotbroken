import React from 'react';
import { connect } from 'react-redux'
import {speak} from '../utils/speak'
import map from 'lodash/map'

import { MediaPreview } from './MediaPreview'


class VisualModel extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      chosen: "0"
    }
  }
  render() {
    const {red, onResponse} = this.props
    const self = this
    return (
      <div className="text-center" >
        <div onClick={ e => speak(red) } >
          <span style={{color:'red', fontSize: '20rem'}}>
            {red}
          </span>
          <br/>
            {(function (rows, i, len) {
                while (++i <= len) {
                  rows.push(<i key={i} className="fa fa-thumbs-o-down" style={{color: 'red', fontSize: '5rem', textShadow: '1px 1px 1px #ccc'}}> &nbsp; </i>)
                }
                return rows;
            })([], 0, red)}

        </div>
        <br/>
        {
          self.props.interventionModels &&
          map(self.props.interventionModels,
            m => (
              <div>
                <strong>{m.caption}</strong>
                <br/>
                <MediaPreview src={m.url}  />
                <br/>
              </div>
            )
          )
        }
        {
          <div>
            <div className="form-group">
              <label>Response</label>
              <select className="form-control"  value={this.state.chosen}
                onChange={e => this.setState({chosen: e.target.value})}>
                <option value="0">No Change</option>
                <option value="1">Stopped Red Thought</option>
                <option value="2">Shorter/Milder</option>
                <option value="3">Longer/Stronger</option>
              </select>
            </div>
            <button className="btn btn-block btn-primary" onClick={ e => {onResponse(self.state.chosen)} }>
              Submit Response
            </button>
          </div>

        }
      </div>
    )
  }

}


const Intervention = props => {
  return(
    <div>
      <VisualModel {...props} />
    </div>
  )
}


export default connect(
  (state, ownProps) => {
    return {
      user: state.auth.user,
      viewPersonId: state.auth.viewPersonId,
      viewPerson: state.auth.viewPerson,
      interventionModels: state.auth.interventionModels
    }
  }

)(Intervention)
