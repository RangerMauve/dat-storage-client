const fetch = require('cross-fetch')

const PSA_LOCATION = '/.well-known/psa'
const ACCOUNTS_API_REL = 'https://archive.org/services/purl/purl/datprotocol/spec/pinning-service-account-api'
const DATS_API_REL = 'https://archive.org/services/purl/purl/datprotocol/spec/pinning-service-dats-api'

module.exports = class DatStorageClient {
  constructor (url, sessionToken) {
    this.url = url
    this.sessionToken = sessionToken || null
    this.PSA = null
  }

  // Pass in a username and password
  async login (opts) {
    const toFetch = await this._getAccountsPath('login')

    const { sessionToken } = await this._post(toFetch, opts)

    this.sessionToken = sessionToken

    return sessionToken
  }

  async logout (opts) {
    const toFetch = await this._getAccountsPath('logout')

    return this._post(toFetch, opts)
  }

  async account () {
    const toFetch = await this._getAccountsPath('account')

    return this._get(toFetch)
  }

  async list () {
    const toFetch = await this._getDatsPath('./')

    return this._get(toFetch)
  }

  // Include url, name, domains
  async add (opts) {
    const toFetch = await this._getDatsPath('add')

    return this._post(toFetch, opts)
  }

  // Include url
  async remove (opts) {
    const toFetch = await this._getDatsPath('remove')

    return this._post(toFetch, opts)
  }

  async get (key) {
    const toFetch = await this._getDatsPath(`item/${key}`)

    return this._get(toFetch)
  }

  // Opts can include name and domains
  async update (key, opts) {
    const toFetch = await this._getDatsPath(`item/${key}`)

    return this._post(toFetch, opts)
  }

  async _loadPSA () {
    if (this.PSA) return this.PSA

    const toFetch = new URL(PSA_LOCATION, this.url)

    const res = await fetch(toFetch.href)

    const json = await res.json()

    this.PSA = json

    return json
  }

  async _getHref (wantedRel) {
    const { links } = await this._loadPSA()

    const [{ href }] = links.filter(({ rel }) => rel === wantedRel)

    const fullURL = new URL(ensureIsDirectory(href), this.url)

    return fullURL.href
  }

  async _getAccountsPath (path) {
    const href = this._getHref(ACCOUNTS_API_REL)

    const url = new URL(path, href)

    return url.href
  }

  async _getDatsPath (path) {
    const href = this._getHref(DATS_API_REL)

    const url = new URL(path, href)

    return url.href
  }

  async _post (url, opts) {
    const method = 'POST'

    const headers = {
      'Content-Type': 'application/json'
    }

    const sessionToken = this.sessionToken

    if (sessionToken) {
      headers.authorization = `Bearer ${sessionToken}`
    }

    const body = JSON.stringify(opts)

    const res = await fetch(url, {
      method,
      headers,
      body
    })

    const resultData = await res.json()

    if (!res.ok) {
      throw new Error(resultData.message)
    }

    return resultData
  }

  async _get (url) {
    const method = 'GET'

    const headers = {}

    const sessionToken = this.sessionToken

    if (sessionToken) {
      headers.authorization = `Bearer ${sessionToken}`
    }

    const res = await fetch(url, {
      method,
      headers
    })

    return res.json()
  }
}

function ensureIsDirectory (url) {
  if (url.endsWith('/')) return url

  return url + '/'
}
