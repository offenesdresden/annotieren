import React from 'react'
import Route from 'react-route'

import { RaisedButton, FlatButton, IconButton } from 'react-md/lib/Buttons'


/// Applies props.href but prevents loading of another document,
/// instead uses Route.go()
export class RaisedLinkButton extends React.Component {
  render() {
    return (
      <RaisedButton {...this.props}
          onClick={ev => this.handleClick(ev)}
          />
    )
  }

  handleClick(ev) {
    // Don't let the browser navigate away itself
    ev.preventDefault()

    if (this.props.onBeforeRoute) {
      try {
        this.props.onBeforeRoute()
      } catch (e) {
        console.error(e.stack)
      }
    }

    Route.go(this.props.href)
  }
}
