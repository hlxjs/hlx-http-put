const fs = require('fs');
const path = require('path');
const debug = require('debug');
const fetch = require('node-fetch');

const {getPathFromUrl, getPath, createUrl} = require('./util');

const print = debug('hlx-http-put');

class HttpPutWriter {
  constructor({endpoint, rootPath = getPathFromUrl(endpoint), agent}) {
    this.endpoint = endpoint;
    this.rootPath = rootPath;
    this.agent = agent;
    if (!path.isAbsolute(rootPath)) {
      rootPath = path.join('/', rootPath);
    }
    print(`HttpPutWriter#ctor: endpoint="${endpoint}", rootPath=${rootPath}`);
  }

  async writeData({uri, data, mimeType}) {
    const {endpoint, rootPath} = this;

    print(`writeData: Enter. uri="${uri}", rootPath="${rootPath}"`);

    if (!data) {
      return Promise.reject(new Error('No data'));
    }

    let remotePath;

    if (path.isAbsolute(uri)) {
      if (fs.existsSync(uri)) {
        remotePath = path.join(rootPath, path.basename(uri));
      } else {
        remotePath = path.join(rootPath, getPathFromUrl(uri));
      }
    } else {
      remotePath = path.join(rootPath, getPath(uri));
    }

    const url = createUrl(remotePath, endpoint).href;

    print(`[PUT] ${url}`);

    return fetch(url, {
      method: 'PUT',
      body: data,
      headers: {'Content-Type': mimeType},
      agent: this.agent
    })
    .then(() => url);
  }
}

module.exports = HttpPutWriter;
