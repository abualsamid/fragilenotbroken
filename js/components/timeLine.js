import React from 'react';
import { connect } from 'react-redux'
import behaviors, {redStyle, greenStyle, redStyleSelected, greenStyleSelected} from './behaviors'

class TimeLine extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      timeline:[]
    }
  }
  componentWillMount() {
    const self = this
    try {
      if(self.props && self.props.viewPersonId ) {
        console.log('retrieving time line for ', self.props.viewPersonId)
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
          return <img src="img/angry.svg" style={{width:"25px", marginRight:"1em", marginLeft:"1em"}} />
        case 2:
          return <img src="img/happy.svg" style={{width:"25px", marginRight:"1em", marginLeft:"1em"}} />
        case 3:
          return <img src="img/crying.svg" style={{width:"25px", marginRight:"1em", marginLeft:"1em"}} />


      }
    }
    function behavior(b) {
      switch(b) {
        case 0:
          return null;
        default:
          return behaviors.reduce(
            (prev, current, index, array) => current.value==b
              ?
              <span className={current.txtStyle} style={{paddingRight:"1em", paddingLeft: "1em"}} >{current.caption}</span>
              :
              prev
            ,
            ""
          )
      }
    }
    return (
      <div>
        {
          this.state.timeline.map(
            (e, i ) => (
              <div key={i} style={{padding:"2em",marginBottom:"1em", marginTop:"1em", border:"1px solid gray", backgroundColor: i%2?"white":"#eee" }}>
                <div key={e.date}>
                  <div>
                    <span style={{fontSize:"small", fontWeight:"light"}}>
                      {
                        (new Date(e.date)).toString()
                      }
                    </span>

                  </div>
                  <br/>
                  <div>
                    {e.message}

                  </div>
                  <br/>
                  {
                    e.mediaURL &&
                    <div>
                      <img src={e.mediaURL} style={{maxWidth: "50%"}} />
                    </div>
                  }
                  <br/>
                  {mood(e.mood)}
                  {behavior(e.behavior)}
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
