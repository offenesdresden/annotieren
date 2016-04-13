import React from 'react'
import Reflux from 'reflux'
import Route from 'react-route'

import Dialog from 'react-md/lib/Dialogs'
import TextField from 'react-md/lib/TextFields'
import { RaisedButton } from 'react-md/lib/Buttons'
import { CircularProgress } from 'react-md/lib/Progress'

import { RaisedLinkButton } from './link_button'
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
      <Dialog {...this.props} title="Login" close={this.props.onClose}>
        <div>
          <TextField
              label="Benutzername"
              onChange={value => this.handleFieldChange('username', value)}
              />
        </div>
        <div>
          <TextField type="password"
              label="Passwort"
              onChange={value => this.handleFieldChange('password', value)}
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
          <RaisedLinkButton label="Registrieren…" secondary={true}
              href="/register" onBeforeRoute={() => this.props.onClose()}/>
        </div>
      </Dialog>
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

    this.props.onClose()
  },

  onLoginFailed(e) {
    this.setState({
      error: e.message,
      loading: false
    })
  }
})
