import React from 'react'
import Reflux from 'reflux'
import Route from 'react-route'

import TextField from 'react-md/lib/TextFields'
import { RaisedButton } from 'react-md/lib/Buttons'
import { CircularProgress } from 'react-md/lib/Progress'

import { actions as accountActions } from './account_store'


export default React.createClass({
  mixins: [
    Reflux.listenTo(accountActions.register.completed, 'onRegisterCompleted'),
    Reflux.listenTo(accountActions.register.failed, 'onRegisterFailed'),
  ],

  getInitialState() {
    return {
    }
  },

  render() {
    return (
        <div style={{ margin: "2em auto", maxWidth: "20em" }}>
        <div>
          <TextField
              label="Benutzername"
              onChange={value => this.handleFieldChange('username', value)}
              />
        </div>
        <div>
          <TextField type="password"
              label="Passwort"
              onChange={value => this.handleFieldChange('password1', value)}
              />
        </div>
        <div>
          <TextField type="password"
              label="Passwort wiederholen"
              onChange={value => this.handleFieldChange('password2', value)}
              errorText={this.state.error}
              />
        </div>
        <div style={{ marginTop: "2em" }}>
          {this.state.loading ?
           <CircularProgress/> :
           <RaisedButton label="Account erstellen" primary={true} onClick={() => this.handleSubmit()}/>}
        </div>
      </div>
    )
  },

  handleFieldChange(field, value) {
    this.setState({
      [field]: value,
      error: null
    }, () => {
      if (this.state.password1 !== this.state.password2) {
        this.setState({
          error: "Passwörter müssen übereinstimmen"
        })
      }
    })
  },

  handleSubmit() {
    this.setState({
      error: null,
      loading: true
    })

    accountActions.register(this.state.username, this.state.password1)
  },

  onRegisterCompleted() {
    this.setState({
      error: null,
      loading: false
    })
    Route.go("/")
  },

  onRegisterFailed(e) {
    this.setState({
      error: e.message,
      loading: false
    })
  }
})
