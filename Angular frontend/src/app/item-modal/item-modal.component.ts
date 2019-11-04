import { Component, OnInit, Inject, HostListener } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import {
  faSpinner,
  faWindowClose,
  faDownload,
  faAngleLeft,
  faAngleRight,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { IItem, GET_ITEM_API } from "../item.service";
import { DeviceDetectorService } from "ngx-device-detector";
import { SecurePipe } from "../secure.pipe";
import { DownloadService } from "../download.service";
import { SnackbarService } from "../snackbar.service";

export interface IModalData {
  items: IItem[];
  actualIndex: number;
}

@Component({
  selector: "app-item-modal",
  templateUrl: "./item-modal.component.html",
  styleUrls: ["./item-modal.component.css"],
  providers: [SecurePipe]
})
export class ItemModalComponent implements OnInit {
  topMenuEnabled: boolean;
  itemSub: Subscription;
  faSpinner = faSpinner;
  faInfoCircle = faInfoCircle;
  faWindowClose = faWindowClose;
  faDownload = faDownload;
  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;
  url: string;
  next: number;
  prev: number;
  right: number;
  left: number;
  subscription: Subscription;
  items: IItem[];
  actualItem: IItem;
  actualIndex: number;
  leftSlidesCounter: number;
  rightSlidesCountr: number;
  subs: Subscription[];
  timer: any; // NodeJs.Timer doesn't work
  swipeEnabled: boolean;
  mobile: boolean;
  preload = 2;

  @HostListener("window:keyup", ["$event"])
  keyEvent(event: KeyboardEvent) {
    if (event.key === "ArrowRight") {
      this.nextItem();
    }

    if (event.key === "ArrowLeft") {
      this.prevItem();
    }
  }

  constructor(
    public dialogRef: MatDialogRef<ItemModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IModalData,
    private securePipe: SecurePipe,
    private deviceService: DeviceDetectorService,
    private downloadService: DownloadService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {
    this.mobile =
      this.deviceService.isTablet() || this.deviceService.isMobile();
    this.swipeEnabled = this.topMenuEnabled = true;
    this.items = [];
    this.subs = [];
    this.data.items.map(item => {
      this.items.push({ ...item, url: null });
    });

    this.actualIndex = this.data.actualIndex;
    this.actualItem = this.items[this.actualIndex];
    this.updateItems();
  }

  updateItems(): void {
    const preloadedIndexes: number[] = [];
    const index = this.actualIndex;
    preloadedIndexes.push(index);
    for (let i = 1; i <= this.preload; i++) {
      const prevIndex = index - i >= 0 ? index - i : this.items.length - 1;
      const nextIndex = (index + i) % this.items.length;
      if (prevIndex !== nextIndex) {
        preloadedIndexes.push(nextIndex);
        preloadedIndexes.unshift(prevIndex);
      } else {
        break;
      }
    }

    preloadedIndexes.forEach(idx => {
      if (!this.items[idx].url) {
        this.securePipe
          .transform(GET_ITEM_API + this.items[idx].id)
          .subscribe(url => {
            this.items[idx].url = url.url;
          });
      }
    });
  }

  showUploader(): void {
    this.snackbarService.showSnackbar(
      "Uploader: " + this.actualItem.uploader,
      3000
    );
  }

  nextItem(): void {
    if (this.swipeEnabled) {
      this.actualIndex = (this.actualIndex + 1) % this.items.length;
      this.actualItem = this.items[this.actualIndex];
      this.addDelayAndUpdate();
    }
  }

  prevItem(): void {
    if (this.swipeEnabled) {
      this.actualIndex =
        this.actualIndex - 1 >= 0
          ? this.actualIndex - 1
          : this.items.length - 1;
      this.actualItem = this.items[this.actualIndex];
      this.addDelayAndUpdate();
    }
  }

  addDelayAndUpdate(): void {
    clearTimeout(this.timer);
    setTimeout(this.updateItems.bind(this), 300);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  downloadItem() {
    if (this.actualItem.url) {
      this.downloadService.download(
        this.actualItem.id,
        this.actualItem.name,
        "item"
      );
    }
  }

  handlePinchZoomEvents(event): void {
    if (event.type === "swipe" || event.type === "zoom-in") {
      this.swipeEnabled = false;
    }
    if (event.type === "zoom-out") {
      this.swipeEnabled = true;
    }
  }

  preventDefault(event: MouseEvent): void {
    event.preventDefault();
  }

  toggleTopMenu(): void {
    this.topMenuEnabled = !this.topMenuEnabled;
  }
}
