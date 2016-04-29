import React from 'react'
import Route from 'react-route'

import { Card, CardTitle, CardText } from 'react-md/lib/Cards'
import { List, ListItem } from 'react-md/lib/Lists'
import { CircularProgress } from 'react-md/lib/Progress'
import FontIcon from 'react-md/lib/FontIcons'

import PaperAvatar from './paper_avatar'
import iso8601ToDate from './iso8601_to_date'


export default class Main extends React.Component {
  render() {
    let cardStyle = {
      flex: "1 1 35em",
      overflowX: 'hidden'
    }

    return (
      <div className="md-card-list front-page" style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap'
          }}>
        <Card style={cardStyle}>
          <CardTitle title="Neueste Anfragen und Vorlagen"/>
          <CardText>
            <RecentPapers/>
          </CardText>
        </Card>

        <Card style={cardStyle}>
          <CardTitle title="Gut annotierte Vorgänge"/>
          <CardText>
            <MostAnnotatedPapers/>
          </CardText>
        </Card>

        <Card style={cardStyle}>
          <CardTitle title="Zuletzt annotierte Dokumente"/>
          <CardText>
            <RecentAnnotatedFiles/>
          </CardText>
        </Card>

        <Card style={cardStyle}>
          <CardTitle title="Highscore"/>
          <CardText>
            <MostAnnotatingUsers/>
          </CardText>
        </Card>
      </div>
    )
  }
}

class RecentPapers extends React.Component {
  componentDidMount() {
    fetch("/api/papers/recent")
      .then(res => res.json())
      .then(results => {
        this.setState({
          papers: results
        })
      })
  }

  render() {
    if (this.state && this.state.papers) {
      return (
        <List>
          {this.state.papers.map(paper => <PaperItem key={paper.id} {...paper}/> )}
        </List>
      )
    } else {
      return (
        <div style={{ margin: "2em auto" }}>
          <CircularProgress/>
        </div>
      )
    }
  }
}

class MostAnnotatedPapers extends React.Component {
  componentDidMount() {
    fetch("/api/papers/most/annotations")
      .then(res => res.json())
      .then(results => {
        this.setState({
          papers: results
        })
      })
  }

  render() {
    if (this.state && this.state.papers) {
      return (
        <List>
          {this.state.papers.map(paper => <PaperItem key={paper.id} {...paper}/> )}
        </List>
      )
    } else {
      return (
        <div style={{ margin: "2em auto" }}>
          <CircularProgress/>
        </div>
      )
    }
  }
}

class RecentAnnotatedFiles extends React.Component {
  componentDidMount() {
    fetch("/api/files/recent/annotations")
      .then(res => res.json())
      .then(results => {
        this.setState({
          files: results
        })
      })
  }

  render() {
    if (this.state && this.state.files) {
      return (
        <List>
          {this.state.files.map(file => <FileItem key={file.id} {...file}/> )}
        </List>
      )
    } else {
      return (
        <div style={{ margin: "2em auto" }}>
          <CircularProgress/>
        </div>
      )
    }
  }
}

class MostAnnotatingUsers extends React.Component {
  componentDidMount() {
    fetch("/api/users/top/annotations")
      .then(res => res.json())
      .then(results => {
        this.setState({
          users: results
        })
      })
  }

  render() {
    let userIcon = user => {
      let { annotationsCreated } = user
      if (annotationsCreated < 5) {
        return 'pool'
      } else if (annotationsCreated < 25) {
        return 'directions_walk'
      } else if (annotationsCreated < 1000) {
        return 'directions_run'
      } else if (annotationsCreated < 1500) {
        return 'directions_bike'
      } else if (annotationsCreated < 2500) {
        return 'directions_car'
      } else if (annotationsCreated < 4000) {
        return 'directions_bus'
      } else if (annotationsCreated < 6000) {
        return 'local_shipping'
      } else if (annotationsCreated < 8000) {
        return 'subway'
      } else if (annotationsCreated < 10000) {
        return 'tram'
      } else if (annotationsCreated < 15000) {
        return 'train'
      } else if (annotationsCreated < 20000) {
        return 'directions_boat'
      } else if (annotationsCreated < 30000) {
        return 'airport_shuttle'
      } else if (annotationsCreated < 40000) {
        return 'flight'
      } else if (annotationsCreated < 50000) {
        return 'airline_seat_recline_normal'
      } else if (annotationsCreated < 100000) {
        return 'airline_seat_recline_extra'
      } else {
        return 'flash_on'
      }
    }

    if (this.state && this.state.users) {
      return (
        <List>
          {this.state.users.map(user => (
            <ListItem key={user.name} disabled={true}
                leftIcon={<FontIcon>{userIcon(user)}</FontIcon>}
                primaryText={user.name}
                secondaryText={`${user.annotationsCreated} Annotationen erstellt`}
                />
          ))}
        </List>
      )
    } else {
      return (
        <div style={{ margin: "2em auto" }}>
          <CircularProgress/>
        </div>
      )
    }
  }
}

class PaperItem extends React.Component {
  render() {
    let paper = this.props
    let primary = paper.name
    let secondary = iso8601ToDate(paper.publishedDate)
    if (paper.paperType) {
      secondary += `, ${paper.paperType}`
    }

    return (
      <ListItem
          leftIcon={<PaperAvatar paper={paper} style={{ color: 'white' }}/>}
          primaryText={primary}
          secondaryText={secondary}
          onClick={() => Route.go(`/paper/${encodeURIComponent(paper.id)}`)}
          />
    )
  }
}

class FileItem extends React.Component {
  render() {
    let file = this.props

    return (
      <ListItem
          primaryText={file.name}
          leftIcon={<FontIcon>description</FontIcon>}
          onClick={ev => Route.go(`/file/${encodeURIComponent(this.props.id)}`)}
          />
    )
  }
}
