import React from 'react'
import Route from 'react-route'

import Tabs from 'material-ui/lib/tabs/tabs'
import Tab from 'material-ui/lib/tabs/tab'
import Popover from 'material-ui/lib/popover/popover'
import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'
import CircularProgress from 'material-ui/lib/circular-progress'


export default class Navigation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tab: null
    }
  }

  componentDidMount() {
    this._checkLoggedIn()
  }

  _checkLoggedIn() {
    if (!this.state.hasOwnProperty('username')) {
      fetch("/api/login", {
        credentials: 'same-origin'
      })
        .then(res => res.json())
        .then(json => {
          this.setState({
            username: json.username
          })
        })
        .catch(e => {
          console.error(e.stack || e)
          this.setState({
            username: null
          })
        })
    }
  }

  render() {
    let tabStyle = {
      backgroundColor: 'black'
    }

    return (
      <div
          style={{
            position: 'fixed',
            zIndex: 100,
            top: "0",
            left: "0",
            right: "0",
            margin: "0"
          }}>
        <Tabs key="t"
            value={this.state.tab}
            onChange={value => this.handleTabChange(value)}
            style={{
              backgroundColor: 'black'
            }}>

          <Tab label="Suchen" value="search" style={tabStyle}/>

          {!this.state.username ?
           <Tab id='login' label="Login" value="login" style={tabStyle}/> :
           <Tab label={`Logout ${this.state.username}`} value="logout" style={tabStyle}/>
          }
        </Tabs>

        <Popover open={!this.state.username && this.state.tab === 'login'}
            anchorEl={document.getElementById('login')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
            style={{ padding: "0.5em 1em" }}
            onRequestClose={() => this.handleCloseLogin()}
            >
          <div>
            <TextField
                floatingLabelText="Benutzername"
                onChange={ev => this.handleLoginFieldChange('loginUsername', ev.target.value)}
                />
          </div>
          <div>
            <TextField type="password"
                floatingLabelText="Passwort"
                onChange={ev => this.handleLoginFieldChange('loginPassword', ev.target.value)}
                errorText={this.state.loginError}
                />
          </div>
          <div style={{ textAlign: 'right' }}>
            {!this.state.loginLoading ?
             <RaisedButton label="Login" primary={true} onClick={() => this.handleLogin()}/> :
             <CircularProgress/>
            }
          </div>
          <div style={{ textAlign: 'right', marginTop: "3em" }}>
            <p style={{ fontSize: "90%", color: '#888', margin: "0" }}>
              Noch keinen Account?
            </p>
            <RaisedButton label="Registrieren…" secondary={true} onClick={() => Route.go("/register")}/>
          </div>
        </Popover>
      </div>
    )
  }

  handleTabChange(value) {
    this.setState({
      prevTab: this.state.tab,
      tab: value
    })

    if (value === 'logout') {
      this.handleLogout()
    }
  }

  handleCloseLogin() {
    this.setState({
      prevTab: null,
      tab: this.state.prevTab
    })
  }
  
  handleLoginFieldChange(field, value) {
    this.setState({
      [field]: value
    })
  }

  handleLogin() {
    this.setState({
      loginLoading: true
    })

    fetch("/api/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.state.loginUsername,
        password: this.state.loginPassword
      }),
      credentials: 'same-origin'
    })
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          this.setState({ loginError: json.error, loginLoading: false })
        } else {
          this.setState({ username: json.username, loginLoading: false })
          this.handleCloseLogin()
        }
      })
      .catch(e => {
        this.setState({ loginError: e.message, loginLoading: false })
      })
  }

  handleLogout() {
    fetch("/api/logout", {
      method: 'POST',
      credentials: 'same-origin'
    })
      .then(res => {
        this.setState({
          username: null,

          prevTab: null,
          tab: this.state.prevTab
        })
      })
      .catch(e => {
        console.error(e.stack || e)

        this.setState({
          prevTab: null,
          tab: this.state.prevTab
        })
      })
  }
}
