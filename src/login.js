import React from 'react'
import Reflux from 'reflux'
import Route from 'react-route'

import Popover from 'material-ui/lib/popover/popover'
import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'
import CircularProgress from 'material-ui/lib/circular-progress'

import { actions as accountActions } from './account_store'


export default React.createClass({
  mixins: [
    Reflux.listenTo(accountActions.login.completed, 'onLoginCompleted'),
    Reflux.listenTo(accountActions.login.failed, 'onLoginFailed'),
  ],

  getInitialState() {
    return {
    }
  },

  render() {
    return (
      <Popover {...this.props}>
        <div>
          <TextField
              floatingLabelText="Benutzername"
              onChange={ev => this.handleFieldChange('username', ev.target.value)}
              />
        </div>
        <div>
          <TextField type="password"
              floatingLabelText="Passwort"
              onChange={ev => this.handleFieldChange('password', ev.target.value)}
              errorText={this.state.error}
              />
        </div>
        <div style={{ textAlign: 'right' }}>
          {!this.state.loading ?
           <RaisedButton label="Login" primary={true} onClick={this.handleSubmit}/> :
           <CircularProgress/>
          }
        </div>
        <div style={{ textAlign: 'right', marginTop: "3em" }}>
          <p style={{ fontSize: "90%", color: '#888', margin: "0" }}>
            Noch keinen Account?
          </p>
          <RaisedButton label="Registrieren…" secondary={true} onClick={this.handleRegister}/>
        </div>
      </Popover>
    )
  },

  handleFieldChange(field, value) {
    this.setState({
      [field]: value,
      error: null
    })
  },

  handleSubmit() {
    this.setState({
      error: null,
      loading: true
    })

    accountActions.login(this.state.username, this.state.password)
  },

  onLoginCompleted(username) {
    this.setState({
      username,
      error: null,
      loading: false
    })

    this.props.onRequestClose()
  },

  onLoginFailed(e) {
    this.setState({
      error: e.message,
      loading: false
    })
  },

  handleRegister() {
    this.props.onRequestClose()

    Route.go("/register")
  }
})
