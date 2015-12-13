module.exports = Account

var EventEmitter = require('events').EventEmitter

var getUsername = require('./lib/username')
var events = require('./lib/events')

var getSession = require('./utils/get-session')

function Account (options) {
  if (!(this instanceof Account)) {
    return new Account(options)
  }

  if (!options) {
    options = {}
  }

  if (!options.url) {
    throw new Error('options.url is required')
  }

  var cacheKey = options.cacheKey || '_session'
  var state = {
    cacheKey: cacheKey,
    emitter: options.emitter || new EventEmitter(),
    session: getSession({cacheKey: cacheKey}),
    url: options.url,
    validate: options.validate || function () {}
  }

  return {
    get username () {
      return getUsername(state)
    },
    signUp: require('./lib/sign-up').bind(this, state),
    signIn: require('./lib/sign-in').bind(this, state),
    signOut: require('./lib/sign-out').bind(this, state),
    isSignedIn: require('./lib/is-signed-in').bind(this, state),
    get: require('./lib/get').bind(this, state),
    fetch: require('./lib/fetch').bind(this, state, 'account'),
    profile: {
      get: require('./lib/profile-get').bind(this, state),
      fetch: require('./lib/fetch').bind(this, state, 'account.profile'),
      update: require('./lib/update-profile').bind(this, state)
    },
    on: events.on.bind(this, state),
    one: events.one.bind(this, state),
    off: events.off.bind(this, state),
    validate: require('./lib/validate').bind(this, state)
  }
}
