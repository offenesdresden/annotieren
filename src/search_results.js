import React from 'react'
import Reflux from 'reflux'
import Route from 'react-route'

import Card from 'material-ui/lib/card/card'
import CardActions from 'material-ui/lib/card/card-actions'
import CardHeader from 'material-ui/lib/card/card-header'
import CardMedia from 'material-ui/lib/card/card-media'
import CardTitle from 'material-ui/lib/card/card-title'
import CardText from 'material-ui/lib/card/card-text'
import List from 'material-ui/lib/lists/list'
import ListItem from 'material-ui/lib/lists/list-item'
import colors from 'material-ui/lib/styles/colors'
import DescriptionIcon from 'material-ui/lib/svg-icons/action/description'
import RaisedButton from 'material-ui/lib/raised-button'
import Avatar from 'material-ui/lib/avatar'
import ActionSubject from 'material-ui/lib/svg-icons/action/subject'


import { actions as searchActions } from './search_store'


const TYPE_MEETING = "https://oparl.org/schema/1.0/Meeting"
const TYPE_PAPER = "https://oparl.org/schema/1.0/Paper"
const TYPE_FILE = "https://oparl.org/schema/1.0/File"


export default React.createClass({
  mixins: [
    Reflux.listenTo(searchActions.search.completed, "onSearchCompleted")
  ],

  getInitialState: function() {
    return {
      results: []
    }
  },

  onSearchCompleted: function(results) {
    this.setState({
      results: results
    })
  },

  render: function() {
    console.log("SearchResults.render with state:", this.state.results.map(result => result.type))
    return (
      <div style={{ maxWidth: "60em", margin: "0 auto" }}>
        {this.state.results.map((result, i) =>
          <SearchResult key={i} {...result}/>
        )}
      </div>
    )
  },

  handleDocumentClick: function(ev, doc) {
    let docId = doc.file_name.replace(/\..*/, "")
    Route.go(`/doc/${docId}`)
  }
})

class SearchResult extends React.Component {
  render() {
    switch(this.props.type) {
    case TYPE_MEETING:
      return <Meeting {...this.props}/>
      break
    case TYPE_PAPER:
      return <Paper {...this.props}/>
      break
    case TYPE_FILE:
      return <File {...this.props}/>
      break
    default:
      return <p/>
    }
  }
}

class Meeting extends React.Component {
  render() {
    console.log("render meeting", this.props)
    return (
      <Card style={{ marginBottom: "1em" }}>
        <CardHeader
            title={this.props.name}
            subtitle={`${this.props.shortName} ${this.props.start}`}
            style={{ backgroundColor: colors.lime500 }}
            />
        <CardText>
          {findFilesInObject(this.props).map(id =>
            <FileItem key={id} id={id}/>
          )}
          <List>
            {this.props.agendaItem ?
              this.props.agendaItem.map((item, i) =>
                <ListItem key={i} disabled={!item.consultation}>
                  <div>
                  <Avatar size={28}>{item.number}</Avatar>
                    {item.name}
                  </div>
                  {(findFilesInObject(item).length > 0) ? (
                    <List>
                      {findFilesInObject(item).map(id =>
                        <FileItem key={id} id={id}/>
                      )}
                    </List>
                  ) : ""}
                </ListItem>
              ) : ""}
          </List>
        </CardText>
      </Card>
    )
  }
}

class Paper extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      meetings: []
    }
  }

  render() {
    let paper = this.props

    return (
      <Card style={{ marginBottom: "1em" }}>
        <CardHeader
            title={<span>
              <Avatar title={paper.shortName} size={32}
                  backgroundColor={paperShortNameToColor(paper.shortName)}
                  >
                {paper.shortName[0]}
              </Avatar>
              {paper.name}
            </span>}
            subtitle={`${paper.shortName} ${iso8601ToDate(paper.publishedDate)}`}
            style={{ backgroundColor: colors.lime700 }}
            />
        <CardText>
          {findFilesInObject(paper).map(id =>
            <FileItem key={id} id={id}/>
          )}
          <List>
            {(paper.consultation || []).map((consultation, i) =>
              <MeetingItem key={i} id={consultation.meeting} filesOf={paper.id}/>
            )}
          </List>
        </CardText>
      </Card>
    )
  }
}

