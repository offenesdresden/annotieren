import React from 'react'
import Route from 'react-route'

import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardMedia from 'material-ui/lib/card/card-media';
import CardTitle from 'material-ui/lib/card/card-title';
import CardText from 'material-ui/lib/card/card-text';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Avatar from 'material-ui/lib/avatar';
import colors from 'material-ui/lib/styles/colors';
import DescriptionIcon from 'material-ui/lib/svg-icons/action/description'


export default class SearchResults extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      query: "",
      results: []
    }
  }

  search(query) {
    this.setState({
      query: query,
      loading: true
    })

    fetch(`/api/docs/search/${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(json => {
        // Trigger update:
        this.setState({
          loading: false,
          results: json
        })
      })
  }

  componentDidMount() {
    console.log("search from componentDidMount")
    this.search(this.state.query)
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.query !== this.state.query) {
      console.log("search from componentWillReceiveProps")
      this.search(nextProps.query)
    }
  }
  
  render() {
    return (
      <div>
        {this.state.results.map((result, i) =>
          <Card key={i}>
            <CardHeader
                title={result.description}
                subtitle={result.started_at}
                style={{ backgroundColor: colors.lime500 }}
                titleStyle={{ fontWeight: "bold", fontSize: "120%" }}
                />
            <CardText>
              <List>
                {result.parts.map((part, j) =>
                  <ListItem key={j} disabled={true}>
                    <List subheader={
                      <div>
                        {part.template_id ? (
                          <Avatar color="white" size={32} style={{float: "left", clear: "left"}}
                              backgroundColor={templateIdToColor(part.template_id)}
                              title={templateIdToTitle(part.template_id)}
                              >
                            {part.template_id && part.template_id[0]}
                          </Avatar>
                        ) : ""}
                        <p style={{ marginLeft: "40px", lineHeight: "1.4em" }}>{part.description}</p>
                      </div>
                    }>
                      {part.documents.map((doc, k) =>
                        <ListItem key={k}
                            onClick={ev => this.handleDocumentClick(ev, doc)}
                            >
                          <DescriptionIcon color="#ccc"/>
                          {doc.description}
                        </ListItem>
                      )}
                    </List>
                  </ListItem>
                )}
              </List>
            </CardText>
          </Card>
        )}
      </div>
    )
  }

  handleDocumentClick(ev, doc) {
    let docId = doc.file_name.replace(/\..*/, "")
    Route.go(`/doc/${docId}`)
  }
}

function templateIdToTitle(template_id) {
  if (/^V/.test(template_id)) {
    return `Vorlage ${template_id}`
  } else if (/^A/.test(template_id)) {
    return `Antrag ${template_id}`
  } else if (template_id) {
    return template_id
  } else {
    return "Keine Vorlage"
  }
}

function templateIdToColor(template_id) {
  if (/^V/.test(template_id)) {
    return colors.deepPurple500
  } else if (/^A/.test(template_id)) {
    return colors.lightBlue500
  } else if (template_id) {
    return colors.lightGreen500
  } else {
    return colors.lightGreen200
  }
}
