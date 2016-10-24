import React from 'react';
import { connect } from 'react-redux'
import log from '../utils/log'
import behaviors, {redStyle, greenStyle, redStyleSelected, greenStyleSelected} from './behaviors'
import subjects from './subjects'
import {inc, incAll, incYear, incMonth, incDate, incWeek} from '../utils/fb/'
import AddBehavior from './addBehavior'


class Add extends React.Component {
  _pad(v) {
    if (v<10) {
      return '0' + v;
    }
    return v;
  }
  _initialState(props) {
    const d = new Date()
    return {
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
     behaviors: {...props.list_behaviors},
     subjects: subjects,
     message: "",
     list_activity: [],
     activityId: "",
     activityTimeStamp: this._pad(d.getHours()) + ":" + this._pad(d.getMinutes())
   }
  }

  constructor(props) {
    super(props)
    this._add = this._add.bind(this)
    this._selectMood=this._selectMood.bind(this)
    this._previewFile=this._previewFile.bind(this)
    this._pushUpdates=this._pushUpdates.bind(this)
    this._selectSubject=this._selectSubject.bind(this)
    this._selectBehavior=this._selectBehavior.bind(this)
    this._loadData=this._loadData.bind(this)
    this.state=this._initialState(props)
    this._postButtonCaption = this._postButtonCaption.bind(this)
  }

  componentDidMount() {
    this._loadData(this.props)
    const d = new Date()
    this.setState({activityTimeStamp: this._pad(d.getHours()) + ":" + this._pad(d.getMinutes())  })
  }
  componentWillReceiveProps(props) {
    this._loadData(props)
    const d = new Date()
    this.setState({activityTimeStamp: this._pad(d.getHours()) + ":" + this._pad(d.getMinutes()) })
  }

