import React from 'react';
import ReactDOM from 'react-dom';
import Root from './root'
import Login from './login';
import Navbar from './navBar'
import { connect } from 'react-redux'
import {  browserHistory, Link } from 'react-router';
import log from '../utils/log'

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

    if (this.props.isLoading) {
      return(
        <div>
          <h3>Loading the awesome... please wait...</h3>
        </div>
      )
    }
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
      student: state.auth.viewPersonId,
      isLoading: state.auth.isLoading
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
