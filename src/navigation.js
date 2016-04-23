import React from 'react'
import Reflux from 'reflux'
import Route from 'react-route'

import Toolbar from 'react-md/lib/Toolbars'
import { FlatButton, IconButton } from 'react-md/lib/Buttons'

import { actions as accountActions, default as accountStore } from './account_store'
import Login from './login'


const TAB_FRONT = 0
const TAB_LOGIN = 1
const TAB_LOGOUT = 1

export default React.createClass({
  mixins: [
    Reflux.listenTo(accountActions.refreshLogin.completed, 'onRefreshLoginCompleted'),
    Reflux.listenTo(accountActions.refreshLogin.failed, 'onRefreshLoginFailed'),
    Reflux.listenTo(accountActions.logout.completed, 'onLogoutCompleted'),
    Reflux.listenTo(accountActions.logout.failed, 'onLogoutFailed'),
  ],

  getInitialState() {
    return {
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
    return (
        <Toolbar primary={true}
            title={this.props.title}
            className="navigation"
            actionLeft={this.props.left || this.renderHomeButton()}
            actionsRight={this.props.right || this.renderLoginButton()}
            />
    )
  },

  renderHomeButton() {
    return (
      <IconButton href="/"
          onClick={() => this.handleClickHome()}>
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
          <FlatButton id='login' label="Login"
              style={{ color: 'white' }}/>

          <Login isOpen={!this.state.loginOpen}
              anchorEl={document.getElementById('login')}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              targetOrigin={{ vertical: 'top', horizontal: 'right' }}
              style={{ padding: "0.5em 1em" }}
              onClose={() => this.handleCloseLogin()}
              />
          </div>
      )
    } else {
      return <FlatButton label="Logout"
          onClick={() => this.handleLogout}
          style={{ color: 'white' }}
          />
    }
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
