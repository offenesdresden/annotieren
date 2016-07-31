import React from 'react'

import Avatar from 'react-md/lib/Avatars'


export default class PaperAvatar extends React.Component {
  render() {
    let paper = this.props.paper
    let shortName = paper.shortName || ""

    let suffix = shortName ? `paper-${shortName[0]}` : null
    return (
      <Avatar title={shortName} suffix={suffix} style={this.props.style || {}}>
        {shortName[0]}
      </Avatar>
    )
  }
}
