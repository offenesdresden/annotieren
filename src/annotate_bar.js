import React from 'react'
import Reflux from 'reflux'

import LeftNav from 'material-ui/lib/left-nav'
import AppBar from 'material-ui/lib/app-bar'
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item'
import ArrowDropRight from 'material-ui/lib/svg-icons/navigation-arrow-drop-right'
import RadioButton from 'material-ui/lib/radio-button'
import RaisedButton from 'material-ui/lib/raised-button'
import DeleteIcon from 'material-ui/lib/svg-icons/action/delete'
import colors from 'material-ui/lib/styles/colors'
import AutoComplete from 'material-ui/lib/auto-complete'

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
    let open = !!this.state.username && !!this.props.currentAnnotation
    let title = this.props.currentAnnotation &&
      this.props.currentAnnotation.type === 'new' ?
      "Annotieren" : "Ändern"
    return (
      <LeftNav open={open} openRight={true} width={260}>
        <AppBar title={title} showMenuIconButton={false}
            style={{ marginTop: "48px" }}
            />
        <TypesMenu
            currentAnnotation={this.props.currentAnnotation}
            onType={this.props.onType} onDelete={this.props.onDelete}
            onMetadata={this.props.onMetadata}
            />
      </LeftNav>
    )
  }
})

class TypesMenu extends React.Component {
  render() {
    let annotation = this.props.currentAnnotation

    return (
      <div>
        {Types.map((category, i) => (
          <List key={i}
              subheader={category.title}
              subheaderStyle={{ lineHeight: '32px' }}
              >
            {category.types.map((type, j) => (
              <ListItem key={j}
                  style={{ backgroundColor: `rgb(${type.rgb})` }}
                  title={type.hint}
                  leftCheckbox={<RadioButton
                      name="type" value={type.id}
                      checked={annotation && annotation.type == type.id}
                      onCheck={ev => this.onCheck(ev)}
                      />}
                    >
                <div>{type.title}</div>
                {(type.metadata && annotation && annotation.type == type.id) ?
                  type.metadata.map((keyName, i) =>
                    <TypeMetadata key={i}
                        keyName={keyName} value={annotation && annotation[keyName]}
                        text={annotation && annotation.text}
                        onUpdate={value => this.props.onMetadata(keyName, value)}
                        />
                ) : ""}
              </ListItem>
            ))}
          </List>
        ))}

        {(annotation && annotation.type !== 'new') ?
          <div style={{ textAlign: "center", marginTop: "1em" }}>
            <RaisedButton label="Löschen" icon={<DeleteIcon/>}
                backgroundColor={colors.red700} labelColor="white"
                onClick={ev => this.props.onDelete()}
                />
          </div> : ""
        }
      </div>
    )
  }

  onCheck(ev) {
    let value = ev.target.value
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
      byLabel: {},
      labels: [],
      label: ""
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
        if (!this.state.label && labels[0]) {
          // Nothing yet, input the first suggestion and trigger updateAnnotation
          this.handleUpdateInput(labels[0])
        }
      })
  }

  componentDidMount() {
    if (this.props.value) {
      // Copy metadata value if already existing
      this.setState({
        id: this.props.value.id,
        label: this.props.value.label
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
        <AutoComplete hintText={METADATA_LABELS[this.props.keyName]}
            searchText={this.state.label}
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
