const test = require('ava');
// const sinon = require('sinon');
const proxyquire = require('proxyquire');

test('writer.writeData', async t => {
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
  // const fetchSpy = sinon.spy(mockFetch, 'fetch');

  try {
    const writer = new MockWriter({endpoint: 'https://foo.bar/dir'});
    const destPath = await writer.writeData({uri: 'abc.mp4', data: Buffer.alloc(10), mimeType: 'video/mp4'});
    t.is(destPath, 'https://foo.bar/dir/abc.mp4');
    // t.is(fetchSpy.callCount, 1);
  } catch (err) {
    t.fail(err.stack);
  }
});
