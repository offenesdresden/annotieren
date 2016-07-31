import React from 'react'
import Reflux from 'reflux'
import Route from 'react-route'

import Toolbar from 'react-md/lib/Toolbars'
import { FlatButton, IconButton } from 'react-md/lib/Buttons'

import { actions as accountActions, default as accountStore } from './account_store'
import Login from './login'


export default React.createClass({
  mixins: [
    Reflux.listenTo(accountActions.refreshLogin.completed, 'onRefreshLoginCompleted'),
    Reflux.listenTo(accountActions.refreshLogin.failed, 'onRefreshLoginFailed'),
    Reflux.listenTo(accountActions.logout.completed, 'onLogoutCompleted'),
    Reflux.listenTo(accountActions.logout.failed, 'onLogoutFailed'),
  ],

  getInitialState() {
    return {
      loginOpen: false
    }
  },

  componentDidMount() {
    this.setState({
      username: accountStore.username
    })
  },

  onRefreshLoginCompleted(username) {
    this.setState({ username })
  },

  onRefreshLoginFailed(e) {
    this.setState({ username: null })
  },

  render() {
    let left = this.renderHomeButton()
    if (this.props.left) {
      left = (
        <div style={{
              display: 'flex',
              flexDirection: 'row'
            }}>
          {left}
          {this.props.left}
        </div>
      )
    }
    let right = this.renderLoginButton()
    if (this.props.right) {
      right = (
        <div style={{
              display: 'flex',
              flexDirection: 'row-reverse'
            }}>
          {right}
          {this.props.right}
        </div>
      )
    }

    return (
        <Toolbar primary={true}
            title={this.props.title}
            className="navigation"
            actionLeft={left}
            actionsRight={right}
            />
    )
  },

  renderHomeButton() {
    return (
      <IconButton href="/"
          onClick={ev => this.handleClickHome(ev)}>
        home
      </IconButton>
    )
  },

  handleClickHome() {
    // Don't let the browser navigate away itself
    ev.preventDefault()

    Route.go("/")
  },

  renderLoginButton() {
    if (!this.state.username) {
      return (
        <div>
          <FlatButton label="Hilfe"
              onClick={() => Route.go('/help')}
              style={{ color: 'white' }}
              />

          <FlatButton id='login' label="Login"
              onClick={() => this.handleLogin()}
              style={{ color: 'white' }}/>

          <Login isOpen={this.state.loginOpen}
              anchorEl={document.getElementById('login')}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              targetOrigin={{ vertical: 'top', horizontal: 'right' }}
              style={{ padding: "0.5em 1em" }}
              onClose={() => this.handleCloseLogin()}
              />
        </div>
      )
    } else {
      return (
        <div>
          <FlatButton label="Hilfe"
              onClick={() => Route.go('/help')}
              style={{ color: 'white' }}
              />

          <FlatButton label="Logout"
              onClick={() => this.handleLogout()}
              style={{ color: 'white' }}
              />
        </div>
      )
    }
  },

  handleLogin() {
    this.setState({ loginOpen: !this.state.loginOpen })
  },

  handleLogout() {
    accountActions.logout()
  },

  onLogoutCompleted() {
    this.setState({
      username: null,
    })
  },

  onLogoutFailed(e) {
    console.error(e.stack || e)
  },

  handleCloseLogin() {
    this.setState({
      loginOpen: false
    })
  }
})
