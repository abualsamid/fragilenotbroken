import React from 'react';
import { connect } from 'react-redux'
import log from '../log'
import behaviors, {redStyle, greenStyle, redStyleSelected, greenStyleSelected} from './behaviors'
import {inc, incAll, incYear, incMonth, incDate} from '../utils/fb'

class Add extends React.Component {
  constructor(props) {
    super(props)
    this._add = this._add.bind(this)
    this._selectMood=this._selectMood.bind(this)
    this._previewFile=this._previewFile.bind(this)
    this._pushUpdates=this._pushUpdates.bind(this)
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
  _previewFile() {
    const self = this
    try {
      var reader = new FileReader();
      reader.onload = function (e) {
          // get loaded data and render thumbnail.
          self.preview.src = e.target.result;
      };

      // read the image file as a data URL.
      reader.readAsDataURL(self.file.files[0]);
    } catch(x) {console.log('previewFile: ', x)}

  }
  _pushUpdates(key, newKey, message, mood, behavior, mediaURL) {

    if (message || mood || behavior || mediaURL ) {
      let updates = {}
      const self = this
      updates["people/" + key + "/timeline/" + newKey ] = {
        date: firebase.database.ServerValue.TIMESTAMP, // new Date(timestamp).getTime();
        message: message || "",
        mood: mood,
        behavior: behavior,
        mediaURL: mediaURL || ""
      }

      if (mood) {
        updates["people/" + key + "/mood/" + newKey ] = {
          date: firebase.database.ServerValue.TIMESTAMP, // new Date(timestamp).getTime();
          message: message || "",
          mood: mood,
          behavior: behavior,
          mediaURL: mediaURL ||""
        }
      }
      if (behavior) {
        updates["people/" + key + "/behavior/" + newKey ] = {
          date: firebase.database.ServerValue.TIMESTAMP, // new Date(timestamp).getTime();
          message: message || "",
          mood: mood,
          behavior: behavior,
          mediaURL: mediaURL || ""
        }
      }
      firebase
      .database()
      .ref()
      .update(updates)

    }

  }
  _add() {
    const self = this
    log('doing it.')
    let mood = 0
    let behavior = 0
    let mediaURL = ""
    let category = ""
    const message = this.state.message||""

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
          category = b.category
        }
      }
    )

    const newKey = firebase
    .database()
    .ref("people/" + this.props.viewPersonId + "/timeline")
    .push()
    .key

    try {
      if (this.file && this.file.files && this.file.files.length) {
        var file = this.file.files[0];
        var metadata = {
          'contentType': file.type
        };
        var storageRef = firebase.storage().ref();

        storageRef
          .child('timeline-images/' + newKey + "/" + file.name)
          .put(file, metadata)
          .then( (snapshot) => {
            console.log('Uploaded', snapshot.totalBytes, 'bytes.');
            console.log(snapshot.metadata);
            var url = snapshot.metadata.downloadURLs[0];
            self._pushUpdates(self.props.viewPersonId, newKey,message || "" , mood, behavior, url)
            console.log('File available at', url);
          })
          .catch(function(error) {
            // [START onfailure]
            console.error('Upload failed:', error);
            // [END onfailure]
          });
      } else {
        self._pushUpdates(this.props.viewPersonId, newKey,message || "" , mood, behavior, "")

      }
    } catch(x) {
      console.log(x)
    }



    let d = new Date()

    if (mood) {
      incAll("/people/" + this.props.viewPersonId + "/stats/mood", mood.toString())
      incYear("/people/" + this.props.viewPersonId + "/stats/mood", mood.toString())
      incMonth("/people/" + this.props.viewPersonId + "/stats/mood", mood.toString())
      incDate("/people/" + this.props.viewPersonId + "/stats/mood", mood.toString())
    }

    if (behavior) {
      incAll("/people/" + this.props.viewPersonId + "/stats/behavior", behavior.toString())
      incYear("/people/" + this.props.viewPersonId + "/stats/behavior", behavior.toString())
      incMonth("/people/" + this.props.viewPersonId + "/stats/behavior", behavior.toString())
      incDate("/people/" + this.props.viewPersonId + "/stats/behavior", behavior.toString())

      incAll("/people/" + this.props.viewPersonId + "/stats/behaviors", category)
      incYear("/people/" + this.props.viewPersonId + "/stats/behaviors", category)
      incMonth("/people/" + this.props.viewPersonId + "/stats/behaviors", category)
      incDate("/people/" + this.props.viewPersonId + "/stats/behaviors", category)

    }
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
    self.preview.src=""

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
            <div className="btn-toolbar">
              {
                this.state.moods.map(
                  (b,i) => {
                    if (b.value) {
                        return (
                          <div className="btn-group" key={i}>
                            <img key={i} src={b.src} alt={b.caption} title={b.caption}
                            style={{width:"2em"}}
                            className={  b.style }
                            onClick={ (e)=>this._selectMood(b.value) }
                            />
                          </div>
                        )
                    }
                  }
                )
              }
            </div>

          </div>
          <div className="form-group">
            <label>Behavior</label>
            <div className="btn-toolbar">

              { this.state.behaviors.map(
                (b,i) => {
                  if (b.value) {
                    return (
                      <div className="btn-group" key={i}>
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
                      </div>

                    )
                  }
                }
              )}
            </div>
          </div>
          <div className="form-group">
            <label>photo/video</label>
            <label htmlFor="upload" className="form-control">
              <i className="fa fa-camera" aria-hidden="true"></i>
              <input type="file"  id="upload" style={{display:"none"}}
                onChange={this._previewFile}
                ref={e=>this.file = e}/>
            </label>
          </div>
          <div className="form-group">
            <img  style={{width:"200px"}} ref={(e)=>{this.preview = e}} />
          </div>
          <div>
            <button className="btn-block btn btn-primary" onClick={this._add}>Post</button>
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
      viewPersonId: state.auth.viewPersonId
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
