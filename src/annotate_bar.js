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
        <ListItem key={i}
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
      /* Render the current value */
      return (
        <ListItem disabled={true}
            style={Object.assign({ textAlign: 'center' }, this.props.style)}
            primaryText={
              <Chip label={value.label}
                  remove={() => this.handleRemove()}
                  >
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
              primaryText={suggestion.label}
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

function fetchMetadataSuggestions(key, text) {
  return fetch(`/api/suggest/${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text })
  })
    .then(res => res.json())
    .then(suggestions => suggestions.map(suggestion => {
      let s = suggestion.name
      if (suggestion.shortName) s = `${suggestion.shortName}: ${s}`
      if (suggestion.status) s = `${s} (${suggestion.status})`
      return {
        id: suggestion.id,
        label: s
      }
    }))
}

class OldTypeMetadata extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      byLabel: {},
      labels: [],
      label: "",
      input: ""
    }
  }

  // TODO:
  // * suggest from context (other files in this session, session participants)
  // * suggest from other annotations ("Die Oberbürgermeisterin" maps to the same person)
  _fetchSuggestions(text) {
    // Query with current input or, if empty, annotation text
    let keyName = this.props.keyName
    fetch(`/api/suggest/${keyName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    })
      .then(res => res.json())
      .then(suggestions => {
        let byLabel = {}
        let labels = suggestions.map(suggestion => {
          let s = suggestion.name
          if (suggestion.shortName) s = `${suggestion.shortName}: ${s}`
          if (suggestion.status) s = `${s} (${suggestion.status})`
          byLabel[s] = suggestion.id
          return s
        })
        this.setState({
          byLabel: byLabel,
          labels: labels
        })

        let input
        if (!this.state.label && (input = labels[0])) {
          // Nothing yet, input the first suggestion and trigger updateAnnotation
          this.setState({ input }, () => this.handleUpdateInput(input))
        }
      })
  }

  componentDidMount() {
    if (this.props.value) {
      // Copy metadata value if already existing
      this.setState({
        id: this.props.value.id,
        label: this.props.value.label,
        input: this.props.value.label
      })
    }

    // Initialize suggestions from annotation text
    this._fetchSuggestions(this.props.text)
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.value !== nextProps.value || this.props.text !== nextProps.text) {
      // Reset & reinit
      this.setState({
        id: null,
        label: null
      }, () => this.componentDidMount())
    }
  }

  handleUpdateInput(label) {
    let id = this.state.byLabel[label]

    this.setState({ id, label }, () => {
      if (!id) {
        // Update suggestions from text input
        this._fetchSuggestions(label)
      }
      this.props.onUpdate({ id, label })
    })
  }

  render() {
    return (
      <div>
        <TextField placeholder={METADATA_LABELS[this.props.keyName]}
            searchText={this.state.input}
            dataSource={this.state.labels}
            onUpdateInput={label => this.handleUpdateInput(label)}
            onNewRequest={label => this.handleUpdateInput(label)}
            filter={(searchText, key) => true}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            fullWidth={true}
            />
      </div>
    )
  }
}
