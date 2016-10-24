import React from 'react';
import { connect } from 'react-redux'
import log from '../utils/log'
import {getWeek, getYear, getMonth, getDate} from '../utils/fb/'

class D extends React.Component {
  constructor(props) {
    super(props)
    this.drawChart = this.drawChart.bind(this)
    this.do = this.do.bind(this)
    this._filterChanged=this._filterChanged.bind(this)
    this._speak=this._speak.bind(this)
    this.state = {
      green: 0,
      red: 0,
      filter: "date/" + getDate(),
      allStats : {}
    }

    try {
      log('inside Dashboard constructor')
    } catch(x) {
      console.error(x)
    }
  }

  _speak(msg) {
    var msg = new SpeechSynthesisUtterance( msg);
    window.speechSynthesis.speak( msg );
  }
  do() {
    if (google && google.visualization) {
      this.drawChart()
    } else {
      setTimeout(this.do, 250)
    }
  }



  _filterChanged(filter="all") {
    const self = this
    if(self.props && self.props.viewPerson && self.props.viewPersonId) {
      console.log('in _filter changed ', filter )
      self.setState({filter})
      setTimeout(this.do, 250)

    }


  }
  componentWillUnmount() {
    try {
      firebase
      .database()
      .ref("/people/" + this.props.viewPersonId + "/stats/behaviors")
      .off()
    } catch(x) {
      console.log(x)
    }
  }
  componentDidMount() {
    const self = this
    self.behaviorChart = new google.visualization.ColumnChart(document.getElementById('behaviorChart'));
    self.pieChart = new google.visualization.PieChart(document.getElementById("pieChart"))
    try {
        firebase
        .database()
        .ref("/people/" + this.props.viewPersonId + "/stats/behaviors")
        .on("value",
          value => {
            if (value && value.val()) {
              let allStats = value.val()
              console.log('got allStats back ', allStats)
              allStats["green"] = allStats["green"] || {}
              allStats["red"] = allStats["red"] || {}
              self.setState({allStats})
              self._filterChanged( "date/" + getDate())
            }
          }
        )
    } catch(x) {
      console.log(x)
    }
  }

  drawChart() {
      const self = this
      let green = 0
      let red = 0
      if (this.state.filter=="all") {
        try {
          green = this.state.allStats.green[this.state.filter]||0

        } catch(x) {console.log(x)}
        try {
          red = this.state.allStats.red[this.state.filter]||0
        } catch(x) {console.log(x)}

      } else {
        let s = this.state.filter.split("/")
        try {
          green = this.state.allStats.green[s[0]][s[1]]||0
        } catch(x) {
          console.log(x, 'green', this.state.allStats.green, s)
        }

        try {
          red = this.state.allStats.red[s[0]][s[1]]||0
        } catch(x) {
          console.log(x,'red', this.state.allStats.red, s)
        }

      }
      green = Math.abs(green)
      red = Math.abs(red)
      this.setState({red})
      var behaviorData = google.visualization.arrayToDataTable(
        [
          ['Behavior','Count',{role: 'style'}, {role: 'annotation'}],
          ['Green Thought', Math.abs(green), 'color: green', "Green"],
          ['Red Thought', Math.abs(red), 'color: red', "Red"]
        ]
      )

      var options = {
        chart: {
          title: 'Behavior Tracker',
        },
        vAxis: {
          format: '###.##'
        },

      };
      self.behaviorChart.draw(behaviorData, options);



    var pieOptions = {
        chartArea: {width:'100%',height:'100%'},
        forceIFrame: 'false',
        is3D: 'true',
        pieSliceText: 'value',
        // sliceVisibilityThreshold: 1/20, // Only > 5% will be shown.
        titlePosition: 'top',
        colors: [
          'green', 'red'
        ]
    };
    self.pieChart.draw(behaviorData, pieOptions );
  }

  render() {
    return (
      <div style={{backgroundColor:"white", height:"100%", minHeight:"100%", padding: "1em"}}>
        <h3>Behaviors</h3>
        <div className="form-group">
          <select className="form-control" value={this.state.filter}
            onChange={e=> this._filterChanged(e.target.value) }>
            <option value="all">All</option>
            <option value={"date/" + getDate()}>Today - {getDate()}</option>
            <option value={"week/" + getWeek()}>This week - {getWeek()}</option>
            <option value={"month/" + getMonth()}>This month - {getMonth()}</option>
            <option value={"year/" + getYear()}>Year: {getYear()} </option>
          </select>
        </div>

        <div className="text-center" onClick={ e => this._speak(this.state.red)}>
          <span style={{color:'red', fontSize: '20rem'}}>
            {this.state.red}
          </span>
          <br/>
            {(function (rows, i, len) {
                while (++i <= len) {
                  rows.push(<i key={i} className="fa fa-thumbs-o-down" style={{color: 'red', fontSize: '5rem', textShadow: '1px 1px 1px #ccc'}}> &nbsp; </i>)
                }
                return rows;
            })([], 0, this.state.red)}

        </div>
        <hr/>
        <br/>
        <br/>
        <div id="redChart" />
        <br/>
        <div id='behaviorChart' />
        <br/>
        <div id="pieChart" />
      </div>
    )
  }
}

export default connect(
  (state, ownProps) => {
    return {
      user: state.auth.user,
      viewPersonId: state.auth.viewPersonId,
      viewPerson: state.auth.viewPerson
    }
  }

)(D)
