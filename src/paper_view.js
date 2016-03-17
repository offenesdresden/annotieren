import React from 'react'
import Route from 'react-route'

import AppBar from 'material-ui/lib/app-bar'
import IconButton from 'material-ui/lib/icon-button'
import ActionHome from 'material-ui/lib/svg-icons/action/home'
import Avatar from 'material-ui/lib/avatar'
import Card from 'material-ui/lib/card/card'
import CardHeader from 'material-ui/lib/card/card-header'
import CardText from 'material-ui/lib/card/card-text'

import PaperAvatar from './paper_avatar'

export default class PaperView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      paper: {
        id: this.props.params.id
      }
    }
  }

  componentDidMount() {
    fetch(`/api/oparl/paper/${encodeURIComponent(this.state.paper.id)}`)
      .then(res => res.json())
      .then(paper => {
        this.setState({ paper: paper })
      })
  }

  render() {
    let paper = this.state.paper
    let fileCards = []
    function pushFileCards(file, role) {
      if (Array.isArray(file)) {
        file.forEach(f => pushFileCards(f, role))
      } else if (typeof file == 'string') {
        fileCards.push(<FileCard key={file} file={{ id: file }} role={role}/>)
      }
    }
    pushFileCards(paper.mainFile, "Hauptdatei")
    pushFileCards(paper.auxiliaryFile)

    return (
      <div>
        <AppBar
            title={
              <div>
                <PaperAvatar paper={paper} size={32}/>

                {paper.name}
              </div>
            }
            iconElementLeft={
              <IconButton title="Zurück zur Suche"
                  onClick={ev => Route.go("/")}>
                <ActionHome/>
              </IconButton>
            }
            iconElementRight={
              <p style={{ margin: "16px 0 0", fontSize: "80%", color: 'white' }}>
                {iso8601ToDate(paper.publishedDate)}
              </p>
            }
            />

        {fileCards}
      </div>
    )
  }
}

class FileCard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount() {
    if (!this.props.file || !this.props.file.name) {
      fetch(`/api/oparl/file/${encodeURIComponent(this.props.file.id)}`)
        .then(res => res.json())
        .then(result => {
          this.setState({ file: result })
        })
    }
  }

  render() {
    let file = this.state.file || this.props.file

    return (
      <Card style={{ marginTop: "1em" }}
          >
        <CardHeader
          title={file.name}
          subtitle={this.props.role}
          actAsExpander={true}
          showExpandableButton={true}
          />
        <CardText expandable={true}>
          <p>TODO: annotations</p>
        </CardText>
      </Card>
    )
  }
}

function iso8601ToDate(iso8601) {
  let m
  if (iso8601 && (m = iso8601.match(/(\d{4})-(\d\d)-(\d\d)/))) {
    return `${m[3]}.${m[2]}.${m[1]}`
  } else {
    return "?"
  }
}
