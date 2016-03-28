import React from 'react'
import Reflux from 'reflux'
import Route from 'react-route'

import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'
import CircularProgress from 'material-ui/lib/circular-progress'

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
              floatingLabelText="Benutzername"
              onChange={ev => this.handleFieldChange('username', ev.target.value)}
              />
        </div>
        <div>
          <TextField type="password"
              floatingLabelText="Passwort"
              onChange={ev => this.handleFieldChange('password1', ev.target.value)}
              />
        </div>
        <div>
          <TextField type="password"
              floatingLabelText="Passwort wiederholen"
              onChange={ev => this.handleFieldChange('password2', ev.target.value)}
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
