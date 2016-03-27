import React from 'react'
import ReactDOM from 'react-dom'
import Route from 'react-route'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import Navigation from './navigation'
import Search from './search'
import SearchResults from './search_results'
import DocView from './doc_view'
import PaperView from './paper_view'


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
        <Navigation/>

        <div style={{ marginTop: "3em" }}>
          <Route path="/">
            <SearchResults/>
          </Route>
          <Route path="/file/:id">
            <DocView/>
          </Route>
          <Route path="/paper/:id">
            <PaperView/>
          </Route>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Main />, document.getElementById('app-container'))
