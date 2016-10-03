import React from 'react';
import { connect } from 'react-redux'
import behaviors, {redStyle, greenStyle, redStyleSelected, greenStyleSelected} from './behaviors'

const Media = ({src}) => {
  const u= src.split('?')[0]
  switch(u.split('.').pop().toLowerCase()) {
    case "mov":
      return (
        <div>
          <video controls="controls" src={src} style={{maxWidth: "50%"}} />
        </div>
      )
    default:
      return (
        <div>
          <img src={src} style={{maxWidth: "50%"}} />
        </div>
      )

  }
}

class TimeLine extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timeline:[]
    }
  }
  
  componentDidMount() {
    const self = this
    try {
      if(self.props && self.props.viewPersonId ) {
        firebase
        .database()
        .ref("people/" + this.props.viewPersonId + "/timeline")
        .on("value",
          (snapshot) => {
            let all = []
            for(var key in snapshot.val()) {
              all.unshift(snapshot.val()[key])
            }
            self.setState({timeline: all})
          }
        )
      }
    } catch(x) {
      console.log(x)
    }


  }
  render() {
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
    function behavior(b) {
      if (!b) {
        return null
      }

      return <div>
        {
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
      //
      // switch(b) {
      //   case 0:
      //     return null;
      //   default:
      //     return behaviors.reduce(
      //       (prev, current, index, array) => current.value==b
      //         ?
      //         <span className={current.txtStyle} style={{paddingRight:"1em", paddingLeft: "1em"}} >{current.caption}</span>
      //         :
      //         prev
      //       ,
      //       ""
      //     )
      // }
    }
    return (
      <div>
        {
          this.state.timeline.map(
            (e, i ) => (
              <div key={i} style={{padding:"1em",marginBottom:"1em", marginTop:"1em", border:"1px solid gray", backgroundColor: i%2?"white":"#eee" }}>
                <div key={e.date}>
                  <div className="row">
                    <div className="col-xs-3 col-md-1">
                      <img src={e.postedByPhotoURL  || "/img/generic.jpg"} alt={e.postedByDisplayName}
                        title={e.postedByDisplayName}
                        style={{maxWidth:"100%", width:"100%"}} />
                    </div>
                    <div className="col-xs-9 col-md-11">
                      <div>
                        { e.postedByDisplayName || ""}
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
                  {
                    e.mediaURL &&
                      <Media src={e.mediaURL} />
                  }
                  <br/>
                  {behavior(e.behaviors)}
                  <br/>

                </div>
              </div>
            )
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
      viewPerson: state.auth.viewPerson
    }
  }
)(TimeLine)
