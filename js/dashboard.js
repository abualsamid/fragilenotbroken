import React from 'react';
import { connect } from 'react-redux'
import log from './log'


class D extends React.Component {
  constructor(props) {
    super(props)
    this.drawChart = this.drawChart.bind(this)

  }
  componentDidMount() {
    this.drawChart()
  }
  drawChart() {
      const self = this

      var behaviorData = new google.visualization.DataTable();
      behaviorData.addColumn('string', 'Workout progress');
      behaviorData.addColumn('number', 'Goal');
      behaviorData.addColumn('number', 'Pace');
      behaviorData.addColumn('number', 'Current');

      behaviorData.addRows([
        [{v: "Mile", f: 'Miles'},  5, Math.round(3)],
        [{v: "Set", f:'Sets'}, 12,Math.round(21.5) ],
      ]);

      var options = {
        chart: {
          title: 'Workout Progress',

        },
        vAxis: {
          format: '###.##'
        },

      };

      // Instantiate and draw the chart.

      var behaviorChart = new google.visualization.ColumnChart(document.getElementById('behaviorChart'));
      behaviorChart.draw(activityData, options);
  }

  render() {
    return (
      <div style={{backgroundColor:"white", height:"100%", minHeight:"100%"}}>
        <h3>Dashboard</h3>
        <div id='behaviorChart' />
      </div>
    )
  }
}

export default connect(
  (state, ownProps) => {
    return {
      user: state.auth.user,
      student: state.students.student
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
)(D)
