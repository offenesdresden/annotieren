import React from 'react'
import Reflux from 'reflux'
import Route from 'react-route'

import { Card, CardTitle, CardActions, CardText } from 'react-md/lib/Cards'
import { RaisedButton } from 'react-md/lib/Buttons'
import { List, ListItem } from 'react-md/lib/Lists'
import Subheader from 'react-md/lib/Subheaders'
import Avatar from 'react-md/lib/Avatars'
import FontIcon from 'react-md/lib/FontIcons'
import { CircularProgress } from 'react-md/lib/Progress'


import { actions as searchActions } from './search_store'
import PaperAvatar from './paper_avatar'


const TYPE_MEETING = "https://oparl.org/schema/1.0/Meeting"
const TYPE_PAPER = "https://oparl.org/schema/1.0/Paper"
const TYPE_FILE = "https://oparl.org/schema/1.0/File"


export default React.createClass({
  mixins: [
    Reflux.listenTo(searchActions.search, 'onSearch'),
    Reflux.listenTo(searchActions.search.completed, 'onSearchCompleted'),
    Reflux.listenTo(searchActions.search.failed, 'onSearchFailed')
  ],

  getInitialState() {
    return {
      results: []
    }
  },

  componentDidMount() {
    // Start an empty search on startup
    searchActions.search("")
  },

  onSearch() {
    this.setState({
      loading: true
    })
  },

  onSearchFailed() {
    this.setState({
      loading: false
    })
  },

  onSearchCompleted(results) {
    this.setState({
      loading: false,
      results: results
    })
  },

  render() {
    if (this.state.loading) {
      return (
        <div style={{ maxWidth: "60em", margin: "0 auto" }}>
          <CircularProgress scale={2}/>
        </div>
      )
    } else if (this.state.results.length > 0) {
      return (
        <div style={{ maxWidth: "60em", margin: "0 auto" }}>
          {this.state.results.map((result, i) =>
            <SearchResult key={i} {...result}/>
          )}
        </div>
      )
    } else {
      return (
        <div style={{ maxWidth: "60em", margin: "0 auto" }}>
          <h4 style={{ color: '#888', textAlign: 'center' }}>
            Nichts gefunden
          </h4>
        </div>
      )
    }
  },
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
    let mainFiles = findFilesInObject(this.props)

    return (
      <Card style={{ marginBottom: "1em" }}>
        <CardTitle
            avatar={<FontIcon>event</FontIcon>}
            title={this.props.name}
            subtitle={`${this.props.shortName} ${this.props.start}`}
            />
        <CardText>
          <List>
            {mainFiles.length > 1 &&
             [<Subheader primary={true} primaryText="Dateien"/>]
               .concat(mainFiles.map(id =>
                 <FileItem key={id} id={id}/>
               ))
            }
            {this.props.agendaItem &&
             [<Subheader primary={true} primaryText="Tagesordnung"/>]
             .concat(this.props.agendaItem.map((item, i) =>
                <ListItem
                    key={i}
                    disabled={!(item.consultation && item.consultation.parentID)}
                    onClick={() => Route.go(`/paper/${item.consultation.parentID}`)}
                    leftAvatar={(item.number && item.number.length <= 2) ?
                      <Avatar>{item.number}</Avatar> :
                      <span>{item.number}</span>
                    }
                    primaryText={item.name}
                    nestedItems={findFilesInObject(item).map(id =>
                      <FileItem key={id} id={id}/>
                    )}
                    />
             ))}
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
    let mainFiles = findFilesInObject(paper)

    return (
      <Card style={{ marginBottom: "1em" }}>
        <CardTitle
            avatar={<PaperAvatar paper={paper}/>}
            title={paper.name}
            subtitle={`${paper.shortName} ${iso8601ToDate(paper.publishedDate)}`}
            />
        <CardText>
          <List>
            {mainFiles.map(id =>
              <FileItem key={id} id={id}/>
            )}
            {(paper.consultation || [])
              .filter(consultation => !!consultation.meeting)
              .map((consultation, i) =>
                <PaperMeetingItem key={i} id={consultation.meeting} filesOf={paper.id}/>
            )}
          </List>
        </CardText>
        <CardActions>
          <RaisedButton label="Vorlage lesen" primary={true}
              onClick={() => Route.go(`/paper/${encodeURIComponent(paper.id)}`)}
              />
        </CardActions>
      </Card>
    )
  }
}

class File extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      meetings: [],
      papers: []
    }
  }

  componentDidMount() {
    fetch(`/api/oparl/file/${encodeURIComponent(this.props.id)}/context`)
      .then(res => res.json())
      .then(results => {
        let meetings = []
        let papers = []
        for(let result of results) {
          if (result.type == TYPE_MEETING) {
            meetings.push(result)
          } else if (result.type == TYPE_PAPER) {
            papers.push(result)
          }
        }
        this.setState({
          meetings: meetings,
          papers: papers
        })
      })
  }

  render() {
    return (
      <Card style={{ marginBottom: "1em" }}>
        <CardTitle
            avatar={<FontIcon>description</FontIcon>}
            title={this.props.name}
            />
        <CardText>
          <List>
            {this.state.meetings.map(meeting =>
              <MeetingItem key={meeting.id} {...meeting}/>
            )}
            {this.state.papers.map(paper =>
              <PaperItem key={paper.id} {...paper}/>
            )}
          </List>
        </CardText>
        <CardActions style={{ textAlign: 'right' }}>
          <RaisedButton label="Text Annotieren" primary={true}
              onClick={ev => Route.go(`/file/${encodeURIComponent(this.props.id)}`)}
              />
          <RaisedButton label="Original-PDF" secondary={true}
              href={this.props.downloadUrl}
              />
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

    return (
      <ListItem disabled={true}
          leftIcon={<FontIcon>event</FontIcon>}
          primaryText={meeting.name}
          secondaryText={iso8601ToDate(meeting.start)}
          />
    )
  }
}

class PaperMeetingItem extends MeetingItem {
  render() {
    let meeting = this.state || this.props
    let items = []
    for(let id of findFilesInObject(meeting)) {
      items.push(
        <FileItem key={id} id={id}/>
      )
    }

    return (
      <ListItem disabled={true}
          primaryText={meeting.name}
          nestedItems={items} initiallyOpen={true}
          />
    )
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
      <ListItem
          leftIcon={<PaperAvatar paper={paper} style={{ color: 'white' }}/>}
          primaryText={paper.name}
          secondaryText={iso8601ToDate(paper.publishedDate)}
          onClick={() => Route.go(`/paper/${encodeURIComponent(paper.id)}`)}
          />
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
      <ListItem
          primaryText={file.name}
          leftIcon={<FontIcon>description</FontIcon>}
          onClick={ev => Route.go(`/file/${encodeURIComponent(this.props.id)}`)}
          />
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
