import { Injectable, OnInit, OnDestroy } from "@angular/core";
import {
  ItemModalComponent,
  IModalData
} from "./item-modal/item-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { DeviceDetectorService } from "ngx-device-detector";
import { LocationStrategy } from "@angular/common";

@Injectable({
  providedIn: "root"
})
export class ItemModalService implements OnInit, OnDestroy {
  private isModalOpen = false;
  constructor(
    private dialog: MatDialog,
    private deviceService: DeviceDetectorService,
    private locationStrategy: LocationStrategy
  ) {}

  ngOnInit() {
    this.locationStrategy.onPopState(() => {
      history.pushState(null, null, location.href);
    });
  }

  ngOnDestroy() {}

  openModal(data: IModalData): void {
    const config = {
      maxWidth: "100vw",
      maxHeight: "100vh",
      width: "100vw",
      height: "100vh",
      panelClass: this.deviceService.isMobile()
        ? "mobile-modal"
        : "desktop-modal"
    };

    const dialogRef = this.dialog.open(ItemModalComponent, {
      ...config,
      data
    });

    dialogRef.afterOpened().subscribe(() => {
      history.pushState(null, null, location.href);
      this.isModalOpen = true;
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isModalOpen = false;
    });
  }
}
