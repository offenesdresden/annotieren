import Reflux from 'reflux'

export let actions = Reflux.createActions({
  createAnnotation: { asyncResult: true },
  updateAnnotation: { asyncResult: true },
  removeAnnotation: { asyncResult: true }
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

  onCreateAnnotation: function(fileId, annotation) {
    console.log("onCreate", annotation)
    
    fetch(`/api/file/${fileId}/annotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(annotation)
    })
      .then(res => {
        if (res.status < 200 || res.status >= 300) {
          throw new Error(`HTTP status ${res.status} ${res.statusText}`)
        }

        return res
      })
      .then(res => res.json())
      .then(json => {
        console.log("addAnnotation response:", json)
        actions.createAnnotation.completed(json.id)
      })
      .catch(actions.createAnnotation.failed)
  },

  onUpdateAnnotation: function(fileId, annotation) {
    console.log("onUpdate", annotation)
    
    fetch(`/api/file/${fileId}/annotations/${annotation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(annotation)
    })
      .then(res => {
        if (res.status < 200 || res.status >= 300) {
          throw new Error(`HTTP status ${res.status} ${res.statusText}`)
        }

        return res
      })
      .then(res => {
        actions.updateAnnotation.completed()
      })
      .catch(actions.updateAnnotation.failed)
  },

  onRemoveAnnotation: function(fileId, annotation) {
    console.log("onRemove", annotation)
    
    fetch(`/api/file/${fileId}/annotations/${annotation.id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (res.status < 200 || res.status >= 300) {
          throw new Error(`HTTP status ${res.status} ${res.statusText}`)
        }

        return res
      })
      .then(res => {
        actions.removeAnnotation.completed()
      })
      .catch(actions.removeAnnotation.failed)
  },
})
