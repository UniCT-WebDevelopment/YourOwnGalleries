import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter
} from "@angular/core";
import { map, catchError, finalize } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Subscription } from "rxjs";
import {
  faPlayCircle,
  faFileImage,
  faFileVideo,
  IconDefinition,
  faShareAlt,
  faTrashAlt,
  faQuestion
} from "@fortawesome/free-solid-svg-icons";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { GalleriesBottomSheetComponent } from "../galleries-bottom-sheet/galleries-bottom-sheet.component";
import { ItemModalService } from "../../item-modal.service";
import { ItemService, IItem, GET_THUMB_API } from "../../item.service";
import { ClipboardCopyService } from "../../clipboard-copy.service";

export interface IDeletedItem {
  id: number;
  size: number;
}

@Component({
  selector: "app-item",
  templateUrl: "./item.component.html",
  styleUrls: ["./item.component.css"]
})
export class ItemComponent implements OnInit {
  faPlayCircle = faPlayCircle;
  faFileImage = faFileImage;
  faFileVideo = faFileVideo;
  faTrashAlt = faTrashAlt;
  faShareAlt = faShareAlt;
  isDownloading: boolean;
  downloadProgress: number;
  link: string;
  @Input() item: IItem;
  isVideo: boolean;

  constructor() {}

  ngOnInit() {
    this.isVideo = this.item.type.includes("video") ? true : false;
    this.link = GET_THUMB_API + this.item.id;
  }
}
