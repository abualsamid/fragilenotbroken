import React from 'react';
import { Link, IndexLink } from 'react-router'
import { connect } from 'react-redux'
import log  from '../utils/log'

class Nav extends React.Component {
  constructor(props) {
    super(props)
  }
  componentWillReceiveProps(props) {
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
            </button>
            <IndexLink to="/" activeClassName="active" className="nav-link">
            {
              self.props.viewPersonId &&
                <img src={self.props.viewPerson.picURL || self.props.viewPerson.photoURL || "/img/generic.jpg"} alt={self.props.viewPerson.name}
                  title={self.props.viewPerson.name}
                  style={{height:"50px"}} />
            }
            {
              !self.props.viewPersonId &&
                <img src='img/x.png' alt='fragile not broken' title='fragile not broken'/>
            }
            </IndexLink>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
              <li className="active">
                <IndexLink to="/" activeClassName="active" className="nav-link">Home</IndexLink>
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
      viewPersonId: state.auth.viewPersonId,
      viewPerson: state.auth.viewPerson ,
      isSuperAdmin: state.auth.isSuperAdmin
    })


)(Nav)
