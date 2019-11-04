import { Injectable, EventEmitter } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class BottomSheetService {
  menuSelected = new EventEmitter<void>();
  toggleTopbarMenu = new EventEmitter<boolean>();

  constructor() {}

  menuClick(): void {
    this.menuSelected.emit(null);
  }

  enableTopbarMenu(enabled: boolean): void {
    this.toggleTopbarMenu.emit(enabled);
  }
}
