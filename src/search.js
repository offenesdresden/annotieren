import React from 'react'

import TextField from 'react-md/lib/TextFields'
import { RaisedButton } from 'react-md/lib/Buttons'
import FontIcon from 'react-md/lib/FontIcons'

import { actions as searchActions } from './search_store'


export default class Search extends React.Component {
  constructor(props) {
    super(props)
    this.state = {query: ""}
  }
  
  render() {
    return (
      <form style={{textAlign: "center", padding: "32px 4px"}} onSubmit={ev => this.handleSubmit(ev)}>
        <TextField placeholder="Dokumente suchen"
            onChange={value => this.handleChange(value)}
            type="search"
            onEnterKeyDown={ev => this.handleSubmit(ev)}
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

  handleSubmit(ev) {
    ev.preventDefault()
    
    searchActions.search(this.state.query)
  }
}
