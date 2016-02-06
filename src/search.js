import React from 'react'

import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardMedia from 'material-ui/lib/card/card-media';
import TextField from 'material-ui/lib/text-field'
import RaisedButton from 'material-ui/lib/raised-button';
import SearchIcon from 'material-ui/lib/svg-icons/action/search'
import colors from 'material-ui/lib/styles/colors';

export default class Search extends React.Component {
  constructor(props) {
    super(props)
    this.state = {query: ""}
  }
  
  render() {
    return (
      <Card {...this.props}>
        <CardMedia>
          <div style={{textAlign: "right", padding: "0 4px"}}>
            <TextField hintText="Dokumente suchen"
                onChange={ev => this.handleChange(ev)}
                type="search"
                onEnterKeyDown={ev => this.handleSubmit(ev)}
                style={{marginRight: "2em"}}/>
            <RaisedButton icon={<SearchIcon/>} backgroundColor={colors.lime800} label="Suchen" primary={true} onMouseDown={ev => this.handleSubmit(ev)}/>
          </div>
        </CardMedia>
      </Card>
    )
  }

  handleChange(ev) {
    this.setState({
      query: ev.target.value
    })
  }

  handleSubmit(ev) {
    ev.preventDefault()
    
    this.props.onSearch(this.state.query)
  }
}