  _loadData(props) {
    const self = this
    firebase
    .database()
    .ref("people/" + props.viewPersonId + "/list_activity")
    .on("value",
      (snapshot) => {
        console.log('got snapshot from list_activity ',snapshot, props.viewPersonId, snapshot.val())
        let all = []
        if (snapshot && snapshot.val()) {
          for(var key in snapshot.val()) {
            all.unshift( { key: key, caption:snapshot.val()[key] } )
          }
        }
        console.log('setting list_activity to ', all )
        self.setState({list_activity: all})
      }
    )
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
  _selectBehavior(key, direction) {
    const self = this
    let news = Object.assign({}, self.state.behaviors)

    const delta = news[key].delta * direction
    news[key].value = news[key].value==delta ? 0 : delta

    self.setState({behaviors: news})
    return false


  }

  _pushUpdates(key, newKey, message, mood, mediaURL, postedByPersonId,postedByDisplayName,photoURL, activityId) {
    const self = this
    let hasTimeStamp = false
    let timeStamp = new Date()
    if (this.state.activityTimeStamp) {
      try {
        timeStamp.setHours(this.state.activityTimeStamp.split(":")[0])
        timeStamp.setMinutes(this.state.activityTimeStamp.split(":")[0])
        hasTimeStamp=true
      } catch(x){console.log(x)}
    }
    if (true ) {
      try {
        if (activityId) {
          let activity=this.state.list_activity.reduce( (previous, current, index,array) => {
            console.log('prev:', previous,'current ', current,'index ... ' , index,' array ', array, ' activityId ', activityId)
            if(activityId==current.key) {
              return current.caption
            }
            return previous
          },"" )

          console.log('setting activity ', activity)
          if(message) {
            message = activity + ". " + message
          } else {
            message=activity
          }
        }
      } catch(x) {
        console.log(x)
      }

      let updates = {}
      const self = this
      try {
        updates["people/" + key + "/timeline/" + newKey ] = {
          date: hasTimeStamp ? timeStamp.getTime() : firebase.database.ServerValue.TIMESTAMP, // new Date(timestamp).getTime();
          message: message || "",
          mood: mood,
          behaviors: self.state.behaviors,
          mediaURL: mediaURL || "",
          postedByPersonId: postedByPersonId,
          postedByDisplayName: postedByDisplayName,
          postedByPhotoURL: self.props.photoURL || "",
          subjects: self.state.subjects,
          activityId: self.state.activityId
        }
      } catch(x) {console.log(x)}

      try {
        if (mood) {
          updates["people/" + key + "/mood/" + newKey ] = {
            date: hasTimeStamp ? timeStamp.getTime() : firebase.database.ServerValue.TIMESTAMP, // new Date(timestamp).getTime();
            message: message || "",
            mood: mood,
            behaviors: self.state.behaviors,
            mediaURL: mediaURL ||"",
            postedByPersonId: postedByPersonId,
            postedByDisplayName: postedByDisplayName
          }
        }
      } catch(x) {console.log(x)}


      try {
        Object.keys(this.state.behaviors).map(
          one => {
            let behavior = this.state.behaviors[one]
            if (behavior.value) {
              updates["people/" + key + "/behavior/" + newKey ] = {
                date: hasTimeStamp ? timeStamp.getTime() : firebase.database.ServerValue.TIMESTAMP, // new Date(timestamp).getTime();
                message: message || "",
                mood: mood,
                behavior: behavior,
                mediaURL: mediaURL || "",
                postedByPersonId: postedByPersonId,
                postedByDisplayName: postedByDisplayName

              }
            }
          })
      } catch(x) {console.log(x)}


      firebase
      .database()
      .ref()
      .update(updates)

      try {
        // clear out the form
      } catch(x) {

      }
    }

  }
  _add() {
    const self = this
    let mood = 0
    let behavior = 0
    let mediaURL = ""
    let category = ""
    const message = this.state.message||""

    this.state.moods.forEach(
      (m) => {
        if(!mood && m.selected) {
          mood = m.value
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
            self._pushUpdates(self.props.viewPersonId, newKey,message || "" , mood,  url,
            self.props.personId, self.props.displayName, self.props.photoURL, self.state.activityId)
            console.log('File available at', url);
          })
          .catch(function(error) {
            // [START onfailure]
            console.error('Upload failed:', error);
            // [END onfailure]
          });
      } else {
        self._pushUpdates(this.props.viewPersonId, newKey,message || "" , mood, "",
        self.props.personId, self.props.displayName, self.props.photoURL, self.state.activityId)

      }
    } catch(x) {
      console.log(x)
    }



    let d = new Date()
    try {
      if (mood) {
        incAll("/people/" + this.props.viewPersonId + "/stats/mood", mood.toString())
        incYear("/people/" + this.props.viewPersonId + "/stats/mood", mood.toString())
        incMonth("/people/" + this.props.viewPersonId + "/stats/mood", mood.toString())
        incDate("/people/" + this.props.viewPersonId + "/stats/mood", mood.toString())
      }
    } catch(x) {console.log(x)}


    try {
      Object.keys(this.state.behaviors).map(key => {
        let behavior = this.state.behaviors[key]
        if (behavior.value!==0) {

          incAll("/people/" + this.props.viewPersonId + "/stats/behavior", key, behavior.value )
          incYear("/people/" + this.props.viewPersonId + "/stats/behavior", key, behavior.value )
          incMonth("/people/" + this.props.viewPersonId + "/stats/behavior", key, behavior.value )
          incDate("/people/" + this.props.viewPersonId + "/stats/behavior", key, behavior.value )
          incWeek("/people/" + this.props.viewPersonId + "/stats/behavior", key, behavior.value )

          category = behavior.value > 0 ? "green" : "red"

          incAll("/people/" + this.props.viewPersonId + "/stats/behaviors", category, behavior.value)
          incYear("/people/" + this.props.viewPersonId + "/stats/behaviors", category, behavior.value)
          incMonth("/people/" + this.props.viewPersonId + "/stats/behaviors", category, behavior.value)
          incDate("/people/" + this.props.viewPersonId + "/stats/behaviors", category, behavior.value)
          incWeek("/people/" + this.props.viewPersonId + "/stats/behaviors", category, behavior.value)
        }
      })
    } catch(x) {console.log(x)}



    try {
      let resetToState = {...self._initialState(self.props)}
      resetToState.subjects = resetToState.subjects.map(
        s => {
          s.options = s.options.map(
            o => ({...o, checked: false})
          )
          return s

        }
      )
      resetToState.list_activity = [].concat(this.state.list_activity)

      Object.keys(resetToState.behaviors).map(key => {
        resetToState.behaviors[key].value=0
      })

      console.log('resetting state to ',resetToState )
      self.setState(resetToState)
      self.preview.src=""

    } catch(x) {console.log(x)}

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
  _selectSubject(id, option) {
    this.setState({
      subjects: this.state.subjects.map(
        (subject,i) => {
          if (subject.id==id) {
            let s = subject
            s.options = s.options.map(
              (opt,j) => ({...opt, checked: opt.value==option?!opt.checked:opt.checked })
            )
            return s
          } else {
            return subject
          }
        }
      )
    })
  }

  // _selectBehavior(w) {
  //     this.setState({
  //       behaviors: this.state.behaviors.map(
  //         (b) => {
  //           if (w==b.value) {
  //             b.selected = !b.selected
  //             // b.style= b.selected ? b.defaultStyle + " selected " : b.defaultStyle
  //           } else {
  //             // b.style = b.defaultStyle
  //             b.selected=false
  //           }
  //           return b
  //         }
  //       )
  //     })
  //
  // }

  render() {
    return (
      <div style={{ backgroundColor: "white", padding:"2em" }}>
        <form onSubmit={(e)=> {e.preventDefault(); return false;}}>
          <div className="form-group">
            <label>Time</label>
            <input type="time" className="form-control" value={this.state.activityTimeStamp}
              onChange={ e => { console.log(e.target.value); this.setState({activityTimeStamp: e.target.value }) } }
               />
          </div>
          <div className="form-group">
            <label>Activity</label>
            <select className="form-control" value={this.state.activityId}
              onChange={ e => this.setState( {activityId: e.target.value} ) }>
              <option value=""></option>
              {
                this.state.list_activity.map( (item,i) => (<option key={item.key} value={item.key}>{ item.caption }</option>) )
              }
            </select>
          </div>
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
            <AddBehavior behaviors={this.state.behaviors} onChange={this._selectBehavior} />
          </div>
            <br/>
            <div className="form-group">
              <label>Subjects</label>
                {
                  this.state.subjects.map(
                    (subject, i) => (
                      <div className="row" key={i}>
                        <div className='col-xs-4'>
                          {subject.caption} &nbsp;
                        </div>
                        <div className='col-xs-8'>
                          {
                            subject.options.map( (opt, j) => (
                              <span key={j}>
                                <input type="checkbox" value={opt.value} checked={opt.checked}
                                  onChange={ e => this._selectSubject(subject.id, opt.value) }
                                /> {opt.caption} &nbsp;
                              </span>

                            ))
                          }
                        </div>
                      </div>
                    )
                  )
                }
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
            <button className="btn-block btn btn-primary" onClick={this._add}>
              {
                this._postButtonCaption(this.props.personId, this.props.viewPersonId, this.props.viewPerson.displayName)
              }
            </button>
            <br/>
          </div>
        </form>
      </div>
    )
  }
  _postButtonCaption(personId, viewPersonId, displayName) {
    if (personId==viewPersonId) {
      return "Post to my own timeline"
    }
    return "Post to " + displayName
  }
}
export default connect(
  (state, ownProps) => {
    log('connecting state ', state)
    return {
      user: state.auth.user,
      viewPersonId: state.auth.viewPersonId,
      viewPerson: state.auth.viewPerson,
      personId: state.auth.personId,
      displayName: state.auth.displayName,
      photoURL: state.auth.photoURL,
      list_behaviors: state.auth.list_behaviors
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
