var test = require('tape')

var isSignedIn = require('../../lib/is-signed-in')

test('isSignedIn without session', function (t) {
  t.is(isSignedIn({}), false, 'returns false')

  t.end()
})

test('isSignedIn with session', function (t) {
  t.is(isSignedIn({
    session: {}
  }), true, 'returns true')

  t.end()
})
