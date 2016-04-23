import React from 'react'
import Route from 'react-route'

import Toolbar from 'react-md/lib/Toolbars'
import { Card, CardTitle, CardActions, CardText } from 'react-md/lib/Cards'
import { RaisedButton } from 'react-md/lib/Buttons'
import { CircularProgress } from 'react-md/lib/Progress'

import { RaisedLinkButton } from './link_button'
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

  _fetchPaper() {
    return fetch(`/api/oparl/paper/${encodeURIComponent(this.state.paper.id)}`)
      .then(res => res.json())
      .then(paper => {
        paper.fileIds = paper.auxiliaryFile || []
        if (paper.mainFile) paper.fileIds.push(paper.mainFile)

        this.setState({
          paper: paper
        })
      })
  }

  _fetchAnnotatedFiles() {
    return fetch(`/api/paper/${encodeURIComponent(this.state.paper.id)}/annotated_files`)
      .then(res => res.json())
      .then(fileIds => {
        this.setState({
          annotatedFiles: fileIds
        })
      })
  }

  componentDidMount() {
    this.setState({
      loading: true
    }, () => {
      this._fetchAnnotatedFiles()
        .then(() => this._fetchPaper())
        .then(() => this.setState({
          loading: false
        }))
        .catch(e => {
          console.error(e.message, e.stack || e)
          this.showStatus(e.message)
          this.setState({
            loading: false
          })
        })
    })
  }

  render() {
    let paper = this.state.paper
    let annotatedFiles = this.state && this.state.annotatedFiles || []
    let fileCards = []
    function pushFileCards(file, role) {
      if (Array.isArray(file)) {
        file.forEach(f => pushFileCards(f, role))
      } else if (typeof file == 'string') {
        let expanded = annotatedFiles.indexOf(file) >= 0
        fileCards.push(<FileCard key={file} file={{ id: file }} role={role} paper={paper} isInitialExpanded={expanded}/>)
      }
    }
    pushFileCards(paper.mainFile, "Hauptdatei")
    pushFileCards(paper.auxiliaryFile)

    return (
      <div className="paper-view" style={{ maxWidth: "60em", margin: "0 auto" }}>
        <Toolbar
            primary={true}
            actionLeft={
              <PaperAvatar paper={paper}/>
            }
            title={paper.name}
            actionRight={
              <p style={{ margin: "16px 0 0", fontSize: "80%", color: 'white' }}>
                {iso8601ToDate(paper.publishedDate)}
              </p>
            }
            />

        {fileCards}

        {(paper.consultation || [])
         .filter(consultation => !!consultation.meeting)
         .map((consultation, i) =>
           <Meeting key={i} id={consultation.meeting} filesOf={paper.id} paper={paper} annotatedFiles={annotatedFiles}/>
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
    let annotatedFiles = this.props.annotatedFiles || []
    let fileCards = []
    function pushFileCards(file, role) {
      if (Array.isArray(file)) {
        file.forEach(f => pushFileCards(f, role))
      } else if (typeof file == 'string') {
        let expanded = annotatedFiles.indexOf(file) >= 0
        fileCards.push(<FileCard key={file} file={{ id: file }} role={role} paper={paper} isInitialExpanded={expanded}/>)
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
          <AgendaItem key={i} item={item} paper={this.props.paper} annotatedFiles={annotatedFiles}/>
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
    let annotatedFiles = this.props.annotatedFiles || []
    let fileCards = []
    function pushFileCards(file, role) {
      if (Array.isArray(file)) {
        file.forEach(f => pushFileCards(f, role))
      } else if (typeof file == 'string' && paper.fileIds.indexOf(file) === -1) {
        let expanded = annotatedFiles.indexOf(file) >= 0
        fileCards.push(<FileCard key={file} file={{ id: file }} role={role} paper={paper} isInitialExpanded={expanded}/>)
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
    let details
    if (file.mimeType == 'application/pdf') {
      details = <CardText expandable={true} style={{
            backgroundColor: "#fafafa"
          }}>
        <FileDetails file={file} paper={this.props.paper}/>
      </CardText>
    } else {
      details = <CardText expandable={true} style={{
            textAlign: 'center',
            padding: "0 !important"
          }}>
        <img style={{ maxWidth: "100%" }}
            src={file.downloadUrl}
            />
      </CardText>
    }

    return (
      <Card style={{ margin: "1em auto", maxWidth: "60em" }}
          isInitialExpanded={this.props.isInitialExpanded}
          >
        <CardTitle
          title={file.name || ""}
          titleStyle={{ fontWeight: 'bold' }}
          subtitle={this.props.role}
          isExpander={!!details}
          />
        {details || <div/>}
        <CardActions>
          <RaisedLinkButton label="Text Annotieren" primary={true}
              href={`/file/${encodeURIComponent(file.id)}`}/>
          <RaisedButton label="Original-PDF" secondary={true}
              href={file.downloadUrl}
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
      parts: [],
      originators: [],
      recipients: []
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
      if (/^doc\./.test(annotation.type)) {
        results.push(annotation)
      } else if (this.props.paper &&
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

    let originators = []
    let recipients = []
    let prevSpeaker = null
    for(var annotation of annotations) {
      let prevPart = (parts.length > 0) ? parts[parts.length - 1] : null

      if (prevPart && prevPart.type === annotation.type) {
        // Same type as the previous one
        annotation.noHeading = true
      }

      switch(annotation.type) {

      case 'doc.originator':
        originators.push(annotation)
        break
      case 'doc.recipient':
        recipients.push(annotation)
        break

      case 'paper.intro':
      case 'paper.inquiry':
      case 'paper.response':
      case 'paper.proposition':
      case 'paper.reason':
      case 'paper.comment':
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
      if (part.type !== 'vote' &&
          prevPart && prevPart.type === part.type && !part.speaker) {
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

    this.setState({ parts, originators, recipients }, cb)
  }

  render() {
    let parts = this.state.parts

    if (this.state.loading) {
      return (
        <article style={{ textAlign: 'center' }}>
          <CircularProgress scale={2}/>
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
      let type = getTypeById('doc.originator')
      return (
        <article>
          <div className="addrs" style={{
            flex: "1 1 25em",
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'nowrap',
            borderLeft: `4px solid ${type ? type.color : 'white'}`
          }}>
            {this.renderAddrs("Von:", this.state.originators)}
            {this.renderAddrs("An:", this.state.recipients)}
          </div>
          {parts.map(part =>
                     (part.type == 'vote' ?
                      <Vote key={part.id} {...part}/> :
                      <AnnotationPart key={part.id} {...part}/>
                     ))}
        </article>
      )
    }
  }

  renderAddrs(label, addrs) {
    if (addrs.length > 0) {
      // Uniquify:
      let seen = {}
      addrs = addrs.filter(addr => {
        let key = addr.person ? addr.person.id : addr.text
        if (seen.hasOwnProperty(key)) {
          return false
        } else {
          seen[key] = true
          return true
        }
      })

      return (
        <div style={{ margin: "0 1em 0.5em" }}>
          <h4>{label}</h4>
          {addrs.map(addr => <Addr key={addr.id} {...addr}/> )}
        </div>
      )
    } else {
      return <div/>
    }
  }
}

class Addr extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    }
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
    let annotation = this.props
    let person = this.state.person || this.props.person
    let party = this.state.party
    let style = party ? {
      color: 'white',
      backgroundColor: `rgb(${party.rgb})`
    } : {}

    return (
      <div key={annotation.id} style={style}>
        {(person && person.photo) ?
         <img src={person.photo}
             style={{
               width: "96px",
               display: 'inline-block',
               margin: "0 0.1em 0.2em 0",
               verticalAlign: 'top'
             }}/> :
         ""}
        <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
          <p>
            {person ? person.name : annotation.text}
          </p>
          {party &&
           <p>{party.name}</p>
          }
        </div>
      </div>
    )
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
      .replace(/([a-zäöüß])-\n([a-zäöüß])/g, (match, s1, s2) => `${s1}\u00AD${s2}`)
      // Join single line breaks that are followed by words
      .replace(/([^\n])\n *([A-Za-zÄÖÜäöüẞß]{2,})/g, (match, s1, s2) => `${s1} ${s2}`)

    return (
      <div id={this.props.id}
          style={{
            borderLeft: `4px solid ${type ? type.color : 'white'}`,
            paddingLeft: "8px",
            marginTop: "1em"
          }}>
        {this.props.noHeading ? "" :
          <h4 style={{ color: '#333', textAlign: 'center', margin: "0", padding: "1em 0" }}>
            {title}
          </h4>}
        {this.props.refs ?
         (<div style={{ float: 'right', clear: 'right', maxWidth: "14em" }}>
            {this.props.refs.map(ref => <AnnotationRef key={ref.id} {...ref}/>)}
          </div>) :
         ""}
        <p style={{
              whiteSpace: 'pre-wrap',
              clear: 'left',
              margin: "0",
              padding: "0.5em 0 1.5em",
              lineHeight: "1.5em"
            }}>
          {this.props.speaker ?
            <AnnotationSpeaker {...this.props.speaker}/> :
            ""}
          {text}
        </p>

        <div style={{ clear: 'both' }}>
        </div>
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
    let party = this.state.party
    let backgroundColor = party ? `rgb(${party.rgb})` : "#666"

    if (person) {
      return (
        <div style={{ margin: '0 0 0.5em 1em', padding: "0.5em", backgroundColor, color: 'white', textAlign: 'center' }}>
          {person.photo ?
           <img src={person.photo} style={{ width: "12em", float: 'left', margin: "0 auto 0.5em" }}/> :
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
    } else {
      let text = (this.props.person && this.props.person.label) || this.props.text
      let comma, name, desc
      if ((comma = text.indexOf(",")) > 0) {
        name = text.slice(0, comma)
        desc = text.slice(comma + 1)
      } else {
        name = text
      }
      return (
        <div style={{ margin: '0 0 0.5em 1em', padding: "0.5em", backgroundColor, color: 'white', textAlign: 'center' }}>
          <p style={{ margin: "0" }}>
            <span style={{ fontWeight: 'bold' }}>{name}</span>
            {desc ? `, ${desc}` : ""}
          </p>
        </div>
      )
    }
  }
}

class PaperRef extends React.Component {
  constructor(props) {
    super(props)
    this.state = { paper: null }
  }

  componentDidMount() {
    if (this.props.paper && this.props.paper.id) {
      fetch(`/api/oparl/paper/${this.props.paper.id}`)
        .then(res => res.json())
        .then(paper => this.setState({ paper }))
    } else {
    }
  }

  render() {
    let paper = this.state.paper
    if (!paper) return <div/>

    return paper ? (
      <div style={{ margin: '0 0 0.5em 1em', padding: "0.5em", backgroundColor: 'white' }}>
        <PaperAvatar paper={paper} style={{ float: 'left', verticalAlign: 'top' }}/>
        <p style={{ verticalAlign: 'middle', margin: "0", whiteSpace: 'pre-wrap', cursor: 'pointer' }}
            onClick={() => Route.go(`/paper/${this.props.paper.id}`)}>
          {paper.name}
        </p>
      </div>
    ) : (
      <div style={{ margin: '0 0 0.5em 1em', padding: "0.5em", backgroundColor: 'white' }}>
        <PaperAvatar paper={{ shortName: "?" }} style={{ float: 'left', verticalAlign: 'top' }}/>
        <p style={{ verticalAlign: 'middle', margin: "0", whiteSpace: 'pre-wrap' }}>
          {this.props.text}
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
        <div style={{ textAlign: 'center', borderLeft: `4px solid ${yesType.color}` }}>
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
        <p style={{ margin: "0", padding: "1em 2em" }}>
          {this.props.result}
        </p>

        <div style={{ clear: 'both' }}>
        </div>
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
