import React from 'react';
import { connect } from 'react-redux'


class AddBehavior extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: ""
    }
    this._messageChanged = this._messageChanged.bind(this)
    this._submit = this._submit.bind(this)
    console.log('fire base is ', firebase)
    console.log('student is ',this.props.student, this.props.student.val, this.props.student.key )
  }

  _messageChanged(e) {
    this.setState({message: e.target.value })
  }
  _submit(t) {
    console.log(t)
    console.log(this.state.message)
    this.setState({message:""})
    // firebase
    // .database()
    // .ref()
  }

  render() {
    return (
      <div className="container">
        <div>
        </div>
        <div className="form-group">
          <textarea className="form-control"  onChange={this._messageChanged} value={this.state.message} />
        </div>
        <button type="button" className="btn btn-block btn-lg btn-success" onClick={ () => this._submit(0) }>Calm Hands</button>
        <button type="button" className="btn btn-block btn-lg btn-danger" onClick={ () => this._submit(1) }>Excited Hands</button>
        <button type="button" className="btn btn-block btn-lg btn-success"onClick={ () => this._submit(2) }>Neat Eating</button>
        <button type="button" className="btn btn-block btn-lg btn-danger" onClick={ () => this._submit(3) }>Messy Eating</button>
      </div>
    )

  }
}

export default connect(
  (state, ownProps) => {
    console.log('connecting state ', state)
    return {
      user: state.auth.user,
      viewPersonId: state.auth.viewPersonId
    }
  },
  {
    onLogout: () => ({
      type:"logout", user: null, isAuthenticated: false, credentials: null
    }),
    selectStudent: (student) => ({
      type:"selectStudent", student: student
    }),

  }


)(AddBehavior)
