import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";

import { GalleriesBottomSheetComponent } from "../galleries-bottom-sheet/galleries-bottom-sheet.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { ItemModalService } from "../../item-modal.service";
import { ClipboardCopyService } from "../../clipboard-copy.service";
import { ItemService, IItem, SHARE_ITEM_API } from "../../item.service";
import { BottomSheetService } from "../../bottom-sheet.service";
import { DeviceDetectorService } from "ngx-device-detector";
import { SnackbarService } from "src/app/snackbar.service";
import { Subscription, from, of } from "rxjs";
import { mergeMap, finalize } from "rxjs/operators";

@Component({
  selector: "app-items-container",
  templateUrl: "./items-container.component.html",
  styleUrls: ["./items-container.component.css"]
})
export class ItemsContainerComponent implements OnInit, OnDestroy {
  @Input()
  items: IItem[];
  @Output()
  itemsChanged = new EventEmitter<IItem[]>();
  @ViewChild("dtsContainer", { static: true }) dtsContainer: any;
  bottomSpinner: boolean;
  selectedItems: IItem[] = [];
  topbarMenuEnabled: boolean;
  doubleClick: boolean;
  bottomSheetServiceSub: Subscription;

  constructor(
    private bottomSheet: MatBottomSheet,
    private bottomSheetService: BottomSheetService,
    private itemModalService: ItemModalService,
    private clipboardCopyService: ClipboardCopyService,
    private itemService: ItemService,
    private deviceService: DeviceDetectorService,
    private snackbarService: SnackbarService
  ) {}

  ngOnDestroy() {
    if (this.bottomSheetServiceSub) {
      this.bottomSheetServiceSub.unsubscribe();
    }
  }

  ngOnInit() {
    this.doubleClick = false;
    this.topbarMenuEnabled = false;
    this.bottomSpinner = false;
    this.selectedItems = [];
    this.bottomSheetServiceSub = this.bottomSheetService.menuSelected.subscribe(
      () => this.openBottomSheet()
    );
  }

  getTargets(item: IItem): IItem[] {
    if (
      this.selectedItems.filter(selectedItem => selectedItem.id === item.id)
        .length
    ) {
      return this.selectedItems;
    }
    this.dtsContainer.clearSelection();
    this.dtsContainer.selectItems((itm: IItem) => itm.id === item.id);
    return [item];
  }

  openContextMenu(event: MouseEvent = null, item: IItem = null): void {
    if (event) {
      event.preventDefault();
    }

    let targets;
    if (this.deviceService.isMobile() || this.deviceService.isTablet()) {
      this.dtsContainer.selectItems((itm: IItem) => itm.id === item.id);
      return;
    } else {
      if (item) {
        targets = this.getTargets(item);
      } else {
        targets = this.selectedItems;
      }
      this.openBottomSheet(targets);
    }
  }

  openBottomSheet(targets: IItem[] = null) {
    if (!targets) {
      targets = this.selectedItems;
    }
    const ref = this.bottomSheet.open(GalleriesBottomSheetComponent, {
      data: {
        elementsType: "item" + (targets.length > 1 ? "s" : ""),
        targets
      }
    });
    ref.afterDismissed().subscribe(action => {
      if (!action) {
        return;
      }
      switch (action.command) {
        case "download":
          this.downloadItems(targets);
          break;
        case "share":
          this.shareItem(targets[0].id);
          break;
        case "delete":
          this.deleteItems(targets);
          break;
        case "unshare":
          this.unshareItem(targets[0].id);
          break;
        case "copy":
          this.clipboardCopyService.copyToClipboard(
            SHARE_ITEM_API + targets[0].token
          );
          break;
        case "rename":
          this.renameItem(targets[0].id, action.newName);
      }
    });
  }

  deleteItems(targets: IItem[]): void {
    /*
    targets.forEach(target => {
      this.itemService
        .deleteItem(target.id)
        .pipe()
        .subscribe(
          response => {
            this.items = this.items.filter(item => item.id !== target.id);
            this.itemsChanged.emit(this.items);
          },
          error => this.snackbarService.showSnackbar(error.error, 3000)
        );
    });
    */

    // Concurrent deletions to emit a cumulative value of deletion
    from(targets)
      .pipe(
        mergeMap(target => this.itemService.deleteItem(target.id), 5),
        finalize(() => this.itemsChanged.emit(this.items))
      )
      .subscribe(
        id => (this.items = this.items.filter(item => item.id !== id)),
        error => this.snackbarService.showSnackbar(error.error.message, 3000)
      );
  }

  downloadItems(targets: IItem[]): void {
    targets.forEach(target =>
      this.itemService.downloadItem(target.id, target.name)
    );
  }

  unshareItem(id: number): void {
    this.itemService.unshareItem(id).subscribe(response => {
      this.items = this.items.map(item =>
        item.id === id ? { ...item, shared: false } : item
      );
      this.itemsChanged.emit(this.items);
    });
  }

  renameItem(id: number, name: string): void {
    this.itemService.renameItem(id, name).subscribe(response => {
      this.items = this.items.map(item =>
        item.id === id ? { ...item, name } : item
      );
      this.itemsChanged.emit(this.items);
    });
  }

  shareItem(id: number): void {
    this.itemService.shareItem(id).subscribe(
      token => {
        this.items = this.items.map(item =>
          item.id === id ? { ...item, token, shared: true } : item
        );
        this.itemsChanged.emit(this.items);
        this.clipboardCopyService.copyToClipboard(SHARE_ITEM_API + token);
      },
      error => this.snackbarService.showSnackbar(error.error, 3000)
    );
  }

  checkMobileClick(actualIndex: number, id: number) {
    if (!this.doubleClick) {
      this.dtsContainer.clearSelection();
      this.dtsContainer.selectItems(item => item.id === id);
      this.doubleClick = true;
    }
    if (this.deviceService.isMobile() || this.deviceService.isTablet()) {
      this.openItemModal(actualIndex, id);
    }
  }

  openItemModal(actualIndex: number, id: number): void {
    this.itemModalService.openModal({ items: this.items, actualIndex });
    this.doubleClick = false;
  }

  toggleTopbarMenu(): void {
    if (this.selectedItems.length > 0 && !this.topbarMenuEnabled) {
      this.topbarMenuEnabled = true;
      this.bottomSheetService.enableTopbarMenu(true);
    } else if (this.selectedItems.length === 0 && this.topbarMenuEnabled) {
      this.topbarMenuEnabled = false;
      this.bottomSheetService.enableTopbarMenu(false);
    }
  }
}
