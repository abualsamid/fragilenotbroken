import React from 'react';

export default class Login extends React.Component {
  constructor(props) {
    super(props)
    this._login = this._login.bind(this)
    this._loginWithPopup = this._loginWithPopup.bind(this)
  }
  render() {
    return <div>
      <button className="btn btn-block btn-primary" onClick={this._login} >
        <span> <i className="fa fa-google" /> Login with Google </span>
       </button>
    </div>
  }
  _login() {
    const self = this
    var provider = new this.props.firebase.auth.GoogleAuthProvider();
    // provider.addScope('https://www.googleapis.com/auth/plus.login');
    if (process.env.NODE_ENV=='production') {
      this.props.firebase.auth().signInWithRedirect(provider);
    } else {
      this.props.firebase.auth()
      .signInWithPopup(provider)
      .then( (result) => {
        console.log('going to success: ', result )
        this.props.onSuccess(result)
      })
    }
  }
  _loginWithPopup() {
    var provider = new this.props.firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');

    this.props.firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      this.props.onSuccess()
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }
}
