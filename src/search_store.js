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

  init: function() {
    this.loading = false
  },

  onSearch: function(query) {
    console.log("onSearch", query)
    actions.search.started()
    
    fetch(`/api/search/${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(actions.search.completed)
      .catch(actions.search.failed)
  },

  onSearchStarted: function() {
    this.loading = true
  },

  onSearchCompleted: function(results) {
    console.log("onSearchCompleted", results)
    this.loading = false
  },

  onSearchFailed: function(err) {
    console.log("onSearchFailed", err)
    this.loading = false
  }
})
