import React from 'react'

import Avatar from 'react-md/lib/Avatars'


export default class PaperAvatar extends React.Component {
  render() {
    let paper = this.props.paper
    let shortName = paper.shortName || ""

    return (
      <Avatar title={shortName}
          style={{ backgroundColor: paperShortNameToColor(shortName) }}
          {...this.props}
          >
        {shortName[0]}
      </Avatar>
    )
  }
}
  
function paperShortNameToColor(id) {
  if (/^V/.test(id)) {
    return '#707'
  } else if (/^A/.test(id)) {
    return '#77f'
  } else if (id) {
    return '#7f7'
  } else {
    return '#666'
  }
}
