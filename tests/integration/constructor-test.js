var test = require('tape')

var Account = require('../../index')

var store = require('humble-localstorage')

test('new Account(options)', function (t) {
  store.clear()
  var account = new Account({
    url: 'http://localhost:3000'
  })

  t.is(typeof account, 'object', 'Account is a constructor')
  t.ok(account.hasOwnProperty('username'), 'has account.username')
  t.is(account.username, undefined, 'account.username is undefined')
  t.is(typeof account.validate, 'function', 'has "validate()"')
  t.is(typeof account.fetch, 'function', 'has "fetch()"')
  t.is(typeof account.get, 'function', 'has "get()"')
  t.is(typeof account.isSignedIn, 'function', 'has "isSignedIn()"')
  t.is(typeof account.profile.fetch, 'function', 'has "profile.fetch()"')
  t.is(typeof account.profile.get, 'function', 'has "profile.get()"')
  t.is(typeof account.profile.update, 'function', 'has "profile.update()"')
  t.is(typeof account.signIn, 'function', 'has "signIn()"')
  t.is(typeof account.signOut, 'function', 'has "signOut()"')
  t.is(typeof account.signUp, 'function', 'has "signUp()"')
  t.is(typeof account.on, 'function', 'has "on()"')
  t.is(typeof account.one, 'function', 'has "one()"')
  t.is(typeof account.off, 'function', 'has "off()"')

  t.end()
})

test('Account(options) w/o new', function (t) {
  var account = Account({
    url: 'http://localhost:3000/session/account'
  })

  t.is(typeof account, 'object', 'Account is a constructor')

  t.end()
})

test('new Account() w/o options', function (t) {
  t.throws(Account, 'throws error')

  t.end()
})

test('new Account() w/o options.url', function (t) {
  t.throws(Account.bind(null, { validate: function () {} }), 'throws error')

  t.end()
})
