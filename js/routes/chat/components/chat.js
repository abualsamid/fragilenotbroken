import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import ReactSwipe from 'react-swipe';

var style = require('./styles.css')

var database = firebase.database();

class Chat extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      students: []
    }
    this.swipeOptions = {
     continuous: true,
     callback(index,element) {
       console.log('slide changed: ', index);
     },
     transitionEnd(index,element) {
       console.log('ended transition:: ',index);
     }
   }
  }



  componentWillMount() {
    const self = this
    try {
      var uid = self.props.user.uid;
      console.log('getting my students... ',self.props, self.props.personId)
      database
      .ref("people")
      .orderByChild("ownerId")
      .equalTo(self.props.personId)
      .on('child_added', (data)=> {
        self.setState({students: [...this.state.students, data ]})
      })
    } catch(x) {
      console.log(x)
    }

  }
  componentWillUnmount() {
    try {
      if (this.props.user) {
        var uid = this.props.user.uid;
        database
        .ref("students/" + uid)
        .off()
      }

    } catch(x) {
      console.log(x)
    }

  }
  render() {
    return (
      <div className="container">
        <ReactSwipe className="carousel" swipeOptions={this.swipeOptions}
          ref={(e) => { this.ReactSwipe = e } }
        >
        <div className="panel panel-info chatbox">
          <div className="panel-heading">Friends</div>
            <div className="panel-body">
              <div id="chat-body">
              </div>
            </div>
        </div>
        <div>
          <div className="panel panel-info chatbox">
            <div className="panel-heading">Chats</div>
            <div className="panel-body">
              <div id="chat-body">
              </div>
            </div>
            <div className="panel-footer">
              <div className="form">
                <div className="form-group">
                  <input type="text" className="form-control" id="chat-message" placeholder="G'day mate" />
                </div>
              </div>
            </div>
          </div>

          <div className="well well-sm">
            <samp id="status-bar"></samp>
          </div>


        </div>
      </ReactSwipe>
      </div>
    )

  }
}

export default connect(
  (state, ownProps) => {
    return {
      user: state.auth.user,
      student: state.auth.viewPersonId,
      personId: state.auth.personId
    }
  },
  {
    onLogout: () => ({
      type:"logout", user: null, isAuthenticated: false, credentials: null
    }),

  }


)(Chat)
