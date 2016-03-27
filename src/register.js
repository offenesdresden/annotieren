import React from 'react'
import Route from 'react-route'

import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button'


export default class Register extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

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
          <RaisedButton label="Account erstellen" primary={true} onClick={() => this.handleSubmit()}/>
        </div>
      </div>
    )
  }

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
  }

  handleSubmit() {
    this.setState({
      loading: true
    })
    
    fetch("/api/register", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password1
      }),
      credentials: 'same-origin'
    })
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          this.setState({ error: json.error, loading: false })
        } else {
          Route.go("/")
        }
      })
      .catch(e => {
        this.setState({ error: e.message, loading: false })
      })
  }
}
