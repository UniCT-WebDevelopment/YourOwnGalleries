import { Directive, HostListener, OnInit } from "@angular/core";

@Directive({
  selector: "[appMouseDragScroll]"
})
export class MouseDragScrollDirective implements OnInit {
  mouseDown: boolean;
  timer: any; // NodeJS.Timer doesn't work
  scrollDelay: number;
  constructor() {}

  ngOnInit() {
    this.mouseDown = false;
    this.scrollDelay = 20;
  }

  @HostListener("mousedown", ["$event"]) onMouseDown(event: MouseEvent) {
    this.mouseDown = true;
  }

  @HostListener("mouseup", ["$event"]) onMouseUp(event: MouseEvent) {
    this.mouseDown = false;
  }

  @HostListener("document:mousemove", ["$event"]) onMouseMove(
    event: MouseEvent
  ) {
    if (this.mouseDown && event.clientY <= window.innerHeight) {
      this.checkForWindowScroll(event);
    }
  }

  checkForWindowScroll(event: MouseEvent): void {
    clearTimeout(this.timer);
    if (this.adjustWindowScroll(event)) {
      this.timer = setTimeout(
        () => this.checkForWindowScroll(event),
        this.scrollDelay
      );
    }
  }

  adjustWindowScroll(event: MouseEvent): boolean {
    if (!this.mouseDown) {
      return false;
    }
    if (event.clientY >= window.innerHeight - 10) {
      window.scrollBy(0, 20);
      return true;
    } else if (event.clientY <= 50) {
      window.scrollBy(0, -20);
      return true;
    } else {
      return false;
    }
  }
}
