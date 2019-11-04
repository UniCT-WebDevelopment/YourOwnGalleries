import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Subscription, from } from "rxjs";
import {
  faShareAlt,
  faDownload,
  faTrash,
  faSearch,
  faUpload,
  faArrowUp,
  faArrowDown,
  faTools
} from "@fortawesome/free-solid-svg-icons";
import { MatDialog } from "@angular/material/dialog";
import { InputDialogComponent } from "../input-dialog/input-dialog.component";
import { debounceTime, map, take, mergeMap } from "rxjs/operators";
import { trigger, style, transition, animate } from "@angular/animations";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { ClipboardCopyService } from "../clipboard-copy.service";
import { SnackbarService } from "../snackbar.service";
import { ItemModalService } from "../item-modal.service";
import { Router } from "@angular/router";
import { SelectionModel } from "@angular/cdk/collections";
import { SHARED_ITEM_LINK_REGEX, ItemService } from "../item.service";
import { GalleriesBottomSheetComponent } from "./galleries-bottom-sheet/galleries-bottom-sheet.component";
import {
  GalleryService,
  IGallery,
  GET_GALLERIES_API,
  SHARED_GALLERY_LINK_REGEX,
  SHARE_GALLERY_API
} from "../gallery.service";
import { formatBytes } from "../utils";
import { BottomSheetService } from "../bottom-sheet.service";
import { MatCheckboxChange } from "@angular/material/checkbox";

