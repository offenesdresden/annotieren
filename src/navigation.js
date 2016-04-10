import React from 'react'
import Reflux from 'reflux'
import Route from 'react-route'

import { Tabs, Tab } from 'react-md/lib/Tabs'

import { actions as accountActions, default as accountStore } from './account_store'
import Login from './login'


const TAB_SEARCH = 0
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
      tab = TAB_SEARCH
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
    return (
      <div style={{ marginBottom: "48px" }}>
        <Tabs key="t" scrollable={true} primary={true}
            className="navigation"
            style={{ flexGrow: 1, justifyContent: 'space-around' }}
            activeTabIndex={this.state.tab || 0}
            onChange={value => {
              if (typeof value === 'number') this.handleTabChange(value)
            }}
            >

          <Tab label="Suchen" children={[]}/>

          {!this.state.username ?
           <Tab id='login' label="Login" children={[]}/> :
           <Tab label={`Logout ${this.state.username}`} children={[]}/>
          }
        </Tabs>

        <Login isOpen={!this.state.username && this.state.tab === TAB_LOGIN}
            anchorEl={document.getElementById('login')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
            style={{ padding: "0.5em 1em" }}
            onClose={() => this.handleCloseLogin()}
            />
      </div>
    )
  },

  handleTabChange(value) {
    console.log("handleTabChange from", this.state.tab, "to", value)
    this.setState({
      prevTab: this.state.tab,
      tab: value
    })

    switch(value) {
    case TAB_SEARCH:
      Route.go("/")
      break
    case TAB_LOGOUT:
      if (this.state.username) {
        this.handleLogout()
      } else {
        /* TAB_LOGIN */
      }
      break
    }
  },

  handleCloseLogin() {
    console.log("close login")
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
