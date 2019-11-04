import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { IPaginated } from "./utils";

import { GET_GALLERY_API } from "./item.service";
import { DownloadService } from "./download.service";

export const DELETE_GALLERY_API = "http://localhost:8000/api/galleries/delete/";
export const RENAME_GALLERY_API = "http://localhost:8000/api/galleries/rename/";
export const GET_GALLERIES_API = "http://localhost:8000/api/galleries?page=1";
export const CREATE_GALLERY_API = "http://localhost:8000/api/galleries/create";
export const SHARE_GALLERY_API = "http://localhost:8000/api/share/galleries/";
export const UNSHARE_GALLERY_API =
  "http://localhost:8000/api/unshare/galleries/";

export const SHARED_GALLERY_LINK_REGEX = /http:\/\/localhost:8000\/api\/share\/galleries\/[A-Za-z0-9]+/g;

export interface IGallery {
  id: number;
  name: string;
  updated: string;
  owner: string;
  token: string;
  size: number;
  shared: boolean;
}

interface IUnshared {
  wasOwner: boolean;
}

export interface IPaginatedGalleries extends IPaginated {
  data: IGallery[];
}

@Injectable({
  providedIn: "root"
})
export class GalleryService {
  constructor(
    private http: HttpClient,
    private downloadService: DownloadService
  ) {}

  getPaginatedGalleries(url): Observable<IPaginatedGalleries> {
    return this.http.get<IPaginatedGalleries>(url).pipe(take(1));
  }

  downloadGallery(id: number, name: string): void {
    this.downloadService.download(id, name, "gallery");
  }

  renameGallery(id: number, name: string): Observable<void> {
    return this.http.put<void>(RENAME_GALLERY_API + id, { name }).pipe(take(1));
  }

  deleteGallery(id: number): Observable<number> {
    return this.http.delete<number>(DELETE_GALLERY_API + id).pipe(take(1));
  }

  createGallery(name: string): Observable<IGallery> {
    return this.http.post<IGallery>(CREATE_GALLERY_API, { name }).pipe(take(1));
  }

  shareGallery(id: number): Observable<string> {
    return this.http
      .post<string>(
        SHARE_GALLERY_API + id,
        {},
        { responseType: "text" as "json" }
      )
      .pipe(take(1));
  }

  unshareGallery(token: string): Observable<IUnshared> {
    return this.http
      .delete<IUnshared>(UNSHARE_GALLERY_API + token)
      .pipe(take(1));
  }

  getSharedGallery(url: string): Observable<IGallery> {
    return this.http.get<IGallery>(url).pipe(take(1));
  }
}
