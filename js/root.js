import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import Login from './async';
import Navbar from './components/navBar'

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

Date.daysBetween = function( date1, date2 ) {
  //Get 1 day in milliseconds
  var one_day=1000*60*60*24;

  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = date2_ms - date1_ms;

  // Convert back to days and return
  return Math.floor(difference_ms/one_day);
}

Date.sameDay = function(date1, date2) {
  return (date1.getFullYear()==date2.getFullYear() && date1.getMonth()==date2.getMonth() && date1.getDate()==date2.getDate())
}

var d = Date.prototype;
Object.defineProperty(d, "react", {
  get: function() {
    function pad(i) {
        if (i<10) {
          return "0" + i
        }
        return i
      }
    return  this.getFullYear() + "-" +  pad(1+this.getMonth()) + "-" +pad(this.getDate())
  }
});


const START="08/07/2016"
const END="08/15/2017"
const TARGET_MILES=900
const TARGET_SETS=5*TARGET_MILES
const GOAL_PACE=(TARGET_MILES/Date.daysBetween(new Date(START),new Date(END))).toFixed(2)
const DAYS_SINCE=Date.daysBetween(new Date(START), new Date())
const CURRENT_GOAL_MILES=(GOAL_PACE * DAYS_SINCE).toFixed(2)
const CURRENT_GOAL_SETS=(5* GOAL_PACE * DAYS_SINCE).toFixed(2)



class Root extends React.Component {
  constructor(props) {
    super(props)

    this._submit = this._submit.bind(this)
    this._logout = this._logout.bind(this)
    this._save2DB = this._save2DB.bind(this)

    this.state = {
      entries: [],
      startDate : new Date(START),
      targetDate: new Date(END),
      currentMiles: 0,
      currentSets: 0,
      currentGoalMiles: 0,
      currentGoalSets: 0,
      targetMiles: TARGET_MILES,
      targetSets: TARGET_SETS,
      daysSince: Date.daysBetween(new Date(START), new Date()  ),
      daysTill: Date.daysBetween(new Date(), new Date(END) ),
      goalPaceMiles: GOAL_PACE,
      goalPaceSets: 5*GOAL_PACE,
      entryDate: new Date(),
      maxMiles: 0,
      maxSets: 0,
      maxPaceMiles: 0,
      maxPaceSets: 0,
      activities: new Set()
    }

    this.isDirty = false
  }
  componentDidMount() {
    this.newMiles.value=0
    this.newSets.value=0
    this.newActivity.value=""

  }


  _toReactDate(d) {
    function pad(i) {
      if (i<10) {
        return "0" + i
      }
      return i
    }
    return d.getFullYear() + "-" + pad(1+d.getMonth()) + "-" +pad(d.getDate())
  }

