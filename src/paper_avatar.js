import React from 'react'

import Avatar from 'material-ui/lib/avatar'
import colors from 'material-ui/lib/styles/colors'


export default class PaperView extends React.Component {
  render() {
    let paper = this.props.paper
    let shortName = paper.shortName || ""

    return (
      <Avatar title={shortName} size={this.props.size || 32}
          backgroundColor={paperShortNameToColor(shortName)}
          >
        {shortName[0]}
      </Avatar>
    )
  }
}
  
function paperShortNameToColor(id) {
  if (/^V/.test(id)) {
    return colors.deepPurple500
  } else if (/^A/.test(id)) {
    return colors.lightBlue500
  } else if (id) {
    return colors.lightGreen500
  } else {
    return colors.lightGreen200
  }
}
