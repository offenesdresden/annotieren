import React from 'react'
import Route from 'react-route'

import AppBar from 'material-ui/lib/app-bar'
import IconButton from 'material-ui/lib/icon-button'
import ActionHome from 'material-ui/lib/svg-icons/action/home'
import Card from 'material-ui/lib/card/card'
import CardHeader from 'material-ui/lib/card/card-header'
import CardText from 'material-ui/lib/card/card-text'
import CardActions from 'material-ui/lib/card/card-actions'
import RaisedButton from 'material-ui/lib/raised-button'
import CircularProgress from 'material-ui/lib/circular-progress'

import PaperAvatar from './paper_avatar'
import { getTypeById } from './types'
import { getPersonParty } from './parties'


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
        fileCards.push(<FileCard key={file} file={{ id: file }} role={role} paper={paper}/>)
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

                <span style={{ whiteSpace: 'pre-wrap' }}>
                  {paper.name}
                </span>
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

        {(paper.consultation || [])
         .filter(consultation => !!consultation.meeting)
         .map((consultation, i) =>
           <Meeting key={i} id={consultation.meeting} filesOf={paper.id} paper={paper}/>
        )}
      </div>
    )
  }
}

class Meeting extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      meeting: {}
    }
  }

  componentDidMount() {
    fetch(`/api/oparl/meeting/${encodeURIComponent(this.props.id)}`)
      .then(res => res.json())
      .then(meeting => {
        this.setState({ meeting: meeting })
      })
  }

  render() {
    let meeting = this.state.meeting
    let paper = this.props.paper
    let fileCards = []
    function pushFileCards(file, role) {
      if (Array.isArray(file)) {
        file.forEach(f => pushFileCards(f, role))
      } else if (typeof file == 'string') {
        fileCards.push(<FileCard key={file} file={{ id: file }} role={role} paper={paper}/>)
      }
    }
    pushFileCards(meeting.invitation, "Einladung")
    pushFileCards(meeting.auxiliaryFile)
    pushFileCards(meeting.verbatimProtocol, "Wortprotokoll")
    pushFileCards(meeting.resultsProtocol, "Ergebnisprotokoll")

    let agendaItems = (meeting.agendaItem || [])
        .filter(item =>
          item.consultation &&
          item.consultation.parentID === this.props.filesOf
        ).map((item, i) =>
          <AgendaItem key={i} item={item} paper={this.props.paper}/>
        )

    return (
      <div>
        <h2 style={{ textAlign: 'center', margin: "3em 0 0", color: "#444" }}>{meeting.name}</h2>
        <p style={{ textAlign: 'center', margin: "0 0 1em", fontSize: "85%", color: "#888" }}>{iso8601ToDate(meeting.start)}</p>

        {fileCards}
        {agendaItems}
      </div>
    )
  }
}

class AgendaItem extends React.Component {
  render() {
    let item = this.props.item
    let paper = this.props.paper
    let fileCards = []
    function pushFileCards(file, role) {
      if (Array.isArray(file)) {
        file.forEach(f => pushFileCards(f, role))
      } else if (typeof file == 'string') {
        fileCards.push(<FileCard key={file} file={{ id: file }} role={role} paper={paper}/>)
      }
    }
    pushFileCards(item.resolutionFile, "Beschlussfassung")
    pushFileCards(item.auxiliaryFile)

    return (
      <div>
        <h3 style={{ textAlign: 'center', color: "#666" }}>{item.name}</h3>

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
      <Card style={{ margin: "1em auto", maxWidth: "60em" }}
          >
        <CardHeader
          title={file.name}
          titleStyle={{ textAlign: 'center', fontWeight: 'bold' }}
          subtitle={this.props.role}
          subtitleStyle={{ textAlign: 'center' }}
          actAsExpander={true}
          showExpandableButton={true}
          />
        <CardText expandable={true} style={{ backgroundColor: "#f7f7f7" }}>
          <FileDetails file={file} paper={this.props.paper}/>
        </CardText>
        <CardActions expandable={true} style={{ textAlign: 'right' }}>
          <RaisedButton label="Text Annotieren" primary={true}
              style={{ verticalAlign: 'top' }}
              onClick={ev => Route.go(`/file/${encodeURIComponent(file.id)}`)}
              />
          <RaisedButton label="Original-PDF" secondary={true}
              linkButton={true} href={file.downloadUrl}
              />
        </CardActions>
      </Card>
    )
  }
}

