import { HttpEvent, HttpResponse, HttpEventType } from "@angular/common/http";
import { tap, filter, map } from "rxjs/operators";
import { pipe } from "rxjs";

export type CompareFunction = (field1: string, field2: string) => number;

export function uploadProgress<T>(cb: (progress: number) => void) {
  return tap((event: HttpEvent<T>) => {
    if (event.type === HttpEventType.UploadProgress) {
      cb(Math.round((100 * event.loaded) / event.total));
    }
  });
}

export function downloadProgress<T>(cb: (progress: number) => void) {
  return tap((event: HttpEvent<T>) => {
    if (event.type === HttpEventType.DownloadProgress) {
      cb(Math.round((100 * event.loaded) / event.total));
    }
  });
}

export function toResponseBody<T>() {
  return pipe(
    filter((event: HttpEvent<T>) => event.type === HttpEventType.Response),
    map((res: HttpResponse<T>) => res.body)
  );
}

export function toURL<T>(processCBHeader: (cbHeader: string) => void) {
  return pipe(
    filter((event: HttpEvent<T>) => event.type === HttpEventType.Response),
    map((res: HttpResponse<T>) => {
      processCBHeader(res.headers.get("content-disposition"));
      return URL.createObjectURL(res.body);
    })
  );
}

export interface IPaginated {
  current_page: number;
  first_page_url: string;
  from: number;
  next_page_url: string;
  path: string;
  per_page: number;
  prev_page_url: string;
  to: number;
}

// Compact representation of a bytes size
export function formatBytes(size: number): string {
  let i = 0;
  const units = ["B", "KB", "MB", "GB"];
  for (i = 0; i < 4 && size >= 100; i++) {
    size = size / 1024;
  }
  if (i === 4) {
    i -= 1;
  }
  const str = size >= 1 ? Number(size).toFixed(1) : Number(size).toFixed(2);
  return (str !== "0.00" ? str : "0") + " " + units[i];
}
