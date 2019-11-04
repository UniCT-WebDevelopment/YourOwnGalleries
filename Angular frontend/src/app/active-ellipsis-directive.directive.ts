import { Directive, ElementRef, AfterViewInit } from "@angular/core";

@Directive({
  selector: "[appIsEllipsisActive]"
})
export class ActiveEllipsisDirectiveDirective implements AfterViewInit {
  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      const element = this.elementRef.nativeElement;
      if (element.offsetWidth < element.scrollWidth) {
        element.title = element.innerHTML;
      }
    }, 500);
  }
}
