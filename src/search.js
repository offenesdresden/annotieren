import React from 'react'
import Route from 'react-route'

import TextField from 'react-md/lib/TextFields'
import { RaisedButton } from 'react-md/lib/Buttons'
import FontIcon from 'react-md/lib/FontIcons'


export default class Search extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      query: this.props.query || ""
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.query !== this.props.query) {
      this.setState({
        query: nextProps.query
      })
    }
  }

  render() {
    return (
      <form className="search" onSubmit={ev => this.handleSubmit(ev)}>
        <TextField placeholder="Dokumente suchen"
            value={this.state.query}
            onChange={value => this.handleChange(value)}
            type="search"
            onKeyDown={ev => this.handleKey(ev)}
            style={{ marginRight: "2em", width: "30em" }}
            />
        <RaisedButton label="Suchen" primary={true} onClick={ev => this.handleSubmit(ev)}>
          <FontIcon>search</FontIcon>
        </RaisedButton>
      </form>
    )
  }

  handleChange(value) {
    this.setState({
      query: value
    })
  }

  handleKey(ev) {
    if (ev.keyCode == 13) {
      ev.preventDefault()
    
      Route.go(`/s/${encodeURI(this.state.query)}`)
    }
  }
}
