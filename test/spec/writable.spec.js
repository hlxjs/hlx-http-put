const stream = require('stream');
const test = require('ava');
// const sinon = require('sinon');
const proxyquire = require('proxyquire');
const HLS = require('hls-parser');

const {Segment} = HLS.types;

let msn = 0;
let dsn = 0;

function createSegment(uri) {
  return new Segment({
    uri,
    data: new DummyReadable({}),
    mediaSequenceNumber: msn++,
    discontinuitySequence: dsn++
  });
}

class MockReadStream extends stream.Readable {
  constructor() {
    super({objectMode: true});
    this.consumed = false;
  }

  _read() {
    if (this.consumed) {
      return;
    }
    let data;
    data = HLS.parse(`
      #EXTM3U
      #EXT-X-STREAM-INF:BANDWIDTH=1280000,AVERAGE-BANDWIDTH=1000000,CODECS="avc1.640029,mp4a.40.2"
      http://example.com/low.m3u8
      #EXT-X-STREAM-INF:BANDWIDTH=2560000,AVERAGE-BANDWIDTH=2000000,CODECS="avc1.640029,mp4a.40.2"
      http://example.com/mid.m3u8
      #EXT-X-STREAM-INF:BANDWIDTH=7680000,AVERAGE-BANDWIDTH=6000000,CODECS="avc1.640029,mp4a.40.2"
      http://example.com/high.m3u8
    `);
    data.uri = 'http://example.com/master.m3u8';
    this.push(data);
    data = HLS.parse(`
      #EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-TARGETDURATION:10
      #EXTINF:9.009,
      http://media.example.com/low/01.ts
      #EXTINF:9.009,
      http://media.example.com/low/02.ts
      #EXTINF:3.003,
      http://media.example.com/low/03.ts
      #EXT-X-ENDLIST
    `);
    data.uri = 'http://example.com/low.m3u8';
    this.push(data);
    this.push(createSegment('http://media.example.com/low/01.ts'));
    this.push(createSegment('http://media.example.com/low/02.ts'));
    this.push(createSegment('http://media.example.com/low/03.ts'));
    data = HLS.parse(`
      #EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-TARGETDURATION:10
      #EXTINF:9.009,
      http://media.example.com/mid/01.ts
      #EXTINF:9.009,
      http://media.example.com/mid/02.ts
      #EXTINF:3.003,
      http://media.example.com/mid/03.ts
      #EXT-X-ENDLIST
    `);
    data.uri = 'http://example.com/mid.m3u8';
    this.push(data);
    this.push(createSegment('http://media.example.com/mid/01.ts'));
    this.push(createSegment('http://media.example.com/mid/02.ts'));
    this.push(createSegment('http://media.example.com/mid/03.ts'));
    data = HLS.parse(`
      #EXTM3U
      #EXT-X-VERSION:3
      #EXT-X-TARGETDURATION:10
      #EXTINF:9.009,
      http://media.example.com/high/01.ts
      #EXTINF:9.009,
      http://media.example.com/high/02.ts
      #EXTINF:3.003,
      http://media.example.com/high/03.ts
      #EXT-X-ENDLIST
    `);
    data.uri = 'http://example.com/high.m3u8';
    this.push(data);
    this.push(createSegment('http://media.example.com/high/01.ts'));
    this.push(createSegment('http://media.example.com/high/02.ts'));
    this.push(createSegment('http://media.example.com/high/03.ts'));
    this.push(null);
    this.consumed = true;
  }
}

class NullWriteStream extends stream.Writable {
  constructor() {
    super({objectMode: true});
  }

  _write(chunk, encoding, cb) {
    setImmediate(cb);
  }
}

class DummyReadable extends stream.Readable {
  constructor(data) {
    super({objectMode: true});
    this.data = data;
  }

  _read() {
    this.push(this.data);
    this.push(null);
  }
}

test.cb('writeStream', t => {
  const mockFetch = {
    fetch(url) {
      return Promise.resolve(url);
    }
  };

  const mockFs = {
    existsSync() {
      return false;
    }
  };

  delete require.cache[require.resolve('node-fetch')];
  const MockWriter = proxyquire('../../writer', {fs: mockFs, 'node-fetch': mockFetch.fetch});
  const WriteStream = proxyquire('../../writable', {'./writer': MockWriter});
  // const fetchSpy = sinon.spy(mockFetch, 'fetch');

  const src = new MockReadStream();
  const writer = new WriteStream({endpoint: 'https://foo.bar/dir'});
  const dest = new NullWriteStream();
  src.pipe(writer).pipe(dest)
  .on('finish', () => {
    // t.is(fetchSpy.callCount, 1);
    t.end();
  });
});
