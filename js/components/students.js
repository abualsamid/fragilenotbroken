import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'

var database = firebase.database();

class Students extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      students: []
    }
    this._addStudent=this._addStudent.bind(this)
    this._select = this._select.bind(this)
    this._selectPic = this._selectPic.bind(this)
    this.picURL = ""
  }
  _addStudent() {
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


    const studentId = database
    .ref("people" )
    .push(newStudent)
    .key


    if (self.props.personId) {
      database
      .ref("people/" + studentId + "/guardians")
      .push(self.props.personId)

      database
      .ref("people/" + self.props.personId + "/children")
      .push(studentId)
    } else {
      console.log('doh... no person ID attached at login.')
    }

  }
  _select(student) {
    this.props.selectStudent(student)
  }

  _selectPic(e) {
    const self = this
    try {
      e.stopPropagation();
    } catch(x) {

    }
    e.preventDefault();
    console.log('selecting ...')
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
  componentWillMount() {
    const self = this
    try {
      var uid = self.props.user.uid;

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
    return <div>
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
      <button type="button" className="btn btn-block btn-primary" onClick={this._addStudent}>Add</button>
      <hr/>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Student</th>
            <th>Select</th>
          </tr>
        </thead>
        <tbody>
          { this.state.students.map((student, index) => {
            if(student) {
              return  <tr key={index}>
                        <td>{student.val().name}</td>
                        <td><button type="button" className="btn" onClick={(e) => this._select(student)} >Select </button></td>
                      </tr>
            } else {
              return null
            }
          })}
        </tbody>
      </table>
    </div>
  }
}

export default connect(
  (state, ownProps) => {
    console.log('connecting state ', state)
    return {
      user: state.auth.user,
      student: state.students.student,
      personId: state.auth.personId
    }
  },
  {
    onLogout: () => ({
      type:"logout", user: null, isAuthenticated: false, credentials: null
    }),
    selectStudent: (student) => ({
      type:"selectStudent", student: { key: student.key, val: student.val() }
    }),

  }


)(Students)
