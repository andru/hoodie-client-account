var simple = require('simple-mock')
var test = require('tape')

var find = require('../../admin/lib/accounts/find')

test('acconuntsFind', function (t) {
  t.plan(3)

  var state = {
    url: 'http://localhost:3000',
    session: {
      id: 'sessionId123'
    }
  }
  var options = {
    foo: 'bar'
  }

  simple.mock(find.internals, 'request').resolveWith({
    body: 'response body'
  })
  simple.mock(find.internals, 'deserialise').returnWith('deserialise accounts')

  find(state, 'abc1234', options)

  .then(function (accounts) {
    t.deepEqual(find.internals.request.lastCall.arg, {
      method: 'GET',
      url: 'http://localhost:3000/accounts/abc1234',
      headers: {
        authorization: 'Bearer sessionId123'
      }
    })
    t.deepEqual(find.internals.deserialise.lastCall.args, [
      'response body',
      options
    ])

    t.is(accounts, 'deserialise accounts', 'resolves with accounts')
  })

  .catch(t.error)
})
