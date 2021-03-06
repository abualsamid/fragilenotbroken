import React from 'react';
import { connect } from 'react-redux'
import _ from 'lodash'
import behaviors, {redStyle, greenStyle, redStyleSelected, greenStyleSelected} from './behaviors'
import {  submitInterventionResponse } from '../utils/fb/timeline'
import  log  from '../utils/log'
import Intervention from './interventions'
import { getTodaysRed } from '../utils/fb/timeline'
import { getMediaModels } from '../utils/fb/timeline'
import { MediaPreview } from './MediaPreview'
const SECOND = 1000
const MINUTE = 60*SECOND
const HOUR = 60*MINUTE
const DAY = 24*HOUR

// const Media = ({src}) => {
//   const u= src.split('?')[0]
//   switch(u.split('.').pop().toLowerCase()) {
//     case "mov":
//       return (
//         <div>
//           <video controls="controls" src={src} style={{maxWidth: "50%"}} />
//         </div>
//       )
//     default:
//       return (
//         <div>
//           <img src={src} style={{maxWidth: "50%"}} />
//         </div>
//       )
//
//   }
// }

const Behavior = b => (
  <div>
    {
      b
      &&
      Object.keys(b).map(
        key => {
          let v = b[key]
          if (v.value!==0) {
            let cName=v.value>0?"text-success":"text-danger"
            let iName=v.value>0?"fa fa-thumbs-o-up":"fa fa-thumbs-o-down"
            return (
              <span key={key} className={cName} style={{paddingRight:"1em", paddingLeft: "1em"}}>
                <i className={iName}> </i>
                &nbsp;
                {v.caption}
              </span>
            )

          }
        }
      )
    }
  </div>
)

const hasRedBehavior = b => {
  if(!b) {
    return false
  }
  let v = false
  _.forEach(b, (value, key) => {
    if (value.value<0) {
      v = true
    }
  })
  return v
}

const InterventionResult = i => {
  if (!i) {
    return null
  }
  const one = i[Object.keys(i)[0]]
  const values = ["No Change", "Stopped Red Thought", "Shorter/Milder", "Longer/Stronger"]
  return (
    <div className="row">
      <hr style={{color:"black", borderTop: "1px solid black"}}/>
      <div className="col-xs-12 col-md-12">
          <strong>intervention</strong> @ {new Date(one.timestamp).toString()} => {values[one.response]}
      </div>
    </div>
  )
}


const DisplayInterventions = (viewPersonId, one,interventionKey,red,timestamp, cb) => {

  if(timestamp < (Date.now()-DAY)  ) {
    return null
  }
  if (one==interventionKey) {
    return (
      <div className="row">
        <div className="col-xs-12 col-md-12">
          <Intervention red={red} onResponse={
              choice=> {
                submitInterventionResponse(viewPersonId, interventionKey, choice)
                cb("",0)
              }
            } />
        </div>
      </div>
    )
  }

  return (
    <div className="row">
      <div className="col-xs-12 col-md-12">
          <button className="btn btn-danger" href="#" onClick={ e =>cb(one,timestamp)}>
            <i className="fa fa-sign-language fa-lg"> </i> { } Intervention
          </button>
      </div>
    </div>
  )
}



class TimeLine extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      interventionKey: ""
    }
    this._selectIntervention = this._selectIntervention.bind(this)
  }



  _selectIntervention(chosen, timestamp) {
    const self = this

    if (chosen) {
      this.setState({interventionKey: chosen})
      getTodaysRed(self.props.viewPersonId, timestamp,
        red => this.setState({red})
      )
    } else {
      this.setState({interventionKey: "", red: 0 })
    }

  }

  render() {
    const self = this
    function mood(m) {
      switch(m) {
        case 0:
          return null;
        case 1:
          return <img src="img/angry.svg" style={{width:"25px", marginRight:"1em"}} />
        case 2:
          return <img src="img/happy.svg" style={{width:"25px", marginRight:"1em"}} />
        case 3:
          return <img src="img/crying.svg" style={{width:"25px", marginRight:"1em"}} />
      }
    }
    if(!this.props.timeLine) {
      return <div>.</div>
    }
    return (
      <div>
        {
          _.reverse(Object.keys(this.props.timeLine)).map(
            (one, i ) => {
              const e = this.props.timeLine[one]
              return (
                <div key={i} style={ {padding:"1em",marginBottom:"1em",
                              marginTop:"1em", border:"1px solid gray",
                              backgroundColor: i%2?"white":"#eee" } }>
                  <div key={e.date || i }>
                    <div className="row">
                      <div className="col-xs-3 col-md-1">
                        <img src={e.postedByPhotoURL  || "/img/generic.jpg"} alt={e.postedByDisplayName || ""}
                          title={e.postedByDisplayName || ""}
                          style={{maxWidth:"100%", width:"100%"}} />
                      </div>
                      <div className="col-xs-9 col-md-11">
                        <div>
                          { e.postedByDisplayName || ""}
                          { }
                          &nbsp;
                          {one}
                        </div>
                        <div>
                          <span style={{fontSize:"small", fontWeight:"light"}}>
                            {
                              (new Date(e.date)).toString()
                            }
                          </span>
                        </div>
                        <div>
                          {mood(e.mood)}
                        </div>
                      </div>
                    </div>
                    <br/>
                    <div className="row">
                      <div className="col-xs-12 col-md-12">
                        {e.message}
                      </div>
                    </div>
                    <br/>
                    <div className="row">
                      <div className="col-xs-12 col-md-12">
                        {
                          e.mediaURL &&
                            <MediaPreview src={e.mediaURL} type={e.mediaFileType} />
                        }
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-12 col-md-12">
                        {Behavior(e.behaviors)}
                      </div>
                    </div>
                    <hr style={{color:"black", borderTop: "1px solid black"}}/>
                    {
                      hasRedBehavior(e.behaviors)
                      &&
                      DisplayInterventions(self.props.viewPersonId, one, this.state.interventionKey,this.state.red, e.date,this._selectIntervention)
                    }

                    {
                      this.props.interventions
                      && this.props.interventions[one]
                      && InterventionResult(this.props.interventions[one])

                    }
                  </div>
                </div>
              )
            }
          )
        }
      </div>
    )
  }
}


export default connect(
  (state, ownProps) => {
    return {
      user: state.auth.user,
      viewPersonId: state.auth.viewPersonId,
      viewPerson: state.auth.viewPerson,
      timeLine: state.auth.timeLine[state.auth.viewPersonId],
      interventions: state.auth.interventions[state.auth.viewPersonId] || {},
      timestamp: state.auth.timestamp
    }
  }
)(TimeLine)
