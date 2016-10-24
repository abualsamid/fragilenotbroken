import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import Root from './root'
import Login from './login';
import Navbar from './components/navBar'
import { connect } from 'react-redux'
import {  browserHistory, Link } from 'react-router';
import log from './utils/log'

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAy4ypdtNBZPz9Cr0t8IUHSAwB8S4_sYoE",
  authDomain: "fragilenotbroken-ccc45.firebaseapp.com",
  databaseURL: "https://fragilenotbroken-ccc45.firebaseio.com",
  storageBucket: "fragilenotbroken-ccc45.appspot.com",
};
firebase.initializeApp(config);
// Get a reference to the database service
var database = firebase.database();

var uid ;

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state= {
      isAuthenticated: props.isAuthenticated,
      user: props.user
    };

    this._logout = this._logout.bind(this)
    this._checkAuth=this._checkAuth.bind(this)
    this._retrieveFBPerson = this._retrieveFBPerson.bind(this)
    this._createFBUser = this._createFBUser.bind(this)
  }

  _createFBUser(uid, personId, email) {
    try {
        firebase
        .database()
        .ref("users/" + uid)
        .once("value",
          one => {
            const u = one.val()
            if (!u) {
              firebase
              .database()
              .ref("users/" + uid)
              .push({
                personId: personId,
                email: email
              })
            }
          }
        )

      } catch(x) {
        console.log(x)
      }
  }

  _retrieveFBPerson(user) {
    const self = this

    try {
      firebase
      .database()
      .ref("people")
      .orderByChild("uid")
      .equalTo(user.uid)
      .limitToFirst(1)
      .once(
        "value",
        (one) => {
          let person = one.val()
          if (!person) {
            person = {
              uid: user.uid ,
              email: user.email,
              displayName: user.displayName || user.email,
              photoURL: user.photoURL || ""
            }
            const personId = firebase
                              .database()
                              .ref("people")
                              .push(person)
                              .key
            self._createFBUser(user.uid, personId, user.email )
            self.props.onAuthenticated(user, "", personId, false, false, person )

          } else {
            const personId = Object.keys(person)[0]
            const peep = person[personId]
            self._createFBUser(user.uid, personId, user.email )
            self.props.onAuthenticated(user, "", personId, peep.isSuperAdmin, peep.isBDFL, peep)

            // var updates = {};
            // updates['/people/' + personId + '/isSuperAdmin'] = true;
            // updates['/people/' + personId + '/isBDFL'] = true;
            //
            // database.ref().update(updates);
          }
        }
      )
      // This gives you a Google Access Token. You can use it to access the Google API.
      // token = result.credential.accessToken;

    } catch(x) {
      console.log(x)
    }
  }

  _checkAuth(result) {
    const self = this
    try {
      if (result && (result.user || result.uid)) {
        self._retrieveFBPerson(result.user.uid)
      }
    } catch(x2) {
      console.log('doh. ', x2)
    }
  }
  componentWillMount() {
    const self = this
    this.unsubscribe = firebase.auth().onAuthStateChanged(
      (user) => {
        try {
          if(user) {
            self._retrieveFBPerson(user)
          } else {
            self.props.onLogout()
          }
        } catch(x) {
          console.log('componentWillMount: ', x)
        }
      }
    )

    try {
      database
      .ref("list_behaviors")
      .once("value",
        snap => {
          if (snap && snap.val() ) {
            try {
              console.log('from db ', snap.val())
              self.props.onListBehaviors(snap.val())
            } catch(x) {
              console.log(x)
            }

          } else {
            const arr = [{
                caption: "Hyper Activity",
                delta: 1.0,
                value: 0 // this holds the place for us to track state in the app, it will always be 0 in the db
              }, {
                caption:"Proper Eating",
                delta: 1.0,
                value: 0 // this holds the place for us to track state in the app, it will always be 0 in the db
              }]

            arr.map(
              b => {
                database
                .ref("list_behaviors")
                .push(b)
              }
            )
          }
        }
      )
    } catch(x) {
      console.log('doh list_behaviors ', x)
    }


  }
  componentWillUnmount() {
    try {
      this.unsubscribe()
    } catch(x) {console.log(x)}
  }

  _logout() {
    const self = this
    try {
      log('in _logout: ', this)
      firebase.auth().signOut().then(
        () => {
          console.log('signed out of firebase')
          self.props.onLogout()
          try {
            localStorage.removeItem('state');
          } catch(x) {
            console.log(x)
          }
          browserHistory.push("/")

        }
      )
    } catch(x) {
      console.log('failed in root logout: ', x)
    }
  }

  render() {
    const self = this

    if (this.props.isAuthenticated) {
      return (
        <div>
          <Navbar logout={this._logout} email={this.props.user.email} />
          <div className="container">
            {this.props.children}
          </div>
          <footer className="navbar navbar-default navbar-fixed-bottom">
            <div className="container">
                <div className="btn-group btn-group-justified" role="toolbar">
                  <div className="btn-group" role="group">
                    <Link to="/dashboard">
                      <button type="button" className="btn btn-default">
                        <i className="fa fa-dashboard"></i>
                      </button>
                    </Link>
                  </div>
                  <div className="btn-group" role="group">
                    <Link to="/students">
                      <button type="button" className="btn btn-default">
                        <i className="fa fa-users"></i>
                      </button>
                    </Link>
                  </div>
                  <div className="btn-group" role="group">
                    <Link to="/">
                      <button type="button" className="btn btn-default">
                        <i className="fa fa-film"></i>
                      </button>
                    </Link>
                  </div>
                  <div className="btn-group" role="group">
                    <Link to="/chat">
                      <button type="button" className="btn btn-default">
                        <i className="fa fa-wechat"></i>
                      </button>
                    </Link>
                  </div>
                </div>
            </div>
          </footer>
        </div>
      )
    } else {
      return (
        <div className="container">
          <Login onSuccess={this._checkAuth} firebase={firebase} component={"login"} />
        </div>
      )
    }
  }
}


export default connect(
  (state, ownProps) => ({
      user: state.auth.user,
      isAuthenticated: state.auth.user != null,
      student: state.auth.viewPersonId
    })

  ,
  {
    onLogout: () => ({
      type:"logout", user: null, isAuthenticated: false, credentials: null
    }),
    onAuthenticated: (user, credentials, personId, isSuperAdmin=false, isBDFL=false, person=null ) => {
      log('in onAuthenticated action ', user, credentials, personId)
      return {
        type: "login",
        user: user,
        isAuthenticated: true,
        credentials: credentials,
        personId: personId,
        displayName: person? person.displayName||"" : "",
        photoURL: person ? person.photoURL || person.picURL || "" : "",
        isSuperAdmin: isSuperAdmin,
        isBDFL: isBDFL,
        viewPersonId: personId,
        viewPerson: person,

      }
    },
    reAuth: (user) => ({
        type: "auth",
        user: user,
        isAuthenticated: true
    }),
    onListBehaviors: (behaviors) => ({
      type: "onListBehaviors",
      list_behaviors: behaviors
    })
  }
)(App)
