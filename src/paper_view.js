import React from 'react'
import Route from 'react-route'

import AppBar from 'material-ui/lib/app-bar'
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
        id: this.props.id
      }
    }
  }

  componentDidMount() {
    fetch(`/api/oparl/paper/${encodeURIComponent(this.state.paper.id)}`)
      .then(res => res.json())
      .then(paper => {
        paper.fileIds = paper.auxiliaryFile || []
        if (paper.mainFile) paper.fileIds.push(paper.mainFile)

        this.setState({
          paper: paper
        })
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
            iconElementLeft={
              <PaperAvatar paper={paper} size={48}/>
            }
            title={
              <span style={{ whiteSpace: 'pre-wrap' }}>
                {paper.name}
              </span>
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
      } else if (typeof file == 'string' && paper.fileIds.indexOf(file) === -1) {
        fileCards.push(<FileCard key={file} file={{ id: file }} role={role} paper={paper}/>)
      }
    }
    pushFileCards(item.resolutionFile, "Beschlussfassung")
    pushFileCards(item.auxiliaryFile)

    return fileCards.length > 0 ? (
      <div>
        <h3 style={{ textAlign: 'center', color: "#666" }}>{item.name}</h3>

        {fileCards}
      </div>
    ) : <div/>
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
          titleStyle={{ fontWeight: 'bold' }}
          subtitle={this.props.role}
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
        console.error(e.stack)
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
      (/^ref/.test(b.type) ? -1 : (a.end - b.end))
                                  )
    // TODO: if less then two different paper.{reference,name}, don't reduce:
    .reduce((results, annotation) => {
      // Then, restrict to this paper up until next one
      if (this.props.paper &&
          (annotation.type === 'paper.reference' || annotation.type === 'paper.name')) {
        inPaperChapter = annotation.paper &&
          (annotation.paper.id === this.props.paper.id)
      } else if (inPaperChapter) {
        results.push(annotation)
      }
      return results
    }, [])

    // Last, merge speakers into records
    let parts = []
    function appendPart(annotation) {
      // Normalize text once more
      if (annotation.text) {
        annotation.text = annotation.text
          .replace(/^\s+/, "")
          .replace(/\n\s+$/, "\n")
      }

      // Append
      parts.push(annotation)
    }

    let prevSpeaker = null
    for(var annotation of annotations) {
      let prevPart = (parts.length > 0) ? parts[parts.length - 1] : null

      if (prevPart && prevPart.type === annotation.type) {
        // Same type as the previous one
        annotation.noHeading = true
      }

      switch(annotation.type) {

      case 'paper.inquiry':
      case 'paper.response':
      case 'paper.proposition':
      case 'paper.reason':
      case 'paper.resolution':
      case 'paper.report':
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

        if (prevPart && annotation.begin < prevPart.end) {
          // Attach to overlapping prevPart
          prevPart.speaker = annotation
        } else {
          // Keep around for next part
          prevSpeaker = annotation
        }
        break

      case 'vote.yes':
      case 'vote.no':
      case 'vote.neutral':
      case 'vote.biased':
      case 'vote.result':
        let key = annotation.type.split(/\./)[1]

        let vote
        if (prevPart && prevPart.type == 'vote' &&  // Consecutive vote.* annotations
            !prevPart[key]  // But no duplicate data
           ) {
          // Resume previous vote part
          vote = prevPart
        } else {
          // Otherwise, create a new vote part
          vote = { type: 'vote', id: annotation.id }
          appendPart(vote)
        }

        vote[key] = annotation.text
        break

      case 'ref.person':
      case 'ref.organization':
      case 'ref.meeting':
      case 'ref.paper':
      case 'ref.file':
      case 'ref.location':
        if (prevPart) {
          if (!prevPart.refs) prevPart.refs = []
          prevPart.refs.push(annotation)
        }
        break
      }
    }

    let uniqRefs = {}
    let prevPart = null
    for(let part of parts) {
      if (part.refs) {
        // Remove duplicate refs
        part.refs = part.refs
          .filter(ref => {
            let id =
                (ref.person && (ref.person.id || ref.person.label)) ||
                (ref.organization && (ref.organization.id || ref.organization.label)) ||
                (ref.meeting && (ref.meeting.id || ref.meeting.label)) ||
                (ref.paper && (ref.paper.id || ref.paper.label)) ||
                (ref.file && (ref.file.id || ref.file.label)) ||
                ref.text
            let refId = `${ref.type}:${id}`
            if (uniqRefs[refId]) {
              return false
            } else {
              uniqRefs[refId] = true
              return true
            }
          })
      }

      // Merge if not introducing new speaker
      if (prevPart && prevPart.type === part.type && !part.speaker) {
        console.log("Merge", { prevPart, part })
        prevPart.text += part.text
        prevPart.end = part.end
        if (prevPart.refs && part.refs) {
          prevPart.refs = prevPart.refs.concat(part.refs)
        } else if (!prevPart.refs && part.refs) {
          prevPart.refs = part.refs
        }
        // Mark this for removal
        delete part.type
        // Immediately continue, not overwriting prevPart
      } else {
        prevPart = part
      }
    }

    // Pick marked for removal
    parts = parts.filter(part => !!part.type)

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
          {parts.map(part =>
                     (part.type == 'vote' ?
                      <Vote key={part.id} {...part}/> :
                      <AnnotationPart key={part.id} {...part}/>
                     ))}
        </article>
      )
    }
  }
}