@Component({
  selector: "app-galleries",
  templateUrl: "./galleries.component.html",
  styleUrls: ["./galleries.component.css"],
  animations: [
    trigger("slideFromRight", [
      transition(":enter", [
        style({ transform: "translateX(200%)" }),
        animate("500ms ease-in", style({ transform: "translateX(0)" }))
      ]),
      transition(":leave", [
        animate("500ms ease-in", style({ transform: "translateX(-200%)" }))
      ])
    ]),
    trigger("slideFromLeft", [
      transition(":enter", [
        style({ transform: "translateX(-200%)" }),
        animate("500ms ease-in", style({ transform: "translateX(0)" }))
      ]),
      transition(":leave", [
        animate("500ms ease-in", style({ transform: "translateX(200%)" }))
      ])
    ])
  ]
})
export class GalleriesComponent implements OnInit, OnDestroy {
  faShareAlt = faShareAlt;
  faDownload = faDownload;
  faUpload = faUpload;
  faTrash = faTrash;
  faSearch = faSearch;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faTools = faTools;
  downloadProgress = 0;
  isDownloading = false;
  galleriesSub: Subscription;
  searchSub: Subscription;
  gallerySearchEnabled = false;
  galleryShareEnabled = false;
  displayedColumns: string[] = ["select", "name", "owner", "updated", "size"];
  dataSource = new MatTableDataSource<IGallery>();
  selection = new SelectionModel<IGallery>(true, []);
  nextPageURL: string;
  searchedGallery: string;
  bottomSpinner = false;
  bottomSheetServiceSub: Subscription;
  pageSize: number;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private clipboardCopyService: ClipboardCopyService,
    private snackbarService: SnackbarService,
    private itemModalService: ItemModalService,
    private router: Router,
    private galleryService: GalleryService,
    private itemService: ItemService,
    private bottomSheetService: BottomSheetService
  ) {}

  ngOnDestroy() {
    if (this.bottomSheetServiceSub) {
      this.bottomSheetServiceSub.unsubscribe();
    }
  }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.bottomSheetServiceSub = this.bottomSheetService.menuSelected.subscribe(
      () => this.openBottomSheet()
    );
    this.nextPageURL = GET_GALLERIES_API;
    this.searchedGallery = "";
    this.pageSize = 0;
    this.getGalleries();
  }

  getGalleries() {
    this.bottomSpinner = true;
    this.galleriesSub = this.galleryService
      .getPaginatedGalleries(
        this.nextPageURL + "&search=" + this.searchedGallery
      )
      .subscribe(
        response => {
          this.dataSource.data = this.dataSource.data.concat(response.data);
          this.nextPageURL = response.next_page_url;
          if (this.pageSize === 0) {
            this.pageSize = response.data.length;
          }
        },
        error => this.snackbarService.showSnackbar("Error", 3000),
        () => (this.bottomSpinner = false)
      );
  }

  searchGalleries(text: string): void {
    if (this.galleriesSub) {
      this.galleriesSub.unsubscribe();
    }
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    this.dataSource.data = [];
    this.searchedGallery = text;
    this.nextPageURL = GET_GALLERIES_API;
    this.searchSub = from([text])
      .pipe(
        map(val => val.toLowerCase()),
        debounceTime(500),
        take(1)
      )
      .subscribe(() => {
        this.getGalleries();
      });
  }

  onScroll(): void {
    if (this.nextPageURL && !this.bottomSpinner) {
      this.getGalleries();
    }
  }

  selectGallery(gallery: IGallery) {
    this.router.navigate(["gallery", gallery.name], { state: { gallery } });
  }

  toggleGallerySearch(): void {
    this.gallerySearchEnabled = !this.gallerySearchEnabled;
    if (!this.gallerySearchEnabled) {
      this.nextPageURL = GET_GALLERIES_API;
      this.searchedGallery = "";
      this.dataSource.data = [];
      this.getGalleries();
    }
  }

  toggleGalleryShare(): void {
    this.galleryShareEnabled = !this.galleryShareEnabled;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: "250px",
      data: {
        name: "",
        header: "Create gallery",
        title: "Name"
      }
    });

    dialogRef
      .beforeClosed()
      .pipe(take(1))
      .subscribe(name => {
        // Undefined when dialog is closed by clicking outside
        if (name !== "" && name !== undefined) {
          this.createGallery(name);
        }
      });
  }

  createGallery(name: string): void {
    this.galleryService
      .createGallery(name)
      .subscribe(
        gallery =>
          (this.dataSource.data = [gallery].concat(this.dataSource.data)),
        error => this.snackbarService.showSnackbar(error.error.message, 19000)
      );
  }

  adjustSize(size: number): string {
    return formatBytes(size);
  }

  deleteGalleries(galleries: IGallery[]): void {
    galleries.forEach(target => {
      this.galleryService.deleteGallery(target.id).subscribe(response => {
        this.dataSource.data = this.dataSource.data.filter(
          gallery => gallery.id !== target.id
        );
        this.selection.deselect(target);
        // Load new galleries after great deletion
        if (this.dataSource.data.length <= this.pageSize && this.nextPageURL) {
          this.getGalleries();
        }
      });
    });
  }

  downloadGalleries(targets: IGallery[]): void {
    targets.forEach(target =>
      this.galleryService.downloadGallery(target.id, target.name)
    );
  }

  shareGallery(id: number): void {
    this.galleryService.shareGallery(id).subscribe(
      token => {
        this.dataSource.data = this.dataSource.data.map(gallery => {
          if (gallery.id === id) {
            gallery.shared = true;
            gallery.token = token;
          }
          return gallery;
        });
        this.clipboardCopyService.copyToClipboard(SHARE_GALLERY_API + token);
      },
      error => this.snackbarService.showSnackbar(error.error.message, 3000)
    );
  }

  unshareGallery(token: string): void {
    this.galleryService.unshareGallery(token).subscribe(
      unshared => {
        if (unshared.wasOwner) {
          this.dataSource.data = this.dataSource.data.map(gallery => {
            if (gallery.token === token) {
              gallery.shared = false;
            }
            return gallery;
          });
          this.snackbarService.closeSnackbar();
          this.snackbarService.showSnackbar("Unshared", 3000);
        } else {
          this.snackbarService.closeSnackbar();
          this.snackbarService.showSnackbar("Removed", 3000);
          this.dataSource.data = this.dataSource.data.filter(
            gallery => gallery.token !== token
          );
        }
      },
      error => this.snackbarService.showSnackbar(error.error.message, 3000)
    );
  }

  renameGallery(id: number, name: string): void {
    this.galleryService.renameGallery(id, name).subscribe(
      response => {
        this.dataSource.data = this.dataSource.data.map(gall => {
          if (gall.id === id) {
            gall.name = name;
          }
          return gall;
        });
      },
      error => this.snackbarService.showSnackbar(error.error.message, 3000)
    );
  }

  manageShare(input: HTMLInputElement): void {
    if (input.value.match(SHARED_GALLERY_LINK_REGEX)) {
      this.galleryService
        .getSharedGallery(input.value)
        .subscribe(
          gallery =>
            (this.dataSource.data = [gallery].concat(this.dataSource.data)),
          error => this.snackbarService.showSnackbar(error.error.message, 3000)
        );
    } else if (input.value.match(SHARED_ITEM_LINK_REGEX)) {
      this.itemService
        .getSharedItem(input.value)
        .subscribe(
          item =>
            this.itemModalService.openModal({ actualIndex: 0, items: [item] }),
          error => this.snackbarService.showSnackbar(error.error.message, 3000)
        );
    } else {
      this.snackbarService.showSnackbar("Invalid link", 3000);
    }
    // Clear input
    setTimeout(() => (input.value = ""), 1000);
  }

  openContextMenu(event: MouseEvent, gallery: IGallery): void {
    event.preventDefault();
    if (!this.selection.isSelected(gallery)) {
      this.selection.clear();
      this.selection.select(gallery);
      this.openBottomSheet(gallery);
    } else {
      this.openBottomSheet();
    }
  }

  openBottomSheet(gallery?: IGallery) {
    const targets = gallery !== undefined ? [gallery] : this.selection.selected;
    const ref = this.bottomSheet.open(GalleriesBottomSheetComponent, {
      data: {
        elementsType: "galler" + (targets.length > 1 ? "ies" : "y"),
        targets
      }
    });

    ref.afterDismissed().subscribe(action => {
      if (!action) {
        return;
      }
      switch (action.command) {
        case "download":
          this.downloadGalleries(targets);
          break;
        case "share":
          this.shareGallery(targets[0].id);
          break;
        case "delete":
          this.deleteGalleries(targets);
          break;
        case "unshare":
          this.unshareGallery(targets[0].token);
          break;
        case "copy":
          this.clipboardCopyService.copyToClipboard(
            SHARE_GALLERY_API + targets[0].token
          );
          break;
        case "rename":
          this.renameGallery(targets[0].id, action.newName);
      }
    });
  }

  changeSelection(event: MatCheckboxChange, row: IGallery): void {
    if (event) {
      this.selection.toggle(row);
      this.selection.selected.length > 0
        ? this.bottomSheetService.enableTopbarMenu(true)
        : this.bottomSheetService.enableTopbarMenu(false);
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }
}
