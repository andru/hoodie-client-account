# hoodie-client-account

> Account client for the browser

[![Build Status](https://travis-ci.org/hoodiehq/hoodie-client-account.svg?branch=master)](https://travis-ci.org/hoodiehq/hoodie-client-account)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/hoodie-client-account/badge.svg?branch=master)](https://coveralls.io/r/hoodiehq/hoodie-client-account?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/hoodie-client-account.svg)](https://david-dm.org/hoodiehq/hoodie-client-account)
[![devDependency Status](https://david-dm.org/hoodiehq/hoodie-client-account/dev-status.svg)](https://david-dm.org/hoodiehq/hoodie-client-account#info=devDependencies)

`hoodie-client-account` is a JavaScript front-end client for
the [Account JSON API](http://docs.accountjsonapi.apiary.io).
It persists session information in localStorage and provides
front-end friendly APIs for things like creating a user account,
confirming, resetting a password, changing profile information,
or closing the account.

There is also an [admin-specific account client](admin)

## Example

```js
// Account loaded via <script> or require('hoodie-client-account')
var account = new Account('https://example.com/account/api')

if (account.isSignedIn()) {
  renderWelcome(account)
}

account.on('signout', redirectToHome)
```

## API

- [Constructor](#constructor)
- [account.username](#accountusername)
- [account.validate](#accountvalidate)
- [account.signUp](#accountsignup)
- [account.signIn](#accountsignin)
- [account.signOut](#accountsignout)
- [account.get](#accountget)
- [account.fetch](#accountfetch)
- [account.profile.get](#accountprofileget)
- [account.profile.fetch](#accountprofilefetch)
- [account.profile.update](#accountprofileupdate)
- [account.request](#accountrequest)
- [account.on](#accounton)
- [account.one](#accountone)
- [account.off](#accountoff)
- [Events](#events)
- [Requests](#requests)

### Constructor

```js
new Account({
  // required. Path or full URL to root location of the account JSON API
  url: '/api',
  // name of localStorage key where to persist the session state.
  // Defaults to "_session"
  cacheKey: 'myapp.session',
  // function to validate account details
  // defaults to return true
  validate: function (options) {
    // "this" is the new Account
    // "options" is an object with "username", "password", and "profile" properties
  }
})
```

### account.username

_Read-only_. Returns the username if signed in, otherwise `undefined`.

### account.validate

Calls the function passed into the Constructor.
Returns a Promise that resolves to `true` by default

```js
account.validate(options)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>options.username</code></th>
    <td>String</td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left"><code>options.password</code></th>
    <td>String</td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left"><code>options.profile</code></th>
    <td>Object</td>
    <td>No</td>
  </tr>
</table>

Resolves with an argument.

Rejects with any errors thrown by the function originally passed into the Constructor.

Example

```js
var account = new Account({
  url: '/api',
  cacheKey: 'app.session',
  validate: function (options) {
    if (options.password.length < 8) {
      throw new Error('password should contain at least 8 characters')
    }
  }
})

account.validate({
  username: 'DocsChicken',
  password: 'secret'
})

.then(function () {
  console.log('Successfully validated!')
})

.catch(function (error) {
  console.log(error) // should be an error about the password being too short
})
```

### account.isSignedIn

Returns `true` if user is currently signed in, otherwise `false`.

```js
account.isSignedIn()
```

### account.signUp

Creates a new user account on the Hoodie server. Does _not_ sign in the user automatically, [account.signIn](#accountsignin) must be called separately.

```js
account.signUp(accountProperties)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>accountProperties.username</code></th>
    <td>String</td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>accountProperties.password</code></th>
    <td>String</td>
    <td>Yes</td>
  </tr>
</table>

Resolves with `accountProperties`:

```json
{
  "id": "account123",
  "username": "pat",
  "createdAt": "2016-01-01T00:00.000Z",
  "updatedAt": "2016-01-01T00:00.000Z"
}
```

Rejects with:

<table>
  <tr>
    <th align="left"><code>InvalidError</code></th>
    <td>Username must be set</td>
  </tr>
  <tr>
    <th align="left"><code>SessionError</code></th>
    <td>Must sign out first</td>
  </tr>
  <tr>
    <th align="left"><code>ConflictError</code></th>
    <td>Username <strong>&lt;username&gt;</strong> already exists</td>
  </tr>
  <tr>
    <th align="left"><code>ConnectionError</code></th>
    <td>Could not connect to server</td>
  </tr>
</table>

Example

```js
account.signUp({
  username: 'pat',
  password: 'secret'
}).then(function (accountProperties) {
  alert('Account created for ' + accountProperties.username)
}).catch(function (error) {
  alert(error)
})
```

---

🐕 **Implement account.signUp with profile: {...} option**: [#11](https://github.com/hoodiehq/hoodie-client-account/issues/11)

---

### account.signIn

Creates a user session

```js
account.signIn(options)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>options.username</code></th>
    <td>String</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>options.password</code></th>
    <td>String</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
</table>

Resolves with `sessionProperties`:

```json
{
  "id": "session123",
  "account": {
    "id": "account123",
    "username": "pat",
    "createdAt": "2016-01-01T00:00.000Z",
    "updatedAt": "2016-01-02T00:00.000Z",
    "profile": {
      "fullname": "Dr. Pat Hook"
    }
  }
}
```

Rejects with:

<table>
  <tr>
    <th align="left"><code>UnconfirmedError</code></th>
    <td>Account has not been confirmed yet</td>
  </tr>
  <tr>
    <th align="left"><code>UnauthorizedError</code></th>
    <td>Invalid Credentials</td>
  </tr>
  <tr>
    <th align="left"><code>Error</code></th>
    <td><em>A custom error set on the account object, e.g. the account could be blocked due to missing payments</em></td>
  </tr>
  <tr>
    <th align="left"><code>ConnectionError</code></th>
    <td>Could not connect to server</td>
  </tr>
</table>

Example

```js
account.signIn({
  username: 'pat',
  password: 'secret'
}).then(function (sessionProperties) {
  alert('Ohaj, ' + sessionProperties.account.username)
}).catch(function (error) {
  alert(error)
})
```

### account.signOut

Deletes the user’s session

```js
account.signOut()
```

Resolves with `sessionProperties` like [account.signin](#accountsignin),
but without the session id:

```json
{
  "account": {
    "id": "account123",
    "username": "pat",
    "createdAt": "2016-01-01T00:00.000Z",
    "updatedAt": "2016-01-02T00:00.000Z",
    "profile": {
      "fullname": "Dr. Pat Hook"
    }
  }
}
```

Rejects with:

<table>
  <tr>
    <th align="left"><code>Error</code></th>
    <td><em>A custom error thrown in a <code>before:signout</code> hook</em></td>
  </tr>
</table>

Example

```js
account.signOut().then(function (sessionProperties) {
  alert('Bye, ' + sessionProperties.account.username)
}).catch(function (error) {
  alert(error)
})
```

### account.get

Returns account properties from local cache.

```js
account.get(properties)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>properties</code></th>
    <td>String or Array of strings</td>
    <td>
      When String, only this property gets returned. If array of strings,
      only passed properties get returned
    </td>
    <td>No</td>
  </tr>
</table>

Returns object with account properties, or `undefined` if not signed in.

Examples

```js
var properties = account.get()
alert('You signed up at ' + properties.createdAt)
var createdAt = account.get('createdAt')
alert('You signed up at ' + createdAt)
var properties = account.get(['createdAt', 'updatedAt'])
alert('You signed up at ' + properties.createdAt)
```

### account.fetch

Fetches account properties from server.

```js
account.fetch(properties)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>properties</code></th>
    <td>String or Array of strings</td>
    <td>
      When String, only this property gets returned. If array of strings,
      only passed properties get returned. Property names can have `.` separators
      to return nested properties.
    </td>
    <td>No</td>
  </tr>
</table>

Resolves with `accountProperties`:

```json
{
  "id": "account123",
  "username": "pat",
  "createdAt": "2016-01-01T00:00.000Z",
  "updatedAt": "2016-01-02T00:00.000Z"
}
```

Rejects with:

<table>
  <tr>
    <th align="left"><code>UnauthenticatedError</code></th>
    <td>Session is invalid</td>
  </tr>
  <tr>
    <th align="left"><code>ConnectionError</code></th>
    <td>Could not connect to server</td>
  </tr>
</table>

Examples

```js
account.fetch().then(function (properties) {
  alert('You signed up at ' + properties.createdAt)
})
account.fetch('createdAt').then(function (createdAt) {
  alert('You signed up at ' + createdAt)
})
account.fetch(['createdAt', 'updatedAt']).then(function (properties) {
  alert('You signed up at ' + properties.createdAt)
})
```

### account.profile.get

```js
account.profile.get()
```

Returns profile properties from local cache.

```js
account.profile.get(properties)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>properties</code></th>
    <td>String or Array of strings</td>
    <td>
      When String, only this property gets returned. If array of strings,
      only passed properties get returned. Property names can have `.` separators
      to return nested properties.
    </td>
    <td>No</td>
  </tr>
</table>

Returns object with profile properties, or `undefined` if not signed in.

Examples

```js
var properties = account.profile.get()
alert('Hey there ' + properties.fullname)
var fullname = account.profile.get('fullname')
alert('Hey there ' + fullname)
var properties = account.profile.get(['fullname', 'address.city'])
alert('Hey there ' + properties.fullname + '. How is ' + properties.address.city + '?')
```

### account.profile.fetch

Fetches profile properties from server.

```js
account.profile.fetch(options)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>properties</code></th>
    <td>String or Array of strings</td>
    <td>
      When String, only this property gets returned. If array of strings,
      only passed properties get returned. Property names can have `.` separators
      to return nested properties.
    </td>
    <td>No</td>
  </tr>
</table>

Resolves with `profileProperties`:

```json
{
  "id": "account123-profile",
  "fullname": "Dr Pat Hook",
  "address": {
    "city": "Berlin",
    "street": "Adalberststraße 4a"
  }
}
```

Rejects with:

<table>
  <tr>
    <th align="left"><code>UnauthenticatedError</code></th>
    <td>Session is invalid</td>
  </tr>
  <tr>
    <th align="left"><code>ConnectionError</code></th>
    <td>Could not connect to server</td>
  </tr>
</table>

Examples

```js
account.fetch().then(function (properties) {
  alert('Hey there ' + properties.fullname)
})
account.fetch('fullname').then(function (createdAt) {
  alert('Hey there ' + fullname)
})
account.fetch(['fullname', 'address.city']).then(function (properties) {
  alert('Hey there ' + properties.fullname + '. How is ' + properties.address.city + '?')
})
```

### account.profile.update

Update profile properties on server and local cache

```js
account.profile.update(changedProperties)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>changedProperties</code></th>
    <td>Object</td>
    <td>
      Object of properties & values that changed.
      Other properties remain unchanged.
    </td>
    <td>No</td>
  </tr>
</table>

Resolves with `profileProperties`:

```json
{
  "id": "account123-profile",
  "fullname": "Dr Pat Hook",
  "address": {
    "city": "Berlin",
    "street": "Adalberststraße 4a"
  }
}
```

Rejects with:

<table>
  <tr>
    <th align="left"><code>UnauthenticatedError</code></th>
    <td>Session is invalid</td>
  </tr>
  <tr>
    <th align="left"><code>InvalidError</code></th>
    <td><em>Custom validation error</em></td>
  </tr>
  <tr>
    <th align="left"><code>ConnectionError</code></th>
    <td>Could not connect to server</td>
  </tr>
</table>

Example

```js
account.profile.update({fullname: 'Prof Pat Hook'}).then(function (properties) {
  alert('Congratulations, ' + properties.fullname)
})
```

### account.request

Sends a custom request to the server, for things like password resets,
account upgrades, etc.

```js
account.request(properties)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>properties.type</code></th>
    <td>String</td>
    <td>
      Name of the request type, e.g. "passwordreset"
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>properties</code></th>
    <td>Object</td>
    <td>
      Additional properties for the request
    </td>
    <td>No</td>
  </tr>
</table>

Resolves with `requestProperties`:

```json
{
  "id": "request123",
  "type": "passwordreset",
  "contact": "pat@example.com",
  "createdAt": "2016-01-01T00:00.000Z",
  "updatedAt": "2016-01-01T00:00.000Z"
}
```

Rejects with:

<table>
  <tr>
    <th align="left"><code>ConnectionError</code></th>
    <td>Could not connect to server</td>
  </tr>
  <tr>
    <th align="left"><code>NotFoundError</code></th>
    <td>Handler missing for "passwordreset"</td>
  </tr>
  <tr>
    <th align="left"><code>InvalidError</code></th>
    <td><em>Custom validation error</em></td>
  </tr>
</table>

Example

```js
account.request({type: 'passwordreset', contact: 'pat@example.com'}).then(function (properties) {
  alert('A password reset link was sent to ' + properties.contact)
})
```


### account.on

```js
account.on(event, handler)
```

Example

```js
account.on('signin', function (accountProperties) {
  alert('Hello there, ' + accountProperties.username)
})
```

### account.one

Call function once at given account event.

```js
account.one(event, handler)
```

Example

```js
account.on('signin', function (accountProperties) {
  alert('Hello there, ' + accountProperties.username)
})
```

### account.off

Removes event handler that has been added before

```js
account.off(event, handler)
```

Example

```js
hoodie.off('connectionstatus:disconnected', showNotification)
```

### Events

<table>
  <tr>
    <th align="left"><code>signup</code></th>
    <td>New user account created successfully</td>
  </tr>
  <tr>
    <th align="left"><code>signin</code></th>
    <td>Successfully signed in to an account</td>
  </tr>
  <tr>
    <th align="left"><code>signout</code></th>
    <td>Successfully signed out</td>
  </tr>
  <tr>
    <th align="left"><code>passwordreset</code></th>
    <td>Email with password reset token sent</td>
  </tr>
  <tr>
    <th align="left"><code>unauthenticate</code></th>
    <td>
      Server responded with "unauthenticated" when checking session<br>
      🐕 <strong>TO BE DONE</strong> <a href="https://github.com/hoodiehq/hoodie-client-account/issues/35">#35</a>
      </td>
  </tr>
  <tr>
    <th align="left"><code>reauthenticate</code></th>
    <td>
      Successfully signed in after "unauthenticated" state<br>
      🐕 <strong>TO BE DONE</strong> <a href="https://github.com/hoodiehq/hoodie-client-account/issues/35">#35</a>
      </td>
  </tr>
</table>


### Requests

Hoodie comes with a list of built-in account requests, which can be disabled,
overwritten or extended in [hoodie-server-account](https://github.com/hoodiehq/hoodie-server-account/tree/master/plugin#optionsrequests)

When a request succeeds, an event with the same name as the request type gets
emitted. For example, `account.request({type: 'passwordreset', contact: 'pat@example.com')`
triggers a `passwordreset` event, with the `requestProperties` passed as argument.

<table>
  <tr>
    <th align="left"><code>passwordreset</code></th>
    <td>Request a password reset token</td>
  </tr>
</table>

## Testing

In Node.js

Run all tests and validate JavaScript Code Style using [standard](https://www.npmjs.com/package/standard)

```
npm test
```

To run only the tests

```
npm run test:node
```

## Contributing

Have a look at the Hoodie project's [contribution guidelines](https://github.com/hoodiehq/hoodie/blob/master/CONTRIBUTING.md).
If you want to hang out you can join our [Hoodie Community Chat](http://hood.ie/chat/).

## License

Appache 2.0
