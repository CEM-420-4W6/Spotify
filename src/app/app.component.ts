import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import {lastValueFrom} from "rxjs";


class Artist {
  id?: string;
  name?: string;
  image?: string;
}

class Album {
  constructor(public id: string, public name: string, public image: string, public songs: Song[] = []) {}
}

class Song {
  constructor(public id: string, public name: string) {}
}

const CLIENT_ID = MON_CLIENT_ID;
const CLIENT_SECRET = MON_CLIENT_SECRET;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'spotifytest';

  artist: Artist = new Artist();
  albums: Album[] = [];

  artistname = '';

  spotifyToken?: string;

  constructor(public http: HttpClient) {}

  async connect(): Promise<void> {
    let body = new HttpParams()
      .set('grant_type', 'client_credentials');

    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
      })
    };

    let result = await lastValueFrom(this.http.post<ConnectResult>('https://accounts.spotify.com/api/token', body.toString(), httpOptions));

    console.log(result);
    this.spotifyToken = result.access_token;
  }

  async getArtist(): Promise<void> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.spotifyToken
      })
    };

    let result = await lastValueFrom(this.http.get<SearchArtistResult>('https://api.spotify.com/v1/search?type=artist&offset=0&limit=1&q=' + this.artistname, httpOptions));

    console.log(result);
    this.artist.id = result.artists.items[0].id;
    this.artist.name = result.artists.items[0].name;
    this.artist.image = result.artists.items[0].images[0].url;

  }

  async getAlbums(): Promise<void> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.spotifyToken
      })
    };

    let result = await lastValueFrom(this.http.get<AlbumsResult>(`https://api.spotify.com/v1/artists/${this.artist.id}/albums?include_groups=album,single`, httpOptions))

    this.albums = [];
    console.log(result);
    result.items.forEach((album:any) => {
      this.albums.push(new Album(album.id, album.name, album.images[0].url));
    });
  }

  async getSongs(album: Album): Promise<void> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.spotifyToken
      })
    };

    let result = await lastValueFrom(this.http.get<AlbumDetail>(`https://api.spotify.com/v1/albums/${album.id}`, httpOptions));

    album.songs = [];
    console.log(result);
    result.tracks.items.forEach((track: TrackResult) => {
      album.songs.push(new Song(track.id, track.name));
    });
  }
}

export interface ConnectResult {
  access_token:string;
  expires_in: number;
  token_type: string;
}

export interface ImageResult {
  height: number,
  url: string,
  width: number
}

export interface SearchArtistResult {
  artists:{
    items:[
      {
        external_urls: {
          spotify: string
        },
        followers: {
          total: number
        },
        genres: string[],
        href: string,
        id: string,
        images:ImageResult[],
        name: string,
        popularity: number,
        type: string,
        uri: string
      }
    ]
  }
}

export interface ArtistResult {
  id:string,
  name:string,
  type: string,
  uri:string
}

export interface AlbumsResult {
  items: [
    {
      album_group:string,
      album_type:string,
      artists:ArtistResult[],
      available_markets:string[],
      href: string,
      id: string,
      images:ImageResult[],
      name:string,
      release_date:string,
      release_date_precision:string,
      total_tracks:number,
      type:string,
      uri:string
    }
  ]
}

export interface AlbumDetail {
  album_type: string,
  artists:ArtistResult[],
  available_markets:string[],
  genres:string[],
  href:string,
  id:string,
  images:ImageResult[]
  label:string,
  name:string,
  popularity:number,
  release_date:string,
  release_date_precision:string,
  total_tracks:number,
  tracks: {
    href:string,
    items:TrackResult[],
    total: number
  },
  type:string,
  uri:string
}

export interface TrackResult {
  artists:ArtistResult[],
  available_markets:string[],
  disc_number:number,
  duration_ms:number,
  explicit:boolean,
  id:string,
  name:string,
  preview_url:string,
  track_number:number
  type:string,
  uri:string
}