// TODO: no paper filter for files that belong to this paper/agendaItem only
class FileDetails extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      parts: []
    }
  }

  componentDidMount() {
    this.setState({
      loading: true
    })

    return fetch(`/api/file/${this.props.file.id}/annotations`)
      .then(res => res.json())
      .then(annotations =>
        this._processAnnotations(annotations, () =>
          this.setState({
            loading: false
          })
        )
      )
      .catch(e => {
        this.setState({
          error: e.message,
          loading: false
        })
      })
  }

  _processAnnotations(annotations, cb) {
    console.log("_processAnnotations", annotations.sort((a, b) =>
      (a.begin !== b.begin) ?
      (a.begin - b.begin) :
      (a.end - b.end)
    ))
    let inPaperChapter = !this.props.paper
    // First, sort by offset
    annotations = annotations.sort((a, b) =>
      (a.begin !== b.begin) ?
      (a.begin - b.begin) :
      (a.end - b.end)
    ).reduce((results, annotation) => {
      console.log("reduce", annotation.type)
      // Then, restrict to this paper up until next one
      if (this.props.paper && annotation.type === 'paper.reference') {
        console.log("inPaperChapter =", (annotation.text === this.props.paper.reference), "||",
          (annotation.paper && (annotation.paper.id === this.props.paper.id)))
        inPaperChapter =
          (annotation.text === this.props.paper.reference) ||
          (annotation.paper && (annotation.paper.id === this.props.paper.id))
      } else if (inPaperChapter) {
        results.push(annotation)
      }
      return results
    }, [])

    // Last, merge speakers into records
    let parts = []
    function appendPart(annotation) {
      let prevPart = parts.length > 0 ? parts[parts.length - 1] : null
      if (prevPart && prevPart.type === annotation.type && !annotation.speaker) {
        // Merge if not introducing new metadata
        prevPart.text += "\n" + annotation.text
        prevPart.end = annotation.end
      } else {
        // Append
        parts.push(annotation)
      }
    }

    let prevSpeaker = null
    for(var annotation of annotations) {
      console.log("a", annotation.type)
      switch(annotation.type) {

      case 'paper.proposition':
      case 'paper.reason':
      case 'paper.resolution':
        appendPart(annotation)
        break

      case 'record.protocol':
      case 'record.transcript':
        if (prevSpeaker) {
          annotation.speaker = prevSpeaker
          prevSpeaker = null
        }
        appendPart(annotation)
        break

      case 'record.speaker':
        prevSpeaker = null

        let prevPart = (parts.length > 0) ? parts[parts.length - 1] : null
        if (prevPart && annotation.begin < prevPart.end) {
          // Attach to overlapping prevPart
          prevPart.speaker = annotation
        } else {
          // Keep around for next part
          prevSpeaker = annotation
        }
        break

      }
    }
    console.log("parts", parts)
    this.setState({ parts }, cb)
  }

  render() {
    let parts = this.state.parts

    if (this.state.loading) {
      return (
        <article style={{ textAlign: 'center' }}>
          <CircularProgress size={2}/>
        </article>
      )
    } else if (this.state.error) {
      return (
        <h4 style={{ color: '#700', textAlign: 'center' }}>
          {this.state.error}
        </h4>
      )
    } else if (parts.length === 0) {
      return (
        <h4 style={{ color: '#888', textAlign: 'center' }}>
          Noch keine relevanten Annotationen
        </h4>
      )
    } else {
      return (
        <article>
          {parts.map(part => <AnnotationPart key={part.id} {...part}/>)}
        </article>
      )
    }
  }
}

class AnnotationPart extends React.Component {
  render() {
    let type = getTypeById(this.props.type)
    let title = type ? type.title : ""
    console.log("part", this.props)

    return (
      <div id={this.props.id}
          style={{
            borderLeft: `4px solid rgb(${type ? type.rgb : "255,255,255"})`,
            paddingLeft: "8px"
          }}>
        <h4 style={{ color: '#999', textAlign: 'center', margin: "0", padding: "1em 0" }}>
          {title}
        </h4>
        <p style={{ whiteSpace: 'pre-wrap', margin: "0", padding: "0.5em 0 1.5em" }}>
          {this.props.speaker ?
            <AnnotationSpeaker {...this.props.speaker}/> :
            ""}
          {this.props.text}
        </p>
      </div>
    )
  }
}

class AnnotationSpeaker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    if (this.props.person && this.props.person.id) {
      fetch(`/api/oparl/person/${this.props.person.id}`)
        .then(res => res.json())
        .then(person => {
          let party = getPersonParty(person)
          this.setState({ person, party })
        })
    }
  }

  render() {
    let person = this.state.person
    let party = this.state.party
    let backgroundColor = party ? `rgb(${party.rgb})` : "#666"

    return !person ? (
      <span style={{ fontWeight: 'bold', color: 'white', backgroundColor, marginRight: '0.5em' }}>
        {this.props.person && this.props.person.label || this.props.text}
      </span>
    ) : (
      <span style={{ color: 'white', backgroundColor, marginRight: '0.5em' }}>
        {person.photo ?
         <img src={person.photo} style={{ width: "64px", float: 'left', margin: "0 0.5em 0.5em 0" }}/> :
         ""}
        <span style={{ fontWeight: 'bold' }}>
          {person.name}
        </span>
        {party ?
         <span>, {party.name}</span> :
         ""}
      </span>
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
