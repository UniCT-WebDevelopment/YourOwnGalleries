import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ComponentRef
} from "@angular/core";
import { IDownload } from "../download.service";
import { faTimes, faRedo, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Subscription } from "rxjs";
import { downloadProgress, toURL } from "../utils";
import * as fileSaver from "file-saver";
import { take } from "rxjs/operators";

@Component({
  selector: "app-single-download",
  templateUrl: "./single-download.component.html",
  styleUrls: ["./single-download.component.css"]
})
export class SingleDownloadComponent implements OnInit, OnDestroy {
  faTimes = faTimes;
  faRedo = faRedo;
  faCheck = faCheck;
  @Input() download: IDownload;
  @Input() ref: ComponentRef<SingleDownloadComponent>;
  subscription: Subscription;
  progress: number;
  completed: boolean;
  aborted: boolean;
  filename: string;
  constructor() {}

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.doDownload();
  }

  redoDownload(): void {
    this.doDownload();
  }

  getFilename(cdHeader: string): void {
    this.filename = cdHeader.substring(cdHeader.indexOf("filename=") + 9);
  }

  doDownload() {
    this.completed = false;
    this.aborted = false;
    this.subscription = this.download.observable
      .pipe(
        downloadProgress(progress => (this.progress = progress)),
        toURL(this.getFilename.bind(this)),
        take(1)
      )
      .subscribe(
        url => {
          fileSaver.saveAs(url, this.filename);
          this.completed = true;
        },
        error => {
          this.aborted = true;
        }
      );
  }

  onCloseClick(): void {
    this.ref.destroy();
  }

  abortDownload(): void {
    if (this.subscription && !this.completed) {
      this.subscription.unsubscribe();
      this.aborted = true;
    }
  }
}
