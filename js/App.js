import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import Root from './root'
import Login from './login';
import Navbar from './components/navBar'
import { connect } from 'react-redux'
import {  browserHistory } from 'react-router';
import log from './log'

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
  }

  _checkAuth(result) {
    const self = this

    function handleAuthError(error) {
      log("failed to login: ", error);
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      self.props.onLogout()
      browserHistory.push("/")
    }

    function handleAuthSuccess(result) {
      log("handleAuthSuccess: ", result);
      // The signed-in user info.
      if (result && result.user) {
        try {
          firebase
          .database()
          .ref("people")
          .orderByChild("uid")
          .equalTo(result.user.uid)
          .limitToFirst(1)
          .once(
            "value",
            (one) => {
              const person = one.val()
              if (!person) {
                const personId = firebase
                                  .database()
                                  .ref("people")
                                  .push({
                                    uid: result.user.uid ,
                                    email: result.user.email,
                                    displayName: result.user.displayName,
                                    photoURL: result.user.photoURL
                                  })
                                  .key
                log('created person with key: ', personId)
                self.props.onAuthenticated(result.user, result.credential, personId, false, false )

              } else {
                const personId = Object.keys(person)[0]
                const peep = person[personId]
                log('retrieved person with key: ', personId, peep)
                self.props.onAuthenticated(result.user, result.credential, personId, peep.isSuperAdmin, peep.isBDFL)


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
    }

    try {
      if (result && result.user) {
        handleAuthSuccess(result)
      }
    } catch(x2) {
      console.log('doh. ', x2)
    }
  }
  componentWillMount() {
    const self = this
    this._checkAuth()
    this.unsubscribe = firebase.auth().onAuthStateChanged(
      (user) => {
        try {
          if(user) {
            self.props.reAuth(user)
            uid = user.uid
            //  firebase.auth().currentUser.uid
          } else {
            self.props.onLogout()
          }
        } catch(x) {
          console.log('componentWillMount: ', x)
        }
      }
    )
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
        }
      )
    } catch(x) {
      console.log('failed in root logout: ', x)
    }
  }

  render() {
    const self = this
    if (this.props.isAuthenticated) {
      return <div>
        <Navbar logout={this._logout} email={this.props.user.email} />
        {/* add this */}
        <div className="container">

          {this.props.children}
        </div>
      </div>
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
      student: state.students.student
    })

  ,
  {
    onLogout: () => ({
      type:"logout", user: null, isAuthenticated: false, credentials: null
    }),
    onAuthenticated: (user, credentials, personId, isSuperAdmin=false, isBDFL=false ) => {
      log('in onAuthenticated action ', user, credentials, personId)
      return {
        type: "login",
        user: user,
        isAuthenticated: true,
        credentials: credentials,
        personId: personId,
        isSuperAdmin: isSuperAdmin,
        isBDFL: isBDFL
      }
    },
    reAuth: (user) => ({
        type: "auth",
        user: user,
        isAuthenticated: true
    })
  }
)(App)
