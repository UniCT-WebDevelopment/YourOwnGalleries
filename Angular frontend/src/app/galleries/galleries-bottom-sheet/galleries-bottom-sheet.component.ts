import { Component, Inject, OnInit } from "@angular/core";
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA
} from "@angular/material/bottom-sheet";
import {
  faTrashAlt,
  faShareAlt,
  faDownload,
  faEdit,
  faCopy
} from "@fortawesome/free-solid-svg-icons";
import { MatDialog } from "@angular/material/dialog";
import { InputDialogComponent } from "../../input-dialog/input-dialog.component";
import { IItem } from "../../item.service";
import { IGallery } from "../../gallery.service";

interface IShareDetails {
  title: string;
  description: string;
  action: string;
}

interface IBottomSheetTargets {
  elementsType: string;
  targets: IItem[] | IGallery[];
}

@Component({
  selector: "app-galleries-bottom-sheet",
  templateUrl: "./galleries-bottom-sheet.component.html",
  styleUrls: ["./galleries-bottom-sheet.component.css"]
})
export class GalleriesBottomSheetComponent implements OnInit {
  faTrashAlt = faTrashAlt;
  faShareAlt = faShareAlt;
  faDownload = faDownload;
  faEdit = faEdit;
  faCopy = faCopy;
  share: IShareDetails;
  constructor(
    private bottomSheetRef: MatBottomSheetRef<GalleriesBottomSheetComponent>,
    private dialog: MatDialog,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: IBottomSheetTargets
  ) {}

  ngOnInit() {
    this.share =
      this.data.targets.length === 1
        ? this.data.targets[0].shared
          ? {
              title: "Unshare",
              description:
                "Make selected " + this.data.elementsType + " private",
              action: "unshare"
            }
          : {
              title: "Share",
              description:
                "Make this " + this.data.elementsType + " publicly accessible",
              action: "share"
            }
        : null;
  }

  sendAction(command: string, name?: string): void {
    this.bottomSheetRef.dismiss({ command, newName: name });
  }

  openNewNameDialog(): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: "250px",
      data: {
        name: this.data.targets[0].name,
        header: "Rename " + this.data.elementsType,
        title: "Name"
      }
    });
    dialogRef.beforeClosed().subscribe(name => {
      // Undefined when dialog is closed by clicking outside
      if (name !== "" && name !== undefined) {
        this.sendAction("rename", name);
      }
    });
  }
}
