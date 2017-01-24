import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import ReactSwipe from 'react-swipe';
import { loadTimeline, offTimeLine, submitInterventionResponse,postViewPersonId } from '../utils/fb/timeline'
import log from '../utils/log'

var database = firebase.database();

class Students extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      students: [],
      setupInvite: "",
      alert:"",
      inviteFeedback:""
    }
    this._addPerson=this._addPerson.bind(this)
    this._acceptInvite=this._acceptInvite.bind(this)

    this._select = this._select.bind(this)
    this._selectMe = this._selectMe.bind(this)
    this._selectPic = this._selectPic.bind(this)
    this._invite = this._invite.bind(this)
    this._calcInviteKey=this._calcInviteKey.bind(this)
    this.picURL = ""

    const self = this
    this.swipeOptions = {
      continuous: true,
      callback(index,element) {
      },
      transitionEnd(index,element) {
        self.inviteCode.value=""
        self.setState({inviteFeedback:""})
      }
    }
  }

  _acceptInvite() {
    const self = this
    const v = this.inviteCode.value
    if (v) {
      self.setState({inviteFeedback: "counting bits over the ether " })
      database
      .ref("invites/" + v)
      .once("value")
      .then(
        (snapshot) => {
          console.log(snapshot)
          if(snapshot && snapshot.val()) {
            let snap = snapshot.val()
            const friendId=snap.personId
            const inviteId = snap.inviteId

            database
            .ref("people/" + friendId + "/invites/" +v)
            .once("value")
            .then(
              s => {
                if (s) {
                  let myInvite = s.val()
                  console.log(v, myInvite)
                  const now = (new Date()).getTime()
                  if (s.key==v && myInvite.acceptedOn==0 && myInvite.expires > now && !myInvite.personId) {
                    database
                    .ref("people/" + self.props.personId + "/friends/" + friendId)
                    .set({
                      personId: friendId,
                      myRole: myInvite.role,
                      timestamp: firebase.database.ServerValue.TIMESTAMP
                    })

                    self.setState({inviteFeedback: "Your invite was processed" })
                    myInvite.acceptedOn = now
                    myInvite.personId = self.props.personId
                    myInvite.uid = self.props.user.uid

                    let updatedInvite = {}
                    updatedInvite["people/" + friendId + "/invites/" +v] = myInvite
                    database
                    .ref()
                    .update(updatedInvite)

                    database
                    .ref("people/friendId/" + myInvite.role)
                    .push(self.props.personId)
                  } else {
                    console.log(v, myInvite)
                    self.setState({inviteFeedback:"your invite expired"})
                    this.inviteCode.value=""
                  }
                } else {
                  self.setState({inviteFeedback: "Your invite could not be found. Please try again."})
                  this.inviteCode.value=""

                }
              }
            )
          } else {
            self.setState({inviteFeedback: "Your invite could not be found. Please try again."})
            this.inviteCode.value=""
          }
        }
      )
    } else {
      self.setState({inviteFeedback: "Please enter an invite code to continue"})
    }
    this.inviteCode.value=""
  }
  _addPerson() {
    const self = this
    var ownerId = self.props.user.uid;

    const newStudent = {
      name: self.studentName.value,
      displayName: self.studentName.value,
      picURL: self.picURL,
      ownerId: ownerId,
      email: "",
      uid:""
    }


    const newPersonId = database
    .ref("people" )
    .push(newStudent)
    .key


    if (self.props.personId) {
      database
      .ref("people/" + newPersonId + "/parents")
      .push(self.props.personId)

      database
      .ref("people/" + self.props.personId + "/friends/" + newPersonId)
      .set({
        myRole:"parent",
        personId: newPersonId,
        timestamp: firebase.database.ServerValue.TIMESTAMP

      })
    } else {
      console.log('doh... no person ID attached at login.')
    }

  }
  _select(person) {
    const self = this
    self.props.selectViewPerson(person)
    postViewPersonId(self.props.user.uid, person.key)
    setTimeout(browserHistory.push("/dashboard"), 100)
  }

  _selectMe(personId) {
    const self = this
    self.props.selectMe()
    postViewPersonId(self.props.user.uid,self.props.personId )
    setTimeout(browserHistory.push("/dashboard"), 100)
  }
  _invite(person) {
    this.setState({
      setupInvite: person.key
    })
  }

  _myCard(personId, person, select ) {
    return (
      <div key={"meme"} className="row">
        <div className="col-xs-6 col-md-4">
          <img src={person.picURL || "/img/generic.jpg"} alt={person.name || person.displayName || person.email }
            title={person.name || person.displayName || person.email } style={{width:"40px"}}
            onClick={ e => select(person) }
          />
        </div>
        <div className="col-xs-6 col-md-4">
          <a href='#' onClick={e => select(person) }>
            {person.name || person.displayName || person.email }
            <strong> (myself) </strong>
          </a>
        </div>
        <br/>
      </div>
    )
  }
  _card(index,myRole, person, select, invite ) {
    if(!person) {
      return null
    }
    return (
      <div key={index} className="row">
        <div className="col-xs-6 col-md-4">
          <img src={person.picURL || "/img/generic.jpg"} alt={person.name || person.displayName || person.email }
            title={person.name || person.displayName || person.email } style={{width:"40px"}}
            onClick={ e => select(person) }
          />
        </div>
        <div className="col-xs-6 col-md-4">
          <a href='#' onClick={e => select(person) }>{person.name || person.displayName || person.email }</a>
        </div>
        {
          myRole=="parent" &&
          <div className="col-xs-6 col-md-4">
            <button type="button" className="btn btn-default" onClick={ e=> invite(person)} >
              <i className="fa fa-share-alt"> invite </i>
            </button>
          </div>
        }
        <hr/>
        <br/>
      </div>

    )
  }

  _calcInviteKey(person, role) {
    const self = this
    console.log('the role ', role, ' for key', person.key)

    if (!role) {
      this.setState({
        alert: "Please select a Role to continue."
      })
      return
    }

    var d = new Date()
    d.setDate(d.getDate() + 7)

    const key=database
              .ref("people/" + person.key + "/invites")
              .push({
                sender: self.props.personId ,
                sender_uid:  self.props.user.uid,
                expires: d.getTime(),
                role: role,
                acceptedOn: 0,
                uid: "",
                personId: ""
              })
              .key

    this.setState({
      alert:"Please provide the following code to the invitee: " + key
    })

    database
    .ref("invites")
    .push()

    var updates = {}

    updates['invites/' + key] = {
        inviteId: key,
        personId: person.key,
        acceptedOn: 0
      }
    database.ref().update(updates);
  }
  _selectPic(e) {
    const self = this
    try {
      e.stopPropagation();
    } catch(x) {

    }
    e.preventDefault();
    var file = e.target.files[0];
    console.log('selected ', file)
    if (file) {
      var metadata = {
        'contentType': file.type
      };
      var uid = self.props.user.uid;
      var storageRef = firebase.storage().ref();

      storageRef.child('images/' + uid + "/" + file.name)
        .put(file, metadata)
        .then(function(snapshot) {
          console.log('Uploaded', snapshot.totalBytes, 'bytes.');
          console.log(snapshot.metadata);
          var url = snapshot.metadata.downloadURLs[0];
          self.picURL=url
          self.preview.src = url
          console.log('File available at', url);
        })
        .catch(function(error) {
          // [START onfailure]
          console.error('Upload failed:', error);
          // [END onfailure]
        });
    }
  }
  componentWillReceiveProps(nextProps) {
    try {
      this._reactSwipe.swipe.slide(0,10); // go to first slide when user renavigates to this tab.
    } catch(x) {
      console.log(x)
    }
  }



  render() {
    const self = this
    return <div className="container">
      <ReactSwipe className="carousel" swipeOptions={this.swipeOptions} ref={e=>this._reactSwipe = e }>

        <div>
          <h2>People</h2>
          {
            this._myCard(self.props.personId, self.props.person, this._selectMe )
          }
          <br/>
              {
                self.props.friends &&
                self.props.friends.map((person, index) => {
                const myRole = person.myRole
                if(this.state.setupInvite && this.state.setupInvite==person.key) {
                  return <div key={index} className="row">
                    <div className="col-xs-12">
                        <div>
                          <p>
                            Please select an access role for the invitee
                          </p>
                          <div className="form-group">
                            <label htmlFor="role">Role</label>
                              <select onChange={e=>this.role=e.target.value} className="form-control" id="role" name="role">
                                <option value="">(Please Select)</option>
                                <option value="parent">Parent</option>
                                <option value="teacher">Teacher</option>
                                <option value="therapist">Therapist</option>
                              </select>
                          </div>

                          <br/>
                          <button type="button" className="btn btn-primary"
                            onClick={ e=> this._calcInviteKey(person, this.role)}>
                            Invite
                          </button>
                          <br/>
                          {
                            this.state.alert &&
                            <div className="alert">
                              {this.state.alert}
                            </div>
                          }
                        </div>
                    </div>
                  </div>
                } else {
                  return this._card(index,myRole, person, this._select, this._invite )
                }
              })}
        </div>

        <div>
          <form>
            <div className="form-group">
              <label htmlFor="studentName">Name</label>
              <input type="text" className="form-control" placeholder="name" ref={(e)=>{this.studentName=e} } />
            </div>
            <div className="form-group">
              <label htmlFor="studentPic">Picture</label>
              <input type="file" className="form-control"
                onChange={ this._selectPic } />
            </div>
            <div>
              <img src={this.picURL} style={{width:"200px"}} ref={(e)=>{this.preview = e}} />
            </div>
          </form>
          <button type="button" className="btn btn-block btn-primary" onClick={this._addPerson}>Add</button>
        </div>
        <div className="panel panel-info">
          <div className="panel-heading">Invites</div>
          <div className="panel-body">
            <p>
              If you received an invite code, enter it here
            </p>
            <div className="form-group">
              <label htmlFor="invite">Invite</label>
              <input type="text" className="form-control" placeholder="invite code" ref={ (e) => {this.inviteCode=e} } />
            </div>
            <button type="button" className="btn btn-primary" onClick={this._acceptInvite}>Submit</button>
          </div>
          <div className="panel-footer">
            {
              this.state.inviteFeedback &&
              <div className="alert">
                {this.state.inviteFeedback}
              </div>
            }
          </div>
        </div>


      </ReactSwipe>
    </div>
  }
}

export default connect(
  (state, ownProps) => ({
    user: state.auth.user,
    personId: state.auth.personId,
    person : state.auth.person || (state.auth.personId==state.auth.viewPersonId ? state.auth.viewPerson : null ),
    friends: state.auth.friends
  }),
  {
    onLogout: () => ({
      type:"logout", user: null, isAuthenticated: false, credentials: null
    }),
    selectViewPerson: (person) => ({
      type:"selectViewPerson",
      person: person
    }),
    selectMe: () => ({type:"selectMe"})

  }


)(Students)
