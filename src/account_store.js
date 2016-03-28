import Reflux from 'reflux'

export let actions = Reflux.createActions({
  refreshLogin: { asyncResult: true },
  login: { asyncResult: true },
  logout: { asyncResult: true },
  register: { asyncResult: true }
})

export default Reflux.createStore({
  listenables: actions,

  init: function() {
    actions.refreshLogin()
  },

  onRefreshLogin: function() {
    fetch("/api/login", {
      credentials: 'same-origin'
    })
      .then(res => res.json())
      .then(json => {
        this.username = json.username
        actions.refreshLogin.completed(json.username)
      })
      .catch(e => {
        delete this.username
        actions.refreshLogin.failed(e)
      })
  },

  onLogin: function(username, password) {
    fetch("/api/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password
      }),
      credentials: 'same-origin'
    })
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          actions.login.failed(new Error(json.error))
        } else {
          this.username = json.username
          actions.login.completed(this.username)
          actions.refreshLogin.completed(this.username)
        }
      })
      .catch(e => {
        actions.login.failed(e)
      })
  },

  onLogout: function() {
    fetch("/api/logout", {
      method: 'POST',
      credentials: 'same-origin'
    })
      .then(res => actions.logout.completed())
      .catch(e => actions.logout.failed(e))
  },

  onRegister: function(username, password) {
    fetch("/api/register", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password
      }),
      credentials: 'same-origin'
    })
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          actions.register.failed(new Error(json.error))
        } else {
          this.username = json.username
          actions.register.completed(this.username)
          actions.refreshLogin.completed(this.username)
        }
      })
      .catch(e => {
        actions.register.failed(new Error(e))
      })
  }
})
