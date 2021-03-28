import { assert } from 'chai';
import * as gazelle from '../lib';
import * as fs from 'fs';
import * as path from 'path';

const gazelleConfigs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'etc', 'gazelle.json'), 'utf-8'));

const gazelleConfig = gazelleConfigs['orpheus'];

describe('Gazelle-client', function() {

  this.timeout(20000); // MusicBrainz has a rate limiter

  const redactedClient = new gazelle.GazelleClient(gazelleConfig.baseUrl, gazelleConfig.username, gazelleConfig.password);

  describe('action', () => {

    it('getIndex()', async () => {
      const index = await redactedClient.getIndex();
      assert.strictEqual(index.username, gazelleConfig.username);
    });

    it('getArtistById() ', async () => {
      assert.isDefined(gazelleConfig.artistId, 'gazelleConfig.artistId');

      const artistById = await redactedClient.getArtistById(gazelleConfig.artistId);
      assert.strictEqual(artistById.id, gazelleConfig.artistId, 'artist.id');
      assert.isDefined(artistById.name, 'artist.name');
    });

    it('getArtistByName()', async () => {
      assert.isDefined(gazelleConfig.artistId, 'gazelleConfig.artistId');

      const artistById = await redactedClient.getArtistById(gazelleConfig.artistId);
      assert.strictEqual(artistById.id, gazelleConfig.artistId, 'artist.id');
      assert.isDefined(artistById.name, 'artist.name');

      const artistByName = await redactedClient.getArtistByName(artistById.name);
      assert.strictEqual(artistByName.id, gazelleConfig.artistId, 'artist.id');
    });

    it('getTorrentById()', async () => {
      assert.isDefined(gazelleConfig.torrentId, 'gazelleConfig.torrentId)');
      const torrent = await redactedClient.getTorrentById(gazelleConfig.torrentId);
      assert.strictEqual(torrent.torrent.id, gazelleConfig.torrentId, '(torrent.torrent.id');
    });

  });

  it('getTorrent()', async () => {
    assert.isDefined(gazelleConfig.torrentId, 'gazelleConfig.torrentId)');
    const torrent = await redactedClient.getTorrent(gazelleConfig.torrentId);
    assert.isDefined(torrent.content, 'torrent.content');
  });

});