  _submit() {
    const a = this.newActivity.value.trim()
    const m = parseFloat(this.newMiles.value.replace(",","") ||0 )
    const s = parseFloat(this.newSets.value.replace(",","") || 0 )

    if (!a && !m && !s) {
      return
    }
    this.newActivity.value=""
    this.newMiles.value="0"
    this.newSets.value="0"
    const newEntry = {
      activity: a, miles: m, sets: s, date: this.state.entryDate
    }
    try {
      database
      .ref("state/" + firebase.auth().currentUser.uid +"/entry/" + this.state.entryDate.react + "/" + a)
      .transaction((entry) => {
        if(entry) {
          entry.miles += m;
          entry.sets += s;
          return entry
        } else {
          return newEntry
        }
      })
    } catch(x) {console.log('doh: ', x)}

    console.log('adding ', a, m, s, newEntry)
    const daysSince = Date.daysBetween(new Date(START), new Date()  )
    const paceMiles = (this.state.currentMiles + m) / daysSince ;
    const paceSets = (this.state.currentSets + s) / daysSince;
    const goalMiles = GOAL_PACE * daysSince;
    const goalSets = 5*GOAL_PACE * daysSince;

    var activities=this.state.activities
    activities.add(a)
    var foundOne=false
    var addIfExists = this.state.entries.map(
      (entry,index) => {
        if (!foundOne  && Date.sameDay(new Date(entry.date), this.state.entryDate)  && entry.activity == a)  {
          foundOne=true
          return {activity: entry.activity, miles: entry.miles + m, sets: entry.sets + s, date: entry.date }
        } else {
          return entry
        }
      }
    )
    const newEntries = [...this.state.entries, newEntry]
    this.isDirty=true
    this.setState({entries: foundOne?addIfExists:newEntries ,
        currentMiles: this.state.currentMiles + m,
        currentSets: this.state.currentSets + s ,
        currentGoalMiles: goalMiles,
        currentGoalSets: goalSets,
        maxMiles: m>this.state.maxMiles?m: this.state.maxMiles,
        maxSets: s>this.state.maxSets?m: this.state.maxSets,

        daysSince: daysSince,
        daysTill: Date.daysBetween(new Date(), new Date(END) ),
        maxPaceMiles: paceMiles> this.state.maxPaceMiles? paceMiles: this.state.maxPaceMiles,
        maxPaceSets: paceSets> this.state.maxPaceSets ? paceSets : this.state.maxPaceSets,
        activities: activities
      }
    )
  }
  componentWillUnmount() {
    try {
      this._save2DB()
    } catch(x) { console.log('err in cwu ', x)}
    try {
      database
      .ref("state/" + this.props.user.uid + "/entry")
      .off()
    } catch(x) { console.log('error offing ', x)}
  }
  componentDidUpdate(prevProps, prevState) {
    try {
      this._save2DB()
    } catch(x) {
      console.log('err in cdu ', x)
    }
  }
  componentWillMount() {
    const self = this
    try {
      database.ref("state/" + self.props.user.uid +"/entries").once("value",
        (s) => {
          if (s && s.val()) {
            const entries = s.val()
            self.setState({entries: entries})
            var currentMiles = 0
            var currentSets = 0
            var maxMiles = 0
            var maxSets = 0

            entries.map( (entry, index) => {
              currentMiles += entry.miles
              currentSets += entry.sets
              maxMiles = entry.miles>maxMiles ? entry.miles : maxMiles
              maxSets = entry.sets >maxSets ? entry.sets : maxSets
            } )
            self.setState({currentMiles: currentMiles, currentSets: currentSets, maxSets: maxSets, maxMiles: maxMiles  })
            const paceMiles = (currentMiles ) / Date.daysBetween(new Date(this.state.START), new Date()  );
            const paceSets = (currentSets ) / Date.daysBetween(new Date(this.state.START), new Date()  );

          }
        }
      )
    } catch(x) {
      console.log('error loading data ', x)
    }

    try {
      database
      .ref("state/" + firebase.auth().currentUser.uid + "/entry")
      .on("child_changed", (entry) => {
        console.log('child added: ', entry, entry.val())
        self.setState({entries: [...self.state.entries, entry.val()]})
      })
    } catch(x) {
      console.log('double dobh ', x)
    }

  }
  _save2DB() {

    try {
      const self = this

      if (firebase.auth().currentUser && self.isDirty) {

        const stats = {
          currentMiles: this.state.currentMiles ,
          currentSets: this.state.currentSets  ,
          maxMiles: this.state.maxMiles,
          maxSets: this.state.maxSets,

          daysSince: this.state.daysSince,
          daysTill: this.state.daysTill,
          maxPaceMiles:  this.state.maxPaceMiles,
          maxPaceSets:  this.state.maxPaceSets
        }
        var updates = {};
        const uid= firebase.auth().currentUser.uid

        updates['/state/' + uid + '/entries' ] = self.state.entries;
        updates['/state/' + uid + '/stats'] = stats;
        self.isDirty=false
        return firebase.database().ref().update(updates);
      } else {
        return Promise.resolve(false)
      }
    } catch(x) {
      console.log('error in save2db ', x)
    }

  }

