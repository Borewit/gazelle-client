import got, { Options, Response } from 'got';
import * as tough from 'tough-cookie';
import { promisify } from "util";

export interface IApiRequest {
  /**
   * e.g.: index, user, inbox
   */
  action: string,
  hash?: string
}

export interface IOptions {
  /**
   * Pass shared cookie store
   */
  request?: Options
}

export interface IAttachment {
  filename: string,
  content: Uint8Array
}

/**
 * ToDo: check this
 */
export enum ArtistRelationType {
  main = 0,
  remixedBy = 1
}

export interface IRequest {
  requestId: number,
  requestorId: number,
  requestorName: string,
  timeAdded: string, // time-stamp
  lastVote: string, // time-stamp
  voteCount: number,
  bounty: number,
  categoryId: number,
  categoryName: string,
  artists: IArtist[][],
  title: string,
  year: number,
  image: string, // url
  description: string,
  recordLabel: string,
  catalogueNumber: string,
  releaseType: string,
  bitrateList: string,
  formatList: string,
  mediaList: string,
  logCue: string,
  isFilled: boolean,
  /**
   * 0 if undefined
   */
  fillerId: number,
  /**
   * empty if undefined
   */
  fillerName: '',
  /**
   * 0 if undefined
   */
  torrentId: number,
  /**
   * empty if undefined
   */
  timeFilled: string,
}

export interface IArtist {
  id: number,
  aliasid: number,
  name: string
}

export interface IGazelleSearchResult {
  currentPage: number,
  pages: number,
  results: IReleaseGroup[]
}

export interface ITorrentGroupInfo {
  id: number,
  wikiBody: string,
  wikiImage: string,
  name: string,
  year: number,
  recordLabel: string,
  catalogueNumber: string,
  releaseType: number,
  categoryId: number,
  categoryName: string,
  time: string,
  vanityHouse: false,
  isBookmarked: false,
  musicInfo: {
    composers: IArtist[],
    dj: IArtist[],
    artists: IArtist[],
    with: IArtist[],
    conductor: IArtist[],
    remixedBy: IArtist[],
    producer: IArtist[]
  },
  tags: string[]
}

export interface ITorrentInfo {
  id: 734960,
  /**
   * Torrent info-hash upper case hexadecimals
   */
  infoHash: string,
  media: string,
  format: string,
  encoding: string,
  remastered: boolean,
  remasterYear: number,
  remasterTitle: string,
  remasterRecordLabel: string,
  remasterCatalogueNumber: string,
  scene: boolean,
  hasLog: boolean,
  hasCue: boolean,
  logScore: number,
  fileCount: number,
  size: number,
  seeders: number,
  leechers: number,
  snatched: number,
  freeTorrent: boolean,
  reported: boolean,
  time: string,
  description: string,
  fileList: string,
  filePath: string,
  userId: number,
  username: string
}

export interface ITorrentAndGroupInfo {
  group: ITorrentInfo,
  torrent: ITorrentGroupInfo
}

export interface IReleaseGroup {
  artist: string,
  bookmarked: false,
  cover: string,
  groupId: number,
  groupName: string,
  maxSize: number,
  releaseType: string,
  tags: string[],
  torrents: IGazelleTorrent[],
  totalLeeechers: number,
  totalSeeders: number,
  totalSnatches: number,
  vanityHouse: boolean
}

export interface IGazelleTorrent {
  artists: IArtist[],
  canUseToken: boolean,
  editionId: number,
  encoding: string,
  fileCount: number,
  format: string,
  hasCue: boolean,
  hasLog: boolean,
  hasSnatched: boolean,
  isFreeLeech: boolean,
  isNeutralLeech: boolean,
  isPersonalFreeleech: boolean,
  leechers: number,
  logScore: number,
  media: string,
  remasterCatalogueNumber: string,
  remasterTitle: string,
  remasterYear: number,
  remastered: boolean,
  scene: boolean,
  seeders: number,
  size: number,
  snatches: number,
  time: string, // ToDo: date-time
  torrentId: number,
  vanityHouse: boolean
}
export interface INotifications {
  messages: number;
  notification: number;
  newAnnouncement: boolean;
  newBlog: boolean;
}

