import { Injectable, EventEmitter, OnInit, Output } from "@angular/core";
import { HttpClient, HttpEvent } from "@angular/common/http";
import { downloadProgress, toURL } from "./utils";
import { SnackbarService } from "./snackbar.service";
import { take } from "rxjs/operators";
import { Observable } from "rxjs";

const DONWLOAD_ITEM_API = "http://localhost:8000/api/items/download/";
const DOWNLOAD_GALLERY_API = "http://localhost:8000/api/galleries/download/";

export interface IDownload {
  name?: string;
  type: string;
  observable: Observable<HttpEvent<Blob>>;
}

@Injectable({
  providedIn: "root"
})
export class DownloadService implements OnInit {
  activeDownloads = new EventEmitter<number>();
  isShowing: boolean;
  toggle = new EventEmitter<boolean>();
  downloads = new EventEmitter<IDownload>();
  badge = new EventEmitter<void>();
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.isShowing = false;
    this.toggle.emit(false);
  }

  download(id: number, name: string, type: string): void {
    const url =
      type === "gallery"
        ? DOWNLOAD_GALLERY_API
        : type === "item"
        ? DONWLOAD_ITEM_API
        : null;
    if (url) {
      this.emitDownload(url + id, name, type);
    }
  }

  emitDownload(url: string, name: string, type: string): void {
    const observable = this.http.get(url, {
      responseType: "blob",
      observe: "events",
      reportProgress: true
    });
    this.downloads.emit({ type, observable, name });
  }

  toggleDownloadsCard(): void {
    this.isShowing = !this.isShowing;
    this.toggle.emit(this.isShowing);
  }

  enableBadge(): void {
    this.badge.emit(null);
  }
}