  _logout() {
    const self = this
    try {
      // also firebase.auth().currentUser.uid;
      self
      ._save2DB()
      .then(
        firebase.auth().signOut().then(
          () => {
            // Sign-out successful.
            console.log('adios...')
            self.props.onLogout()

          },
          (error) => {
            console.log('failed to logout ', error )
          }
        )

      )

    } catch(x) {
      console.log('hmm ', x)
    }

  }
  render() {
    function fromISODate(d) {
      const a = d.split("-")
      return a[1] + "/" + a[2] + "/" + a[0]
    }
    const currentPaceMilesClass = (this.state.currentMiles/this.state.daysSince) >= this.state.goalPaceMiles ? "text-success" : "text-danger"
    const currentPaceSetsClass = (this.state.currentSets/this.state.daysSince) >= this.state.goalPaceSets ? "text-success" : "text-danger"


    return <div className="container">
      <div>
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th rowSpan="2">Start Date</th>
              <th colSpan="3">Current</th>
              <th colSpan="2">Pace</th>
            </tr>
            <tr>
              <th>Days</th>
              <th>Miles
                  <br/>
                  (Goal)
              </th>
              <th>Sets
                <br/>
                (Goal)
              </th>
              <th>Miles
              </th>
              <th>
                Sets
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{this.state.startDate.toLocaleDateString() }</td>
              <td>{this.state.daysSince}</td>
              <td>
                <span className={currentPaceMilesClass}>
                { this.state.currentMiles.toFixed(2) }
                </span>
                <br/>
                ( { CURRENT_GOAL_MILES } )
              </td>
              <td>
                { this.state.currentSets.toFixed(2) }
                <br/>
                ( { CURRENT_GOAL_SETS } )
              </td>
              <td><span className={currentPaceMilesClass}>
                { (this.state.currentMiles/this.state.daysSince).toFixed(2) } </span>
              </td>
              <td>
                <span className={currentPaceSetsClass}>
                  { (this.state.currentSets/this.state.daysSince).toFixed(2) }
                </span>
              </td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th rowSpan="2">Target Date</th>
              <th colSpan="3">Remaining</th>
              <th colSpan="2">Future Pace</th>
            </tr>

            <tr>
              <th>Days</th>
              <th>Miles</th>
              <th>Sets</th>
              <th>Miles</th>
              <th>Sets</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{this.state.targetDate.toLocaleDateString() }</td>
              <td>{this.state.daysTill}</td>
              <td>{this.state.targetMiles - this.state.currentMiles}</td>
              <td>{this.state.targetSets - this.state.currentSets}</td>

              <td>{ ((this.state.targetMiles - this.state.currentMiles)/this.state.daysTill).toFixed(2)}</td>
              <td>{ ((this.state.targetSets - this.state.currentSets)/this.state.daysTill).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div className="form-group">
          <label>Activity</label>
          <input type="text" className="form-control" placeholder="activity" ref={ (e)=>this.newActivity = e } />
        </div>
        <div className="form-group">
          <label>Miles</label>
          <input type="number" className="form-control" placeholder="miles" ref={ (e) => this.newMiles = e } />
        </div>
        <div className="form-group">
          <label>Sets</label>
          <input type="number" className="form-control" placeholder="sets" ref={ (e) => this.newSets = e} />
        </div>
        <div className="form-group">
          <label>Date</label>
            <input type="date" value={ this.state.entryDate.react  } className="form-control"
            onChange={ (e) => {this.setState({entryDate: new Date(fromISODate(e.target.value)) }); } } />

        </div>
        <div className="row">
          <div className="col-md-12">
            <button className="btn  btn-block btn-primary" onClick={this._submit}>Add</button>
          </div>
        </div>
        <br/>

      </div>

    </div>
  }
}


class App extends React.Component {
  constructor(props) {
    super(props)
    var user = firebase.auth().currentUser
    this.state= {
      isAuthenticated: (user) ? true : false ,
      user: user
    };

    this._logout = this._logout.bind(this)
    this._checkAuth=this._checkAuth.bind(this)

  }

  _checkAuth(result) {
    const self = this

    function handleAuthError(error) {
      console.log("failed to login: ", error);
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
    }
    function handleAuthSuccess(result) {
      var token=""
      console.log("handleAuthSuccess: ", result);
      if (result && result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        token = result.credential.accessToken;
        try {
          localStorage.setItem("credential",JSON.stringify(result.credential) )
        } catch(x) {console.log(x)}
      }
      // The signed-in user info.
      if (result && result.user) {
        var user = result.user;
        if (user) {
          try {
            self.setState({isAuthenticated: true, token: token, user: user })
          } catch(x) {
            console.log(x)
          }
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
    this._checkAuth()
    this.unsubscribe = firebase.auth().onAuthStateChanged(
      (user) => {
        try {
          if(user) {
            this.setState({isAuthenticated: true, user: user})
          } else {
            this.setState({isAuthenticated: false, user: null})
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
    try {
      console.log('in _logout: ', this)
      firebase.auth().signOut().then(
        () => {
          console.log('signed out of firebase')
        }
      )
      this.setState({isAuthenticated: false})
    } catch(x) {
      console.log('failed in root logout: ', x)
    }
  }

  render() {
    if (this.state.isAuthenticated) {
      return <div>
        <Navbar logout={this._logout} email={this.state.user.email} />
        <Root user={this.state.user} onLogout={this._logout}/>
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
ReactDOM.render(<App/>, document.getElementById('root'));