export interface IUserStats {
  uploaded: number;
  downloaded: number;
  ratio: number;
  requiredratio: number;
  class: string;
}

export interface IIndex {
  username: string;
  id: number;
  authkey: string;
  passkey: string;
  notifications: INotifications;
  userstats: IUserStats;
}

export interface ISearchArguments {

  /**
   * string to search for
   */
  searchstr: string,
  /**
   * page to display (default: 1)
   */
  page?: number,

  taglist?: string[],
  tags_type?: string,
  order_by?: string,
  order_way?: string,
  filter_cat?: string,
  freetorrent?: boolean,
  vanityhouse?: boolean,
  scene?: string,
  haslog?: boolean,
  releasetype?: string,
  media?: string,
  format?: string,
  encoding?: string,
  artistname?: string,
  filelist?: string,
  groupname?: string,
  recordlabel?: string,
  cataloguenumber?: string,
  year?: string,
  remastertitle?: string,
  remasteryear?: string,
  remasterrecordlabel?: string,
  remastercataloguenumber?: string
}

export const releaseTypes: { [id: number]: string; } = {
  1: 'Album',
  3: 'Soundtrack',
  5: 'EP',
  6: 'Anthology',
  7: 'Compilation',
  9: 'Single',
  11: 'Live album',
  13: 'Remix',
  14: 'Bootleg',
  15: 'Interview',
  16: 'Mixtape',
  17: 'Demo',
  18: 'Concert Recording',
  19: 'DJ Mix',
  21: 'Unknown'
};

export class GazelleClient {

  private readonly username: string;
  private readonly password: string;
  private readonly baseUrl: string;
  private loginRequired: boolean;

  // private loggedIn: boolean;

  private requestOptions: Options;

  private getCookies: (currentUrl: string | URL) => Promise<tough.Cookie[]>;

  /**
   * @param baseUrl e.g.: https://what.cd/
   * @param username Gazelle username
   * @param password Gazelle password
   * @param options
   */
  constructor(baseUrl: string, username: string, password: string, options?: IOptions) {

    this.username = username;
    this.password = password;
    this.baseUrl = baseUrl;

    this.loginRequired = false;

    this.requestOptions = {
      followRedirect: false,
      prefixUrl: baseUrl,
      ...(options ? options.request : {})
    };

    if (!this.requestOptions.cookieJar) {
      // Assign a cookie jar if the user has not provided one
      this.requestOptions.cookieJar = new tough.CookieJar();
    }

    this.getCookies = promisify((this.requestOptions.cookieJar as tough.CookieJar).getCookies.bind(this.requestOptions.cookieJar));
  }

  private async login() {

    if (!this.loginRequired) {
      // Check for existing session
      for (const cookie of await this.getCookies(this.baseUrl)) {
        if (cookie.key === '__cfduid') // ToDO: check this code
          return;
      }
    }

    // login: "Log in"
    const postData = {
      username: this.username,
      password: this.password
    };

    const response: any = await got.post('login.php', {
      form: postData,
      ...this.requestOptions
    });

    switch (response.statusCode) {
      case 200:
        return;
      case 302: // page was temporarily moved
        if (response.headers.location === 'login.php') {
          // Received redirect login page, assume the login failed
          throw new Error('Login failed');
        } else {
          // Assume we logged in successfully
          return;
        }
      default:
        throw new Error('Received unexpected HTTP-status code: ' + response.statusCode);
    }
  }

  private async httpRequest(page: string, data: any, binary: boolean): Promise<Response> {
    await this.login();

    const options: Options = {
      encoding: binary ? null : undefined,
      responseType: binary ? 'buffer' : 'json',
      searchParams: data,
      followRedirect: false, // ToDo: already set in global options
      ...this.requestOptions
    };
    const response: any = await got.get(page, options);

    switch (response.statusCode) {
      case 200: // OK
        this.loginRequired = false;
        return response;

      case 302: // page was temporarily moved
        if (!this.loginRequired) {
          this.loginRequired = true;
          return this.httpRequest(page, data, binary); // recursion
        } else {
          throw new Error('Authentication failure');
        }

      default:
        // this.loggedIn = false;
        throw new Error('Received unexpected HTTP-status code: ' + response.statusCode);
    }
  }