class AnnotationPart extends React.Component {
  render() {
    let type = getTypeById(this.props.type)
    let title = type ? type.title : ""
    let text = this.props.text
      // Remove trailing spaces
      .replace(/ +\n/g, "\n")
      // Join hyphenations
      .replace(/([a-zäöüß])-\n([a-zäöüß])/g, (match, s1, s2) => `${s1}\u00AD\u00AD${s2}`)
      // Join single line breaks that are followed by words
      .replace(/([^\n])\n([A-Za-zÄÖÜäöüẞß]{2,})/g, (match, s1, s2) => `${s1} ${s2}`)

    return (
      <div id={this.props.id}
          style={{
            borderLeft: `4px solid rgb(${type ? type.rgb : "255,255,255"})`,
            paddingLeft: "8px"
          }}>
        {this.props.noHeading ? "" :
          <h4 style={{ color: '#999', textAlign: 'center', margin: "0", padding: "1em 0", clear: 'both' }}>
            {title}
          </h4>}
        {this.props.refs ?
         (<div style={{ float: 'right', clear: 'right' }}>
            {this.props.refs.map(ref => <AnnotationRef key={ref.id} {...ref}/>)}
          </div>) :
         ""}
        <p style={{
              whiteSpace: 'pre-wrap',
              clear: 'left',
              margin: "0",
              padding: "0.5em 0 1.5em"
            }}>
          {this.props.speaker ?
            <AnnotationSpeaker {...this.props.speaker}/> :
            ""}
          {text}
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
    let spanStyle = {
      color: 'white',
      backgroundColor,
      marginRight: '2px',
      padding: '1px 2px'
    }

    return !person ? (
      <span style={spanStyle}>
        {this.props.person && this.props.person.label || this.props.text}
      </span>
    ) : (
      <span style={spanStyle}>
        {person.photo ?
         <img src={person.photo} style={{ width: "96px", float: 'left', margin: "0 0.1em 0.2em 0" }}/> :
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

class AnnotationRef extends React.Component {
  render() {
    switch(this.props.type) {
    case 'ref.person':
      return <PersonRef {...this.props}/>
    case 'ref.paper':
      return <PaperRef {...this.props}/>
    default:
      return <div/>
    }
  }
}

class PersonRef extends React.Component {
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
    if (!person) return <div/>

    let party = this.state.party
    let backgroundColor = party ? `rgb(${party.rgb})` : "#666"

    return (
      <div style={{ margin: '0 0 0.5em 1em', padding: "0.5em", backgroundColor, color: 'white', textAlign: 'center' }}>
        {person.photo ?
         <img src={person.photo} style={{ width: "96px", float: 'left', margin: "0 0.1em 0.2em 0" }}/> :
         ""}
        <p style={{ fontWeight: 'bold', margin: "0" }}>
          {person.name}
        </p>
        {party ?
         <p style={{ margin: "0" }}>
           {party.name}
         </p> :
         ""}
      </div>
    )
  }
}

class PaperRef extends React.Component {
  constructor(props) {
    super(props)
    this.state = { paper: null }
  }

  componentDidMount() {
    fetch(`/api/oparl/paper/${this.props.paper.id}`)
      .then(res => res.json())
      .then(paper => this.setState({ paper }))
  }

  render() {
    let paper = this.state.paper
    if (!paper) return <div/>

    return (
      <div style={{ margin: '0 0 0.5em 1em', padding: "0.5em", backgroundColor: 'white' }}>
        <PaperAvatar paper={paper} size={24} style={{ display: 'inline-block', verticalAlign: 'top' }}/>
        <p style={{ display: 'inline-block', verticalAlign: 'middle', maxWidth: "15em", margin: "0", whiteSpace: 'pre-wrap', cursor: 'pointer' }}
            onClick={() => Route.go(`/paper/${this.props.paper.id}`)}>
          {paper.name}
        </p>
      </div>
    )
  }
}

const VOTE_COLORS = {
  yes: "#7c7",
  no: "#c77",
  neutral: "#77c",
  biased: "#00f"
}

// TODO: namentliche abstimmung?
class Vote extends React.Component {
  render() {
    let fractions = []
    let total = 0
    for(var fraction of ['yes', 'neutral', 'biased', 'no']) {
      if (this.props.hasOwnProperty(fraction)) {
        let value
        try {
          value = parseInt(this.props[fraction])
        } catch(e) { }
        if (typeof value === 'number' && value > 0) {
          fractions.push({ fraction, value })
          total += value
        }
      }
    }
    console.log("fractions", fractions, "total", total, "props", this.props)

    let yesType = getTypeById('vote.yes')
    return (
      <div style={{ textAlign: 'center', borderLeft: `4px solid rgb(${yesType.rgb})` }}>
        <h4 style={{ color: '#999', margin: "0", padding: "1em 0" }}>Abstimmung</h4>
        <p style={{ display: 'inline-block' }}>
          {fractions.map(f => (
            <span key={f.fraction} title={`${f.value}× ${f.fraction}`} style={{
                width: `${Math.ceil(320 * f.value / total)}px`,
                height: "16px",
                display: 'inline-block',
                textAlign: 'center',
                backgroundColor: VOTE_COLORS[f.fraction]
                }}>
              {f.value}
            </span>
          ))}
        </p>
        <p>{this.props.result}</p>
      </div>
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
