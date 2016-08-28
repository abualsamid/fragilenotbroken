import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import Login from './async';
import Navbar from './components/navBar'
import Add from './components/add'
import TimeLine from './components/timeLine'

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


class Root extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    }

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

  render() {
    const self = this
    return <div>

      <Add />
      <TimeLine />
    </div>
  }
}

export default connect(
  (state, ownProps) => {
    return {
      user: state.auth.user,
      student: state.students.student
    }
  },
  (dispatch) => {
    return {
      onLogout: () => {
        dispatch(
          () => { return {type:"logout", user: null }}
        )
      }
    }
  }
)(Root)
