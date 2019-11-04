import { Pipe, PipeTransform } from "@angular/core";
import {
  SafeHtml,
  SafeStyle,
  SafeScript,
  SafeUrl,
  SafeResourceUrl,
  DomSanitizer
} from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { map, tap, take } from "rxjs/operators";
import { Observable } from "rxjs";

interface ISecurePipeURL {
  index?: number;
  url: SafeUrl;
}

@Pipe({
  name: "secure"
})
export class SecurePipe implements PipeTransform {
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  transform(url, index?): Observable<ISecurePipeURL> {
    return this.http.get(url, { responseType: "blob" }).pipe(
      map(val => {
        return {
          index,
          url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(val))
        };
      }),
      take(1)
    );
  }
}
