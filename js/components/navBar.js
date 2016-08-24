import React from 'react';
import { Link, IndexLink } from 'react-router'
import { connect } from 'react-redux'


class Nav extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const self = this
    return (
      <nav className="navbar navbar-default navbar-fixed-top">
        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a  href="/">
            {
              self.props.student &&
                <img src={self.props.student.val.picURL} alt={self.props.student.val.name}
                  title={self.props.student.val.name}
                  style={{height:"50px"}} />
            }
            {
              !self.props.student &&
                <img src='img/x.png' alt='fragile not broken' title='fragile not broken'/>
            }
            </a>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
              <li className="active"><IndexLink to="/" activeClassName="active">Home</IndexLink></li>
              <li className="dropdown" >
                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button">
                  Add <span className="caret"></span>
                </a>
                <ul className="dropdown-menu">
                  <li><Link to="/addBehavior">Behavior</Link></li>
                  <li><a href="#">Event</a></li>
                </ul>
              </li>
              <li><a href="#">Videos</a></li>
              <li className="dropdown">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">People <span className="caret"></span></a>
                <ul className="dropdown-menu">
                  <li><Link to="/students">Students</Link></li>
                  <li><a href="#">Test Student</a></li>
                  <li><a href="#">Bassel</a></li>
                  <li role="separator" className="divider"></li>
                  <li className="dropdown-header">Nav header</li>
                  <li><a href="#">Separated link</a></li>
                </ul>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right">

                { self.props.isSuperAdmin &&
                  <li>
                    <a href="javascript:void(0);">
                      <i className="fa fa-gear" alt="settings" title="settings" />
                    </a>
                  </li>

                }

                { self.props.isSuperAdmin &&
                    <li>
                      <a href="javascript:void(0);">
                        <i className="fa fa-gears" alt="global settings" title="global settings" />
                      </a>
                    </li>

                }

              <li className="bg-danger">
                  <a href='javascript:void(0);' onClick={self.props.logout} title='logout' alt='logout'>
                    <span style={{marginRight: "1em"}}> { self.props.email }</span>
                    <i className="fa fa-sign-out" aria-hidden="true" alt='logout' title='logout'> </i>
                  </a>
              </li>


            </ul>
          </div>
        </div>
      </nav>

    )
  }
}


export default connect(
  (state, ownProps) => ({
      user: state.auth.user,
      isAuthenticated: state.auth.user != null,
      student: state.students.student,
      isSuperAdmin: state.auth.isSuperAdmin
    })


)(Nav)
