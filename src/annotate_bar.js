import React from 'react'

import LeftNav from 'material-ui/lib/left-nav'
import AppBar from 'material-ui/lib/app-bar'
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item'
import Divider from 'material-ui/lib/divider'
import ArrowDropRight from 'material-ui/lib/svg-icons/navigation-arrow-drop-right'
import RadioButton from 'material-ui/lib/radio-button'


const TYPES = [
  { title: "Personen",
    types: [
      { title: "Schriftführer" },
      { title: "Anwesend" }
    ]
  },
  { title: "Tagesordnungspunkt",
    types: [
      { title: "Schlüssel" },
      { title: "Titel" },
      { title: "Textinhalt" }
    ]
  },
  { title: "Wortprotokoll",
    types: [
      { title: "Sprecher" },
      { title: "Niederschrift" }
    ]
  }  
]

export default class AnnotateBar extends React.Component {
  render() {
    console.log("AnnotateBar.render", this.props.currentAnnotation)
    let open = !!this.props.currentAnnotation
    let title = this.props.currentAnnotation &&
      this.props.currentAnnotation.type === 'new' ?
      "Annotieren" : "Ändern"
    return (
      <LeftNav open={open} openRight={true} width={240}>
        <AppBar title={title} showMenuIconButton={false}/>
        <TypesMenu
            value={this.props.currentAnnotation && this.props.currentAnnotation.type}
            onType={type => this.onType(type)}
            />
      </LeftNav>
    )
  }

  onType(type) {
    this.props.onType(type)
  }
}

class TypesMenu extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    console.log("TypesMenu.render", this.props.value)
    return (
      <div>
        {TYPES.map((category, i) => (
          <List subheader={category.title} key={i}>
            {category.types.map((type, j) => (
              <ListItem key={j}>
                <RadioButton label={type.title}
                    name="type" value={type.title}
                    checked={this.props.value == type.title}
                    onCheck={ev => this.onCheck(ev)}
                    />
              </ListItem>
            ))}
          </List>
        ))}
      </div>
    )
  }

  onCheck(ev) {
    let value = ev.target.value
    this.props.onType(value)
  }
}
