import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { mergeMap, finalize, debounceTime, map, take } from "rxjs/operators";
import {
  faUpload,
  faTools,
  faArrowUp,
  faArrowDown,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import { Subscription, from, Observable } from "rxjs";
import { CompareFunction, uploadProgress, toResponseBody } from "../../utils";
import { SnackbarService } from "../../snackbar.service";
import { ItemService, GET_GALLERY_API, IItem } from "../../item.service";
import { IGallery } from "../../gallery.service";
import { DownloadService } from "../../download.service";

interface ICurrentUpload {
  name: string;
  number: number;
}

@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.component.html",
  styleUrls: ["./gallery.component.css"]
})
export class GalleryComponent implements OnInit {
  faUpload = faUpload;
  faTools = faTools;
  gallery: IGallery;
  acceptFiles = "video/mp4,image/jpeg";
  isUploading = false;
  currentUpload: ICurrentUpload;
  uploadCompleted = false;
  uploadSub: Subscription;
  uploadProgress = 0;
  itemsSub: Subscription;
  itemsToolsEnabled = false;
  items: IItem[];
  actualFileSize: number;
  selectedOption: string;
  orderOptions = ["date", "name", "type"];
  orderIcon: IconDefinition;
  compareFunction: CompareFunction;
  nextPageURL: string;
  searchedItem: string;
  bottomSpinner = false;
  selectedItems: any[] = [];
  timer: any; // NodeJS.Timer doesn't work
  @ViewChild("fileInput", { read: ElementRef, static: true })
  inputFileRef: ElementRef;
  @ViewChild("container", { static: true })
  dtsContainer: any;
  @ViewChild("scrollable", { static: true })
  scrollable: ElementRef;
  totalUploads: number;
  pageSize: number;
  searchSub: Subscription;

  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private itemService: ItemService
  ) {}

  ngOnInit() {
    this.pageSize = 0;
    this.items = [];
    this.selectedOption = this.orderOptions[0];
    this.orderIcon = faArrowDown;
    this.compareFunction = (field1, field2) => {
      return field1 > field2 ? -1 : field1 < field2 ? 1 : 0;
    };

    this.gallery = history.state.gallery as IGallery;
    if (!this.gallery) {
      this.router.navigate(["galleries"]);
    }
    this.nextPageURL = GET_GALLERY_API(this.gallery.id);
    this.searchedItem = "";
    this.getGallery();
  }

  getGallery(): void {
    this.bottomSpinner = true;
    this.itemsSub = this.itemService
      .getPaginatedItems(this.nextPageURL + "&search=" + this.searchedItem)
      .subscribe(
        result => {
          this.items = this.items.concat(result.data);
          if (this.pageSize === 0) {
            this.pageSize = result.data.length;
          }
          this.nextPageURL = result.next_page_url;
        },
        error => this.snackbarService.showSnackbar("Error", 3000),
        () => (this.bottomSpinner = false)
      );
  }

  onScroll(): void {
    if (this.nextPageURL && !this.bottomSpinner) {
      this.getGallery();
    }
  }

  toggleItemsTools(enabled?: boolean) {
    this.itemsToolsEnabled =
      enabled !== undefined ? enabled : !this.itemsToolsEnabled;
    if (!this.itemsToolsEnabled) {
      this.selectedOption = this.orderOptions[0];
      this.orderIcon = faArrowDown;
      this.nextPageURL = GET_GALLERY_API(this.gallery.id);
      this.searchedItem = "";
      this.items = [];
      this.getGallery();
    }
  }

  searchItems(text: string): void {
    if (this.itemsSub) {
      this.itemsSub.unsubscribe();
    }
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    this.searchedItem = text;
    this.nextPageURL = GET_GALLERY_API(this.gallery.id);
    this.items = [];
    this.searchSub = from([text])
      .pipe(
        map(val => val.toLowerCase()),
        debounceTime(500),
        take(1)
      )
      .subscribe(() => {
        this.getGallery();
      });
  }

  verifyAndUploadFiles(event): void {
    const files = [];
    for (const file of event) {
      if (!this.acceptFiles.split(",").includes(file.type)) {
        alert(file.name + " is not supported.");
      } else {
        files.push(file);
      }
    }
    this.uploadFiles(files);
  }

  uploadFiles(files: any[]): void {
    if (files.length === 0) {
      return;
    }

    this.toggleItemsTools(false);
    this.isUploading = true;
    this.currentUpload = null;
    this.totalUploads = files.length;

    // Manage exactly one subscription per time
    from(files)
      .pipe(
        mergeMap(file => this.uploadFile(file), 1),
        finalize(() => {
          this.snackbarService.showSnackbar(
            "Upload" + (files.length > 1 ? "s" : "") + " completed",
            3000
          );
          this.isUploading = false;
        })
      )
      .subscribe(
        item => this.items.unshift(item),
        error => this.snackbarService.showSnackbar("Upload error", 3000)
      );
  }

  uploadFile(file: File): Observable<IItem> {
    const data = new FormData();
    data.append("item", file as Blob, file.name);
    this.actualFileSize = file.size;
    this.currentUpload = {
      name: file.name,
      number: this.currentUpload ? this.currentUpload.number + 1 : 1
    };
    return this.itemService.uploadItem(this.gallery.id, data).pipe(
      uploadProgress(progress => {
        if (this.uploadProgress + progress > this.uploadProgress) {
          this.uploadProgress = progress;
        }
      }),
      toResponseBody(),
      finalize(() => {
        this.uploadProgress = 0;
      })
    );
  }

  inputClick(): void {
    this.inputFileRef.nativeElement.click();
  }

  sortGalleryFromButton(): void {
    this.orderIcon === faArrowDown
      ? ((this.orderIcon = faArrowUp),
        (this.compareFunction = (field1, field2) => {
          return field1 > field2 ? 1 : field1 < field2 ? -1 : 0;
        }))
      : ((this.orderIcon = faArrowDown),
        (this.compareFunction = (field1, field2) => {
          return field1 > field2 ? -1 : field1 < field2 ? 1 : 0;
        }));
    this.sortGallery();
  }

  sortGallery(): void {
    const field = this.selectedOption;
    this.items = this.items.sort((a, b) =>
      this.compareFunction(a[field], b[field])
    );
  }

  onItemsChanged(items: IItem[]): void {
    this.items = items;
    // Check if deletion reduced too much the number of items, in case load new ones
    if (this.items.length <= Math.floor(this.pageSize / 2)) {
      if (this.nextPageURL) {
        this.getGallery();
      }
    }
  }
}
