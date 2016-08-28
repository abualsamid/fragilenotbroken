import React from 'react';
import { connect } from 'react-redux'
import log from '../log'
import behaviors, {redStyle, greenStyle, redStyleSelected, greenStyleSelected} from './behaviors'

class Add extends React.Component {
  constructor(props) {
    super(props)
    this._add = this._add.bind(this)
    this._selectMood=this._selectMood.bind(this)
    this.state= {
      moods: [
        {
          caption: "n/a",
          selected: false,
          value: 0
        },
        {
          caption: "Angry",
          selected: false,
          value: 1,
          src: 'img/angry.svg',
          style:""
        },
        {
          caption: "Happy",
          selected: false,
          value: 2,
          src: 'img/happy.svg',
          style:""
        },
        {
          caption: "Sad",
          selected: false,
          value: 3,
          src: 'img/crying.svg',
          style:""
        }
      ],
      behaviors: behaviors
    }
  }
  _add() {
    log('doing it.')
    let mood = 0
    let behavior = 0
    let mediaURL = ""

    this.state.moods.forEach(
      (m) => {
        if(m.selected) {
          mood = m.value
        }
      }
    )
    this.state.behaviors.forEach(
      (b) => {
        if(b.selected) {
          behavior=b.value
        }
      }
    )

    const newKey = firebase
    .database()
    .ref("people/" + this.props.student.key + "/timeline")
    .push()
    .key

    let updates = {}
    updates["people/" + this.props.student.key + "/timeline/" + newKey ] = {
      date: firebase.database.ServerValue.TIMESTAMP, // new Date(timestamp).getTime();
      message: this.state.message,
      mood: mood,
      behavior: behavior,
      mediaURL: ""
    }

    if (mood) {
      updates["people/" + this.props.student.key + "/mood/" + newKey ] = {
        date: firebase.database.ServerValue.TIMESTAMP, // new Date(timestamp).getTime();
        message: this.state.message,
        mood: mood,
        behavior: behavior,
        mediaURL: ""
      }

    }
    if (behavior) {
      updates["people/" + this.props.student.key + "/behavior/" + newKey ] = {
        date: firebase.database.ServerValue.TIMESTAMP, // new Date(timestamp).getTime();
        message: this.state.message,
        mood: mood,
        behavior: behavior,
        mediaURL: ""
      }
    }
    firebase
    .database()
    .ref()
    .update(updates)

    // this.props.addTimeLineEntry(this.state.message, mood, behavior, mediaURL)
    this.setState({
      message:"",
      behaviors: this.state.behaviors.map(
        (b) => {
          b.style=b.defaultStyle
          b.selected=false
          return b
        }
      ),
      moods: this.state.moods.map(
        (b) => (
          {
            ...b,
            style: b.defaultStyle,
            selected: false
          }
        )

      ),


    })
  }
  _selectMood(w) {

    this.setState( {
      moods: this.state.moods.map(
        (b) => {
          if (w==b.value) {
            b.selected=!b.selected
            b.style = b.selected ? " selected btn-primary " : ""
          } else {
            b.style=""
            b.selected = false
          }
          return b
        }
      )
    })
  }
  _selectBehavior(w) {
      this.setState({
        behaviors: this.state.behaviors.map(
          (b) => {
            if (w==b.value) {
              b.selected = !b.selected
              b.style= b.selected ? b.defaultStyle + " selected " : b.defaultStyle
            } else {
              b.style = b.defaultStyle
              b.selected=false
            }
            return b
          }
        )
      })

  }

  render() {
    return (
      <div style={{ backgroundColor: "white", padding:"2em" }}>
        <form onSubmit={(e)=> {e.preventDefault(); return false;}}>
          <div className="form-group">
            <label>
              what is happening?
            </label>
            <textarea className="form-control"
              value={this.state.message}
              onChange={(e) => this.setState({message : e.target.value}) }
            ></textarea>
          </div>
          <div className="form-group">
            <label>Mood</label>
            <div>
              {
                this.state.moods.map(
                  (b,i) => {
                    if (b.value) {
                        return (
                          <button key={i}
                                  className={ "btn " + b.style }
                                  onClick={ (e)=>this._selectMood(b.value) }  >

                          <img key={i} src={b.src} alt={b.caption} title={b.caption}
                          style={{width:"25px", marginRight:"1em", marginLeft:"1em"}}
                          />
                          { b.caption }
                          { }
                          &nbsp;
                          {
                            b.selected &&
                                <i className="fa fa-check" aria-hidden="true"></i>
                          }
                          </button>
                        )
                    }
                  }


                )
              }
            </div>

          </div>
          <div className="form-group">
            <label>Behavior</label>
            <p>
              { this.state.behaviors.map(
                (b,i) => {
                  if (b.value) {
                    return (
                      <button key={i} className={b.style}
                        role="button" onClick={ (e)=>this._selectBehavior(b.value)}>
                          {b.caption }
                          { }
                          &nbsp;
                          {
                            b.selected &&
                                <i className="fa fa-check" aria-hidden="true"></i>
                          }
                      </button>
                    )
                  }
                }
              )}
            </p>
          </div>
          <div className="form-group">
            <label>photo/video</label>
            <label htmlFor="upload" className="form-control">
              <i className="fa fa-camera" aria-hidden="true"></i>
              <input type="file"  id="upload" style={{display:"none"}} />
            </label>
          </div>
          <div>
            <button className="pull-right btn btn-primary" onClick={this._add}>Post</button>
            <br/>
          </div>
        </form>
      </div>
    )
  }
}
export default connect(
  (state, ownProps) => {
    log('connecting state ', state)
    return {
      user: state.auth.user,
      student: state.students.student
    }
  },
  {
    addTimeLineEntry: (message, mood, behavior, mediaURL) => ({
      type:"addTimeLineEntry",
      message: message,
      mood: mood,
      behavior: behavior,
      mediaURL: mediaURL,
    }),

  }
)(Add)
