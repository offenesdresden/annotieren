import './app.scss'

import React from 'react'
import ReactDOM from 'react-dom'
import Route from 'react-route'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import Navigation from './navigation'
import Register from './register'
import Search from './search'
import SearchResults from './search_results'
import FrontPage from './front_page'
import DocView from './doc_view'
import PaperView from './paper_view'
import GeolocationPicker from './geolocation_picker'


class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {searchQuery: ""}
  }

  search(query) {
    this.setState({
      searchQuery: query
    })
  }

  render() {
    return (
      <div>
        <div>
          <Route path="/">
            <FrontRoute/>
          </Route>
          <Route path="/s/">
            <SearchRoute/>
          </Route>
          <Route path="/s/:query*">
            <SearchRoute/>
          </Route>
          <Route path="/register">
            <RegisterRoute/>
          </Route>
          <Route path="/file/:id">
            <FileRoute/>
          </Route>
          <Route path="/paper/:id">
            <PaperRoute/>
          </Route>
        </div>

        <p className="footer">
          <a href="http://offenesdresden.de/">OffenesDresden.de</a>
          •
          <a href="https://github.com/offenesdresden/annotieren">Fork on GitHub</a>
        </p>

        <GeolocationPicker/>
      </div>
    )
  }
}

class FrontRoute extends React.Component {
  render() {
    return (
      <div>
        <Navigation left={""} title="Dresdner Ratsinfo-Daten annotieren"/>

        <div style={{ marginTop: "64px" }}>
          <Search/>
          <FrontPage/>
        </div>
      </div>
    )
  }
}

class RegisterRoute extends React.Component {
  render() {
    return (
      <div>
        <Navigation title="Account registrieren"/>

        <div style={{ margin: "64px auto" }}>
          <Register/>
        </div>
      </div>
    )
  }
}

class SearchRoute extends React.Component {
  render() {
    let query = this.props.params.query
    return (
      <div>
        <Navigation title={`Suche: ${query}`}/>

        <div style={{ marginTop: "64px" }}>
          <Search query={query}/>
          <SearchResults query={query}/>
        </div>
      </div>
    )
  }
}

class FileRoute extends React.Component {
  render() {
    let id = this.props.params.id
    return <DocView key={id} id={id}/>
  }
}

class PaperRoute extends React.Component {
  render() {
    let id = this.props.params.id
    return <PaperView key={id} id={id}/>
  }
}

ReactDOM.render(<Main />, document.getElementById('app-container'))
