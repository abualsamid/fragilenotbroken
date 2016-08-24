import React from 'react';
import { connect } from 'react-redux'
import log from '../log'


const redStyle="btn  btn-danger behavior"
const greenStyle="btn  btn-success behavior"
const redStyleSelected="btn  btn-danger behavior selected"
const greenStyleSelected="btn  btn-success behavior selected"

class Add extends React.Component {
  constructor(props) {
    super(props)
    this._add = this._add.bind(this)
    this._selectMood=this._selectMood.bind(this)
    this.state= {
      angryStyle: "",
      happyStyle:"",
      sadStyle:"",
      buttons: [
        {
          caption: "Excited",
          style: redStyle,
          defaultStyle: redStyle,
          selected: false,
          value: 0
        },
        {
          caption: "Messy Eating",
          style: redStyle,
          defaultStyle: redStyle,
          selected: false,
          value: 1
        },
        {
          caption: "Calm",
          style: greenStyle,
          defaultStyle: greenStyle,
          selected: false,
          value: 2
        },
        {
          caption: "Proper Eating",
          style: greenStyle,
          defaultStyle: greenStyle,
          selected: false,
          value: 3
        },
      ]
    }
  }
  _add() {
    log('doing it.')
  }
  _selectMood(w) {
    switch(w) {
      case 0:
        this.setState({angryStyle:this.state.angryStyle=="selected"?"":"selected", happyStyle:"", sadStyle: ""})
        break
      case 1:
        this.setState({angryStyle:"", happyStyle:this.state.happyStyle=="selected"?"":"selected", sadStyle: ""})
        break;
      case 2:
        this.setState({angryStyle:"", happyStyle:"", sadStyle: this.state.sadStyle=="selected"?"":"selected"})
        break;
    }
  }
  _selectBehavior(w) {
      let buttons = this.state.buttons
      this.setState({
        buttons: this.state.buttons.map(
          (b) => {
            if (w==b.value) {
              b.style= b.style==b.defaultStyle? b.defaultStyle + " selected " : b.defaultStyle
            } else {
              b.style = b.defaultStyle
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
            <textarea className="form-control"></textarea>
          </div>
          <div className="form-group">
            <label>Mood</label>
            <div>
              <img src='img/angry.svg' alt='Angry' className={this.state.angryStyle} title='Angry'
                style={{width:"25px", marginRight:"1em", marginLeft:"1em"}} onClick={ (e)=>this._selectMood(0) } />
              &nbsp;
              <img src='img/happy.svg' alt='Happy'  className={this.state.happyStyle} title='Happy'
                style={{width:"25px", marginRight:"1em", marginLeft:"1em"}}  onClick={ (e)=>this._selectMood(1) }  />
              &nbsp;
              <img src='img/crying.svg' alt='Sad'  className={this.state.sadStyle} title='Sad'
                style={{width:"25px", marginRight:"1em", marginLeft:"1em"}}  onClick={ (e)=>this._selectMood(2) } />
            </div>
          </div>
          <div className="form-group">
            <label>Behavior</label>
            <p>
              { this.state.buttons.map(
                (b,i) => <button key={i} className={b.style}
                  role="button" onClick={ (e)=>this._selectBehavior(b.value)}>
                    {b.caption}
                  </button>
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
  }
)(Add)
