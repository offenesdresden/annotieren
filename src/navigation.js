import React from 'react'
import Reflux from 'reflux'
import Route from 'react-route'

import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'

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
      tab: null
    }
  },

  componentDidMount() {
    this.setState({
      username: accountStore.username
    })

    let tab = null
    switch(this.props.for) {
    case "/":
      tab = 'search'
      break
    }

    if (tab) {
      this.setState({
        tab: tab
      })
    }
  },

  onRefreshLoginCompleted(username) {
    this.setState({ username })
  },

  onRefreshLoginFailed(e) {
    this.setState({ username: null })
  },

  render() {
    let tabStyle = {
      backgroundColor: '#222'
    }

    return (
      <div style={{ marginBottom: "48px" }}>
        <Tabs key="t"
            value={this.state.tab}
            onChange={value => this.handleTabChange(value)}
            style={{
              position: 'fixed',
              zIndex: 10000,
              top: "0",
              left: "0",
              right: "0",
              margin: "0"
            }}>

          <Tab label="Suchen" value="search" style={tabStyle}/>

          {!this.state.username ?
           <Tab id='login' label="Login" value="login" style={tabStyle}/> :
           <Tab label={<span>Logout <b>{this.state.username}</b></span>} value="logout" style={tabStyle}/>
          }
        </Tabs>

        <Login open={!this.state.username && this.state.tab === 'login'}
            anchorEl={document.getElementById('login')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
            style={{ padding: "0.5em 1em" }}
            onRequestClose={() => this.handleCloseLogin()}
            />
      </div>
    )
  },

  handleTabChange(value) {
    this.setState({
      prevTab: this.state.tab,
      tab: value
    })

    switch(value) {
    case 'search':
      Route.go("/")
      break
    case 'logout':
      this.handleLogout()
      break
    }
  },

  handleCloseLogin() {
    this.setState({
      prevTab: null,
      tab: this.state.prevTab
    })
  },
  
  handleLogout() {
    accountActions.logout()
  },

  onLogoutCompleted() {
    this.setState({
      username: null,

      prevTab: null,
      tab: this.state.prevTab
    })
  },

  onLogoutFailed(e) {
    console.error(e.stack || e)

    this.setState({
      prevTab: null,
      tab: this.state.prevTab
    })
  },
})
