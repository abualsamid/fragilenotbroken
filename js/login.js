import React from 'react';
import log from './log'

export default class Login extends React.Component {
  constructor(props) {
    super(props)
    this._login = this._login.bind(this)
    this._loginWithPopup = this._loginWithPopup.bind(this)

    this._loginWithEmail=this._loginWithEmail.bind(this)
    this.state  = {
      message:""
    }
  }
  componentDidMount() {
    const self = this
    try {
      firebase
      .auth()
      .getRedirectResult()
      .then(function(result) {
        if (result && result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          self.props.onSuccess(result)
          // The signed-in user info.
          var user = result.user;
        }
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
    } catch(x) {
      console.log('error in login.js ' , x)
    }

  }
  _loginWithEmail(e) {
    e.preventDefault()

    if (!this.password || !this.email) {
      this.setState({
        message:"Please provide an email address and a password to continue."
      })
      return false
    }

    firebase
    .auth()
    .createUserWithEmailAndPassword(this.email, this.password)
    .then(
      result => {
        this.props.onSuccess(result)
      }
    )
    .catch(
      error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        switch(errorCode) {
          case "auth/email-already-in-use": // the user had already created a gmail account, use that instead to login.
            console.log(errorCode, errorMessage, error )

            // if the user already exists, just login??
            firebase
            .auth()
            .signInWithEmailAndPassword(this.email, this.password)
            .then( (result) => {
                log('Going to success: ', result )
                this.props.onSuccess(result)
              })
            .catch( (error) => {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              console.log(errorCode, errorMessage, error )
              this.setState({
                message:errorMessage
              })
              // ...
            })
            return false;
            break;
          default:
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode, errorMessage, error )
            this.setState({
              message:errorMessage
            })
            return false;
            break;
        }

      }
    )

    return false;
  }
  render() {
    return <div>
      <p className="lead">
        If you have a gmail or a google apps account you can just sign-in with your google credentials.
        The login process is handled by Google and your credentials are not stored on our systems.
      </p>

      <button className="btn btn-block btn-primary" onClick={this._login} >
        <span> <i className="fa fa-google" /> Login/Sign-up with Google </span>
       </button>
       <br/>
       <div className="text-center block-center">
         OR
       </div>
       <p className="lead">
         If you prefer you can provide an email address and a password to access the system. If your account does not exist in our system, we will create one for you on the fly.
       </p>
       <br/>

       <form onSubmit={e=>{ e.preventDefault(); return false} } >
         <div className="form-group">
           <label htmlFor='email'>Email</label>
           <input type='email' className="form-control" onChange={e=>{this.email = e.target.value}}></input>
         </div>
         <div className="form-group">
           <label htmlFor='password'>Password</label>
           <input type='password' className='form-control' onChange={e=>this.password=e.target.value}></input>
         </div>
         <div className="btn-group btn-group-justified" role="toolbar">
           <div className="btn-group" role="group">
             <button type="button" className="btn-default btn" onClick={this._loginWithEmail}>Login/Sign-up with your Email</button>
           </div>
         </div>
       </form>
         {
           this.state.message &&
           <div>
             <br/>
             <div className="alert alert-danger">
               <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"> </span>
               &nbsp;
               <span className="sr-only"> Error: </span>
               &nbsp;
               {this.state.message}
             </div>
           </div>

         }
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
        log('going to success...: ', result )
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
