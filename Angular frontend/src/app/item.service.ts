import { Injectable } from "@angular/core";
import { HttpClient, HttpEvent } from "@angular/common/http";
import { SafeUrl } from "@angular/platform-browser";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { IPaginated } from "./utils";
import { DownloadService } from "./download.service";

export const GET_ITEM_API = "http://localhost:8000/api/items/";
export const GET_THUMB_API = "http://localhost:8000/api/items/thumbnails/";
export const SHARE_ITEM_API = "http://localhost:8000/api/share/items/";
const UNSHARE_ITEM_API = "http://localhost:8000/api/unshare/items/";
const UPLOAD_ITEM_API = "http://localhost:8000/api/items/upload/";
const DELETE_ITEM_API = "http://localhost:8000/api/items/delete/";
const RENAME_ITEM_API = "http://localhost:8000/api/items/rename/";

export const GET_GALLERY_API = (id: number) =>
  "http://localhost:8000/api/galleries/" + id + "?page=1";

export const SHARED_ITEM_LINK_REGEX = /http:\/\/localhost:8000\/api\/share\/items\/[A-Za-z0-9]+/g;
const NEWS_API = "http://localhost:8000/api/home/user";

export interface IItem {
  date: string;
  id: number;
  name: string;
  shared: boolean;
  size: number;
  token: string;
  type: string;
  uploader: string;
  url?: SafeUrl;
}

export interface IPaginatedItems extends IPaginated {
  data: IItem[];
}

@Injectable({
  providedIn: "root"
})
export class ItemService {
  constructor(
    private http: HttpClient,
    private downloadService: DownloadService
  ) {}

  getNews(limit: number, offset: number): Observable<IItem[]> {
    return this.http
      .post<IItem[]>(NEWS_API + "?limit=" + limit + "&offset=" + offset, {})
      .pipe(take(1));
  }

  getPaginatedItems(url): Observable<IPaginatedItems> {
    return this.http.get<IPaginatedItems>(url).pipe(take(1));
  }

  shareItem(id: number): Observable<string> {
    return this.http
      .post<string>(SHARE_ITEM_API + id, {}, { responseType: "text" as "json" })
      .pipe(take(1));
  }

  unshareItem(id: number): Observable<void> {
    return this.http.delete<void>(UNSHARE_ITEM_API + id).pipe(take(1));
  }

  deleteItem(id: number): Observable<number> {
    return this.http.delete<number>(DELETE_ITEM_API + id).pipe(take(1));
  }

  renameItem(id: number, name: string): Observable<void> {
    alert(name);
    return this.http.put<void>(RENAME_ITEM_API + id, { name }).pipe(take(1));
  }

  uploadItem(galleryID: number, data: FormData): Observable<HttpEvent<any>> {
    return this.http.post<HttpEvent<any>>(UPLOAD_ITEM_API + galleryID, data, {
      reportProgress: true,
      observe: "events"
    });
  }

  downloadItem(id: number, name: string): void {
    this.downloadService.download(id, name, "item");
  }

  getSharedItem(url: string): Observable<IItem> {
    return this.http.get<IItem>(url).pipe(take(1));
  }
}