  public action<T>(action: string, args: any): Promise<T> {
    const reqArgs = {action, ...args};
    return this.api_request<T>(reqArgs);
  }

  /**
   * Ref: https://github.com/WhatCD/Gazelle/wiki/JSON-API-Documentation
   * @param request API request
   * @return API response
   */
  public async api_request<T>(request: IApiRequest): Promise<T> {
    const response = await this.httpRequest('ajax.php', request, false);
    const json: any = response.body;
    if (!json.status) {
      throw new Error('Received invalid response');
    } else if (json.status !== 'success') {
      throw new Error('API error: ' + json.error);
    }
    return json.response;
  }

  /**
   * Get Index
   * Ref: https://github.com/WhatCD/Gazelle/wiki/JSON-API-Documentation#index
   */
  public async getIndex(): Promise<IIndex> {
    return this.action('index', {});
  }

  /**
   * Get artist
   * Ref: https://github.com/WhatCD/Gazelle/wiki/JSON-API-Documentation#artist
   * @param id
   * @return Artist
   */
  public async getArtistById(id: number, name?, onlyAsMain?: boolean): Promise<IArtist> {
    return this.action('artist', {id, artistreleases: onlyAsMain});
  }

  /**
   * Get artist
   * Ref: https://github.com/WhatCD/Gazelle/wiki/JSON-API-Documentation#artist
   * @return Artist
   */
  public async getArtistByName(name: string, onlyAsMain?: boolean): Promise<IArtist> {
    return this.action('artist', {artistname: name, artistreleases: onlyAsMain});
  }

  /**
   * Get torrent by torrent hash
   * @param id Torrent's id
   * @return Torrent and torrent-group information
   */
  public getTorrentById(id: number): Promise<ITorrentAndGroupInfo> {
    return this.action<ITorrentAndGroupInfo>('torrent', {id});
  }

  /**
   * Get torrent by torrent hash
   * @param torrentHash Torrent's hash
   * @return Torrent and torrent-group information
   */
  public getTorrentInfoByHash(torrentHash: string): Promise<ITorrentAndGroupInfo> {
    return this.action<ITorrentAndGroupInfo>('torrent', {hash: torrentHash.toUpperCase()});
  }

  private static extractFilename(headers): string {
    const contentDisposition = headers['content-disposition'];

    if (contentDisposition.indexOf('attachment; filename="') !== 0) throw new Error('invalid content disposition');

    let filename = contentDisposition.replace('attachment; filename="', '');
    filename = filename.slice(0, filename.length - 1);
    filename = filename.replace(/-\d+\.torrent/, '.torrent');

    return filename;
  }

  /**
   * The startsWith() method determines whether a string begins with the characters of another string,
   * returning true or false as appropriate.
   * @param haystack String to search in
   * @param needle  The characters to be searched in haystack.
   *
   * @return {string|boolean} true if the string begins with the characters of the search string; otherwise, false.
   */
  public static startsWith(haystack: string, needle: string): boolean {
    return haystack && haystack.lastIndexOf(needle, 0) === 0;
  }

  public async getTorrent(torrentId: number): Promise<IAttachment> {
    await this.login();

    const response: any = await got.get('torrents.php', {
      searchParams: {action: 'download', id: torrentId},
      responseType: 'buffer',
      ...this.requestOptions
    });
    const contentType = response.headers['content-type'];
    if (GazelleClient.startsWith(contentType, 'application/x-bittorrent')) {
      const filename = GazelleClient.extractFilename(response.headers);
      return {filename, content: response.body};
    } else {
      throw new Error('Unexpected content type: ' + contentType);
    }
  }
}
