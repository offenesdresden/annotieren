import React from 'react'

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


export default class AnnotateBar extends React.Component {
  render() {
    let open = !!this.props.currentAnnotation
    let title = this.props.currentAnnotation &&
      this.props.currentAnnotation.type === 'new' ?
      "Annotieren" : "Ändern"
    return (
      <LeftNav open={open} openRight={true} width={240}>
        <AppBar title={title} showMenuIconButton={false}/>
        <TypesMenu
            value={this.props.currentAnnotation && this.props.currentAnnotation.type}
            text={this.props.currentAnnotation && this.props.currentAnnotation.text}
            onType={this.props.onType} onDelete={this.props.onDelete}
            />
      </LeftNav>
    )
  }
}

class TypesMenu extends React.Component {
  render() {
    return (
      <div>
        {Types.map((category, i) => (
          <List subheader={category.title} key={i}>
            {category.types.map((type, j) => (
              <ListItem key={j} style={{ backgroundColor: `rgb(${type.rgb})` }}>
                <RadioButton label={type.title} title={type.hint}
                    name="type" value={type.id}
                    checked={this.props.value == type.id}
                    onCheck={ev => this.onCheck(ev)}
                    />
                {(type.metadata && this.props.value == type.id) ?
                 type.metadata.map((metadata, i) =>
                   <TypeMetadata key={i}
                       metadata={metadata}
                       text={this.props.text}
                       />
                 ) : ""
                }
              </ListItem>
            ))}
          </List>
        ))}

        {(this.props.value !== 'new') ?
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
    fetch(`/api/suggest/${this.props.metadata}`, {
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
          this.setState({
            id: byLabel[labels[0]],
            label: labels[0]
          })
        }
      })
  }

  componentDidMount() {
    this._fetchSuggestions(this.props.text)
  }

  handleUpdateInput(label) {
    let id = this.state.byLabel[label]

    this.setState({
      id: id,
      label: label
    }, () => {
      if (!id) {
        this._fetchSuggestions(label)
      }
      // TODO: trigger write
    })
  }

  render() {
    return (
      <div>
        <AutoComplete hintText={METADATA_LABELS[this.props.metadata]}
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
