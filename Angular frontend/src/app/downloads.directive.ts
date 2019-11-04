import { Directive, ViewContainerRef } from "@angular/core";

@Directive({
  selector: "[appDownloads]"
})
export class DownloadsDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
