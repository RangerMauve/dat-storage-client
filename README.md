# dat-storage-client
A fetch-based API for interacting with dat storage providers

Uses [cross-fetch](https://www.npmjs.com/package/cross-fetch) for HTTP requests, so it should work in many environments. Based on [DEP-0003](https://github.com/datprotocol/DEPs/blob/master/proposals/0003-http-pinning-service-api.md).

```
npm i -s dat-storage-client
```

## Usage

```js
const DatStorageClient = require('dat-storage-client')

const SERVICE_URL = 'https://hashbase.io'

const client = new DatStorageClient(SERVICE_URL)

await client.login(username, password)

await client.add({
  url: 'dat://60c525b5589a5099aa3610a8ee550dcd454c3e118f7ac93b7d41b6b850272330'
})

const dats = await client.list()
```

## API

### `const client = new DatStorageClient(url, sessionToken)`

Initialize a new client (scoped to a given provider).

The `url` is the root URL of your storage provider (e.g. `https://hashbase.io`).

You can optionally pass in a `sessionToken` if you've saved one from a previous session.

### `client.sessionToken`

Get the current session token. Will be set to `null` if not logged in. This session token will get sent as part of every request in the `authorization` header as a Bearer Token.

### `client.url`

Get the URL of the storage provider for this client

### `const {sessionToken} = await client.login({username, password})`

[Login](https://github.com/datprotocol/DEPs/blob/master/proposals/0003-http-pinning-service-api.md#post-login) to the storage provider using your username and password. This will save your `sessionToken` to the client so that it will be used in subsequent requests.
You can save the `sessionToken` somewhere to use with the client and reduce login attempts.

### `await client.logout()`

[Logout](https://github.com/datprotocol/DEPs/blob/master/proposals/0003-http-pinning-service-api.md#post-logout) of the storage provider. You need to be logged in first.

### `const {username, email} = await client.account()`

Get the info about the [account](https://github.com/datprotocol/DEPs/blob/master/proposals/0003-http-pinning-service-api.md#get-account) that's currently logged in.

### `const {items} = await client.list()`

List the [items](https://github.com/datprotocol/DEPs/blob/master/proposals/0003-http-pinning-service-api.md#get-) that have been added to this storage provider. The items include a `name`, `url`, `title`, `description` and a list of `additionalUrls` that it can be accessed at. You must be logged in for this to work.

### `await client.add({url, name, domains})`

[Add](https://github.com/datprotocol/DEPs/blob/master/proposals/0003-http-pinning-service-api.md#post-add) an archive to the storage provider. Only the `url` is required. You must be logged in for this to work.

### `await client.remove({url})`

[Remove](https://github.com/datprotocol/DEPs/blob/master/proposals/0003-http-pinning-service-api.md#post-remove) an archive from the storage provider. You must be logged in for this to work.

### `const {url, name, title, description} = await client.get(key)`

[Get information](https://github.com/datprotocol/DEPs/blob/master/proposals/0003-http-pinning-service-api.md#get-itemkey) about a given archive. The `key` must be the contents of the key for that archive. E.g. `60c525b5589a5099aa3610a8ee550dcd454c3e118f7ac93b7d41b6b850272330`. You must be logged in for this to work.

### `await client.update(key, {name, domains})`

[Update information](https://github.com/datprotocol/DEPs/blob/master/proposals/0003-http-pinning-service-api.md#post-itemkey) for a given archive. You must be logged in for this to work.
