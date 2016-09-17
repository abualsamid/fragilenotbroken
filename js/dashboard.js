import React from 'react';
import { connect } from 'react-redux'
import log from './log'

class D extends React.Component {
  constructor(props) {
    super(props)
    this.drawChart = this.drawChart.bind(this)
    this.do = this.do.bind(this)
    this.state = {
      green: 0,
      red: 0
    }
    require.ensure([], (require) => {
      var log = require('./log')
    })
    try {
      log('inside Dashboard constructor')
    } catch(x) {
      console.error(x)
    }
  }



  do() {
    if (google && google.visualization) {
      this.drawChart()

    } else {
      log('hi')
      setTimeout(this.do, 250)
    }
  }

  componentWillMount() {
    const self = this
    if(this.props && this.props.viewPerson && this.props.viewPersonId) {
      try {
        firebase
        .database()
        .ref("/people/" + this.props.viewPersonId + "/stats/behaviors")
        .on("value",
          value => {
            let cats = value.val()
            log('categories are ', cats )
            self.setState({
              green: cats["green"] ? cats["green"]["all"] : 0,
              red: cats["red"] ? cats["red"]["all"] : 0,
            })
          }
        )
      } catch(x) {
        console.log(x)
      }
    }


  }
  componentDidMount() {
    const self = this

    try {
      setTimeout(self.do, 250)
    } catch(x) {
      log(x)
    }
  }

  componentDidUpdate() {
    this.drawChart()
  }

  drawChart() {
      const self = this
      var behaviorData = google.visualization.arrayToDataTable(
        [
          ['Behavior','Count',{role: 'style'}, {role: 'annotation'}],
          ['Green Thought', this.state.green, 'color: green', this.state.green],
          ['Red Thought', this.state.red, 'color: red', this.state.red]
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

      // Instantiate and draw the chart.

      var behaviorChart = new google.visualization.ColumnChart(document.getElementById('behaviorChart'));
      behaviorChart.draw(behaviorData, options);
  }

  render() {
    return (
      <div style={{backgroundColor:"white", height:"100%", minHeight:"100%", padding: "1em"}}>
        <h3>Behaviors</h3>
        <div id='behaviorChart' />
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
