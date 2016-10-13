import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import ReactSwipe from 'react-swipe';

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
                    let newFriend = database
                                  .ref("people/" + self.props.personId + "/friends")
                                  .push({
                                    personId: friendId,
                                    myRole: myInvite.role
                                  })
                                  .key

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
      .ref("people/" + self.props.personId + "/friends")
      .push({
        myRole:"parent",
        personId: newPersonId
      })
    } else {
      console.log('doh... no person ID attached at login.')
    }

  }
  _select(person) {
    this.props.selectViewPerson(person)
    setTimeout(browserHistory.push("/dashboard"), 100)
  }

  _invite(person) {
    console.log('inviting ...',person, person.val(), person.key )
    this.setState({
      setupInvite: person.key
    })
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

            // updates['/people/' + personId + '/isSuperAdmin'] = true;
            // updates['/people/' + personId + '/isBDFL'] = true;
            //


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
  componentWillUnmount() {
    const self = this
    try {
      database
      .ref("people/" + self.props.personId + "/friends")
      .off()
    } catch(x) {console.log(x)}
  }
  componentDidMount() {
    const self = this
    try {
      let people = []

      self.setState({people:people})

      var uid = self.props.user.uid;
      if (uid && self.props.personId) {
        console.log('getting my people... ',self.props, self.props.personId)

        database
        .ref("people/" + self.props.personId + "/friends")
        .on('child_added',
          child => {
            console.log('retrieved child: ', child, child.key, child.val())
            if (child.val().myRole) {
              let myRole = child.val().myRole
              database
              .ref("people/" + child.val().personId)
              .on('value',
                data => {
                  // this may not look correct, but it is, otherwise the react state is not going to be correct
                  // as the events will use the prior copy of the state before it had a chance to update.
                  if (data && data.val()) {
                    people.push({
                      myRole: myRole,
                      friend: data
                    })
                    self.setState({people: people })
                  }
                }
              )
            }

          }
        )

      } else {
        console.log('no uid in ', self.props )
      }

    } catch(x) {
      console.log(x)
    }

  }


  render() {
    return <div className="container">
      <ReactSwipe className="carousel" swipeOptions={this.swipeOptions} ref={e=>this._reactSwipe = e }>


        <div>
          <h2>Friends</h2>
          <br/>
              {
                this.state.people &&
                this.state.people.map((p, index) => {
                if(p && p.friend ) {
                  const myRole = p.myRole
                  const person = p.friend
                  if (person.val()) {
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
                      return  <div key={index} className="row">
                                <div className="col-xs-6 col-md-4">
                                  <img src={person.val().picURL || "/img/generic.jpg"} alt={person.val().name}
                                    title={person.val().name} style={{width:"55px"}}
                                    onClick={ e => this._select(person) }
                                  />
                                </div>
                                <div className="col-xs-6 col-md-4">
                                  <a href='#' onClick={e => this._select(person) }>{person.val().name}</a>
                                </div>
                                {
                                  myRole=="parent" &&
                                  <div className="col-xs-6 col-md-4">
                                    <button type="button" className="btn btn-default" onClick={ e=> this._invite(person)} >
                                      <i className="fa fa-share-alt"> invite </i>
                                    </button>

                                  </div>
                                }

                                <hr/>
                              </div>
                    }

                  } else {
                    return null
                  }

                } else {
                  return null
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
  (state, ownProps) => {
    return {
      user: state.auth.user,
      personId: state.auth.personId,
      person : state.auth.person
    }
  },
  {
    onLogout: () => ({
      type:"logout", user: null, isAuthenticated: false, credentials: null
    }),
    selectViewPerson: (person) => ({
      type:"selectViewPerson",
      person: person
    }),

  }


)(Students)
