[![Node.js CI](https://github.com/Borewit/gazelle-client/actions/workflows/nodejs-ci.yml/badge.svg)](https://github.com/Borewit/gazelle-client/actions/workflows/nodejs-ci.yml)
[![NPM version](https://img.shields.io/npm/v/gazelle-client.svg)](https://npmjs.org/package/gazelle-client)
[![npm downloads](http://img.shields.io/npm/dm/gazelle-client.svg)](https://npmcharts.com/compare/gazelle-client?start=600)
[![DeepScan grade](https://deepscan.io/api/teams/5165/projects/16447/branches/352940/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5165&pid=16447&bid=352940)

# gazelle-client

Simple, idiomatic access to the API features of Gazelle.

## Overview

Gazelle provides a JSON API to registered users. This library aims to maintain
coverage of all features within a reasonable timeframe and provide an easy to
use and obvious surface.

## Installation

```shell script
npm install gazelle-client
```

```shell script
yarn add gazelle-client
```

### Example

```js
const gazelle = require('gazelle-client');

const client = new gazelle.GazelleClient('https://what.cd', 'username', 'password');

(async () => {

  try {
    const data = await client.index();
    console.log(data);
  } catch(error) {
    console.error(error.message);
  } 
})();
```

## API

### constructor
```ts
GazelleClient(baseUrl: string, username: string, password: string, options?: IOptions)
```

| argument   | Description                                                |
|------------|------------------------------------------------------------|
| `baseUrl`  | Gazelle base URL, e.g. `https://what.cd/`                  |
| `username` | Gazelle username                                           |
| `password` | Gazelle password                                           |
| `options`  | [Got options](https://github.com/sindresorhus/got#options) |                                  |


### `getIndex()`
```ts
async function async getIndex(): Promise<IIndex>
```

Gazelle API documentation: https://github.com/WhatCD/Gazelle/wiki/JSON-API-Documentation#index

### `getArtistById()`
```ts
async function getArtistById(id: number, name?, onlyAsMain?: boolean): Promise<IArtist>
```

| argument     | Description                                                     |
|--------------|-----------------------------------------------------------------|
| `id`         | Artist's id                                                     |
| `onlyAsMain` | If set, only include groups where the artist is the main artist |                    |

Gazelle API documentation: https://github.com/WhatCD/Gazelle/wiki/JSON-API-Documentation#artist

### `getArtistByName()`
```ts
async function getArtistByName(name: string, onlyAsMain?: boolean): Promise<IArtist>
```

| argument     | Description                                                     |
|--------------|-----------------------------------------------------------------|
| `name`       | Artist's Name                                                   |
| `onlyAsMain` | If set, only include groups where the artist is the main artist |                    |

Gazelle API documentation: https://github.com/WhatCD/Gazelle/wiki/JSON-API-Documentation#artist


### `getTorrentInfoById()`
Download torrent with torrentId.
```ts
async function getTorrentInfoById(torrentId: number): Promise<IAttachment>
```

### `getTorrentInfoByHash()`
```ts
async function getTorrentInfoByHash(torrentHash: string): Promise<ITorrentAndGroupInfo> 
```

### `action()`
```ts
function action<T>(action: string, args: any): Promise<T>
```

Low level API call.

where _action_ is one of:
* `announcements`
* `artist`
* `bookmarks`
* `bookmarks_artists`
* `bookmarks_torrents`
* `browse`
* `forum_main`
* `forum_viewforum`
* `forum_viewthread`
* `inbox`
* `inbox_inbox`
* `inbox_sentbox`
* `inbox_viewconv`
* `index`
* `notifications`
* `request`
* `requests`
* `similar_artists`
* `subscriptions`
* `top10`
* `top10_tags`
* `top10_torrents`
* `top10_users`
* `torrent`
* `torrentgroup`
* `user`
* `usersearch`

## License
(The MIT License)

Copyright (c) 2021 Borewit

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


