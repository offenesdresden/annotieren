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
            onType={this.props.onType} onDelete={this.props.onDelete}
            />
      </LeftNav>
    )
  }
}

class TypesMenu extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    return (
      <div>
        {Types.map((category, i) => (
          <List subheader={category.title} key={i}>
            {category.types.map((type, j) => (
              <ListItem key={j} style={{ backgroundColor: `rgb(${type.rgb})` }}>
                <RadioButton label={type.title}
                    name="type" value={type.id}
                    checked={this.props.value == type.id}
                    onCheck={ev => this.onCheck(ev)}
                    />
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
