import Reflux from 'reflux'

export let actions = Reflux.createActions({
  search: {
    children: ['started', 'completed', 'failed']
  }
})

export default Reflux.createStore({
  listenables: actions,

  getInitialState() {
    return {
      loading: false
    }
  },

  init() {
    this.loading = false
  },

  onSearch(query) {
    console.log("onSearch", query)
    actions.search.started()
    
    fetch(`/api/search/${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(actions.search.completed)
      .catch(actions.search.failed)
  },

  onSearchStarted() {
    this.loading = true
  },

  onSearchCompleted(results) {
    console.log("onSearchCompleted", results)
    this.loading = false
  },

  onSearchFailed(err) {
    console.log("onSearchFailed", err)
    this.loading = false
  }
})