class File extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount() {
    fetch(`/api/oparl/file/${encodeURIComponent(this.props.id)}/context`)
      .then(res => res.json())
      .then(results => {
        for(let result of results) {
          if (result.type == TYPE_MEETING) {
            this.setState({
              meeting: result
            })
          } else if (result.type == TYPE_PAPER) {
            this.setState({
              paper: result
            })
          }
        }
      })
  }

  render() {
    return (
      <Card style={{ marginBottom: "1em" }}>
        <CardHeader
            title={<span><Avatar backgroundColor="white" size={36}><ActionSubject/></Avatar> {this.props.name}</span>}
            style={{ backgroundColor: colors.lime300 }}
            />
        <CardText>
          <List>
            {this.state.meeting ? <MeetingItem {...this.state.meeting}/> : ""}
            {this.state.paper ? <PaperItem {...this.state.paper}/> : ""}
          </List>
        </CardText>
        <CardActions style={{ textAlign: 'right' }}>
          <RaisedButton label="Text Annotieren" primary={true}/>
          <RaisedButton label="Original-PDF" secondary={true}/>
        </CardActions>
      </Card>
    )
  }
}

class MeetingItem extends React.Component {
  componentDidMount() {
    if (!this.props.name) {
      fetch(`/api/oparl/meeting/${encodeURIComponent(this.props.id)}`)
        .then(res => res.json())
        .then(result => {
          this.setState(result)
        })
    }
  }

  render() {
    let meeting = this.state || this.props

    return !this.props.filesOf ?
      <ListItem disabled={true}
          primaryText={meeting.name}
          secondaryText={iso8601ToDate(meeting.start)}
          >
      </ListItem> :
      <ListItem disabled={true}>
        <List subheader={meeting.name}>
          {meeting.agendaItem ?
            meeting.agendaItem
            .filter(item =>
              item.consultation &&
              item.consultation.parentID === this.props.filesOf
            )
            .map(item =>
              findFilesInObject(item).map(id =>
                <FileItem key={id} id={id}/>
              )
            )
            : ""
          }
        </List>
      </ListItem>
  }
}

class PaperItem extends React.Component {
  componentDidMount() {
    if (!this.props.name) {
      fetch(`/api/oparl/paper/${encodeURIComponent(this.props.id)}`)
        .then(res => res.json())
        .then(result => {
          this.setState(result)
        })
    }
  }

  render() {
    let paper = this.state || this.props

    return (
      <ListItem>
        <Avatar title={paper.shortName} size={32}
            backgroundColor={paperShortNameToColor(paper.shortName)}
            >
          {paper.shortName[0]}
        </Avatar>
        <span style={{ paddingLeft: "0.5em" }}>
          {paper.name}
        </span>
      </ListItem>
    )
  }
}

class FileItem extends React.Component {
  componentDidMount() {
    if (!this.props.name) {
      fetch(`/api/oparl/file/${encodeURIComponent(this.props.id)}`)
        .then(res => res.json())
        .then(result => {
          this.setState(result)
        })
    }
  }

  render() {
    let file = this.state || this.props

    return (
      <ListItem primaryText={file.name} leftIcon={<ActionSubject/>} />
    )
  }
}

const FILES_KEYS = [
  'invitation',
  'masterFile',
  'mainFile',
  'derivativeFile',
  'verbatimProtocol',
  'resultsProtocol',
  'resolutionFile',
  'auxiliaryFile'
]

function findFilesInObject(obj) {
  let results = []
  for(let k of FILES_KEYS) {
    let v = obj[k]
    if (typeof v == 'string') {
      results.push(v)
    } else if (v) {
      results.push(...v)
    }
  }
  return results
}

function iso8601ToDate(iso8601) {
  let m
  if (iso8601 && (m = iso8601.match(/(\d{4})-(\d\d)-(\d\d)/))) {
    return `${m[3]}.${m[2]}.${m[1]}`
  } else {
    return "?"
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
