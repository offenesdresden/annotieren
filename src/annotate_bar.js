import React from 'react'
import Reflux from 'reflux'

import Sidebar from 'react-md/lib/Sidebars'
import Toolbar from 'react-md/lib/Toolbars'
import { List, ListItem, ListItemControl } from 'react-md/lib/Lists'
import { Radio, RadioGroup } from 'react-md/lib/SelectionControls'
import { RaisedButton, FlatButton, IconButton } from 'react-md/lib/Buttons'
import TextField from 'react-md/lib/TextFields'
import FontIcon from 'react-md/lib/FontIcons'
import Chip from 'react-md/lib/Chips'

import PaperAvatar from './paper_avatar'
import Types from './types'
import { actions as accountActions, default as accountStore } from './account_store'


export default React.createClass({
  mixins: [
    Reflux.listenTo(accountActions.refreshLogin.completed, 'onRefreshLoginCompleted')
  ],

  getInitialState() {
    return {
      username: null
    }
  },

  componentDidMount() {
    this.setState({
      username: accountStore.username
    })
  },

  onRefreshLoginCompleted(username) {
    this.setState({ username })
  },

  render() {
    let annotation = this.props.currentAnnotation
    let open = !!this.state.username && !!annotation
    console.log("AnnotateBar.open:", open)
    let title = annotation &&
      annotation.type === 'new' ?
      "Annotieren" : "Ändern"
    return (
      <Sidebar className="annotate-bar" isOpen={open} align='right' responsive={true} fixed={true}
          header={
              <Toolbar primary={true} title={title}
                  style={{ marginTop: "48px" }}
                  />}
          >
        <TypesMenu key={annotation && annotation.id}
            currentAnnotation={annotation}
            onType={this.props.onType} onDelete={this.props.onDelete}
            onMetadata={this.props.onMetadata}
            />
      </Sidebar>
    )
  }
})

class TypesMenu extends React.Component {
  render() {
    let annotation = this.props.currentAnnotation

    let list = []
    Types.forEach((category, i) => {
      let nested = []
      category.types.forEach((type, j) => {
        let backgroundColor = type.color
        nested.push(
          <ListItemControl key={j}
              style={{ backgroundColor }}
              primaryText={type.title}
              primaryAction={<Radio
                                 name="type" value={type.id}
                                 label={type.title}
                                 title={type.hint}
                                 checked={annotation && annotation.type === type.id}
                                 onChange={() => this.onChange(type.id)}
                                 />}
              />)
        if (type.metadata && annotation && annotation.type == type.id) {
          type.metadata.forEach((keyName, k) => {
            nested.push(
              <TypeMetadata key={`metadata-${keyName}`}
                  style={{ backgroundColor }}
                  keyName={keyName} value={annotation && annotation[keyName]}
                  text={annotation && annotation.text}
                  onUpdate={value => this.props.onMetadata(keyName, value)}
                  />
            )
          })
        }
      })
      list.push(
        <ListItem key={i} disabled={true}
            primaryText={category.title}
            nestedItems={nested}
            isOpen={true} rightIcon={<span/>}
            />
      )
    })

    return (
      <div>
        <List>
          {list}
        </List>

        {(annotation && annotation.type !== 'new') ?
          <div style={{ textAlign: "center", margin: "1em auto" }}>
            <RaisedButton label="Löschen" iconBefore={true}
                style={{ backgroundColor: '#f00', color: "white" }}
                onClick={ev => this.props.onDelete()}
                >
              <FontIcon>delete</FontIcon>
           </RaisedButton>
         </div> : ""
        }
      </div>
    )
  }

  onChange(value) {
    if (this.props.onType) {
      this.props.onType(value)
    }
  }
}

const METADATA_LABELS = {
  person: "Person",
  organization: "Gremium",
  meeting: "Sitzung",
  paper: "Vorlage",
  file: "Datei",
  location: "Ort"
}

class TypeMetadata extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      filterText: "",
      suggestions: []
    }
  }

  componentDidMount() {
    if (!this.props.value) {
      this.handleFilterTextUpdate(this.props.text)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.filterText && nextProps.text) {
      this.handleFilterTextUpdate(nextProps.text)
    }
  }

  handleFilterTextUpdate(text) {
    this.setState({
      filterText: text,
      loading: true
    })

    fetchMetadataSuggestions(this.props.keyName, text)
      .then(suggestions => {
        this.setState({ loading: false, suggestions })
      })
      .catch(e => {
        console.error(e.stack)
        
        this.setState({ loading: false })
      })
  }
  
  render() {
    let value = this.props.value
    if (value && value.id) {
      let chipContent
      switch(this.props.keyName) {
      case 'person':
        chipContent = <FontIcon>face</FontIcon>
        break
      case 'meeting':
        chipContent = <FontIcon>event</FontIcon>
        break
      case 'organization':
        chipContent = <FontIcon>group work</FontIcon>
        break
      case 'file':
        chipContent = <FontIcon>description</FontIcon>
        break
      case 'paper':
        chipContent = <PaperAvatar paper={value}/>
        break
      case 'geolocation':
        chipContent = <FontIcon>place</FontIcon>
        break
      default:
        chipContent = []
      }
      /* Render the current value */
      return (
        <ListItem disabled={true}
            style={Object.assign({ textAlign: 'center' }, this.props.style)}
            primaryText={
              <Chip label={getMetadataLabel(value)}
                  remove={() => this.handleRemove()}
                  >
                {chipContent}
              </Chip>}
            />
      )
    } else {
      let suggestionItems = []
      this.state.suggestions.forEach(suggestion => {
        let onClick = () => this.handleSelectSuggestion(suggestion)
        suggestionItems.push(
          <ListItem key={suggestion.id} style={this.props.style}
              onClick={onClick}
              leftIcon={
                <IconButton onClick={onClick}>
                  done
                </IconButton>
              }
              primaryText={suggestion.shortName || suggestion.name}
              secondaryText={suggestion.shortName ? suggestion.name : null}
              />
        )
      })
      
      /* Render a list of suggestions */
      return (
        <ListItem style={this.props.style}
            primaryText={
              <TextField type="search" icon={<FontIcon>search</FontIcon>}
                  value={this.state.filterText}
                  onChange={value => this.handleFilterTextUpdate(value)}
                  />
            }
            isOpen={true} rightIcon={<span/>}
            nestedItems={suggestionItems}
            />
      )
    }
  }

  handleSelectSuggestion(suggestion) {
    this.props.onUpdate(suggestion)
  }
  
  handleRemove() {
    this.props.onUpdate(null)
  }
}

function getMetadataLabel(metadata) {
  let label = metadata.name
  if (metadata.shortName) label = `${metadata.shortName}: ${label}`
  if (metadata.status) label = `${label} (${metadata.status})`
  return label
}

function fetchMetadataSuggestions(key, text) {
  return fetch(`/api/suggest/${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text })
  })
    .then(res => res.json())
    .then(suggestions => suggestions.map(suggestion => {
      return {
        id: suggestion.id,
        name: suggestion.name,
        shortName: suggestion.shortName,
        status: suggestion.status,
        label: getMetadataLabel(suggestion)
      }
    }))
}
