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
    firebase
    .database()
    .ref("people/" + this.props.student.key + "/timeline")
    .on("value",
      (snapshot) => {
        let all = []
        for(var key in snapshot.val()) {
          all.unshift(snapshot.val()[key])
        }
        console.log('all ', all )
        self.setState({timeline: all})
      }
    )
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
              <strong className={current.txtStyle} style={{paddingRight:"1em", paddingLeft: "1em"}} >{current.caption}</strong>
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
                <div key={i}><br/></div>
                <div key={e.date}>
                  {
                    (new Date(e.date)).toString()
                  }

                  <br/>
                  <br/>
                  {mood(e.mood)}
                  {behavior(e.behavior)}

                  <br/>
                  <br/>
                  {e.message}
                  <br/>
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
    console.log('connecting time state ', state)
    return {
      user: state.auth.user,
      student: state.students.student
    }
  },
  {
    onLogout: () => ({
      type:"logout", user: null, isAuthenticated: false, credentials: null
    }),
    selectStudent: (student) => ({
      type:"selectStudent", student: student
    }),

  }
)(TimeLine)
