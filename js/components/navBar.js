import React from 'react';



export default (props) => <nav className="navbar navbar-default navbar-fixed-top">
  <div className="container">
    <div className="navbar-header">
      <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
        <span className="sr-only">Toggle navigation</span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
      </button>
      <a className="navbar-brand" href="#">fragile not broken</a>
    </div>
    <div id="navbar" className="navbar-collapse collapse">
      <ul className="nav navbar-nav">
        <li className="active"><a href="#">Home</a></li>
        <li><a href="#">Dashboard</a></li>
        <li><a href="#">Videos</a></li>
        <li className="dropdown">
          <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Student <span className="caret"></span></a>
          <ul className="dropdown-menu">
            <li><a href="#">Test Student</a></li>
            <li><a href="#">Bassel</a></li>
            <li role="separator" className="divider"></li>
            <li className="dropdown-header">Nav header</li>
            <li><a href="#">Separated link</a></li>
          </ul>
        </li>
      </ul>
      <ul className="nav navbar-nav navbar-right">
        <li>
          <a href="javascript:void(0);">
            <i className="fa fa-settings" />
          </a>
        </li>
        <li className="bg-danger">
            <a href='javascript:void(0);' onClick={props.logout} > logout {props.email}</a>
        </li>


      </ul>
    </div>
  </div>
</nav>
