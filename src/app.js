import React from 'react'
import ReactDOM from 'react-dom'
import Route from 'react-route'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import Search from './search'
import SearchResults from './search_results'
import DocView from './doc_view'


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
        <Route path="/">
          <header>
            <Search style={{float: "right"}}/>
            <h1>Ratsinfo Annotieren</h1>
          </header>
          <SearchResults/>
        </Route>
        <Route path="/file/:id">
          <DocView/>
        </Route>
      </div>
    )
  }
}

ReactDOM.render(<Main />, document.getElementById('app-container'))
