[![Build Status](https://travis-ci.org/hlxjs/hlx-http-put.svg?branch=master)](https://travis-ci.org/hlxjs/hlx-http-put)
[![Coverage Status](https://coveralls.io/repos/github/hlxjs/hlx-http-put/badge.svg?branch=master)](https://coveralls.io/github/hlxjs/hlx-http-put?branch=master)
[![Dependency Status](https://david-dm.org/hlxjs/hlx-http-put.svg)](https://david-dm.org/hlxjs/hlx-http-put)
[![Development Dependency Status](https://david-dm.org/hlxjs/hlx-http-put/dev-status.svg)](https://david-dm.org/hlxjs/hlx-http-put#info=devDependencies)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

# hlx-http-put
A writable stream to send HLS streams to an external HTTP/HTTPS server

## Features
* Being used with other [`hlx`](https://github.com/hlxjs) objects, it provides a functionality to send every HLS related files (playlist and segments) to an external HTTP/HTTPS endpoint.

## Install
[![NPM](https://nodei.co/npm/hlx-http-put.png?mini=true)](https://nodei.co/npm/hlx-http-put/)

## Usage

```js
const hlx = require('hlx');
const {createWriteStream} = require('hlx-http-put');

const writable = createWriteStream({
  endpoint: 'http://foo.bar/input'
});

// Send files to the remote endpoint
hlx.src('http://example.com/master.m3u8')
.pipe(decryptor)
.pipe(hlx.dest(writable))
.on('error', err => {
  console.log(err.stack);
});
```
## API
The features are built on top of the Node's [transform streams](https://nodejs.org/api/stream.html#stream_class_stream_transform).

### `createWriteStream(options)`
Creates a new `TransformStream` object.

#### params
| Name    | Type   | Required | Default | Description   |
| ------- | ------ | -------- | ------- | ------------- |
| options | object | Yes       | N/A      | See below     |

#### options
| Name        | Type   | Default | Description                       |
| ----------- | ------ | ------- | --------------------------------- |
| endpoint | string | N/A     | URL of the destination (webdav server endpoint) |
| rootPath | string | The path included in `url` | Will be used when the playlist contains relative urls |


#### return value
An instance of `TransformStream`.
