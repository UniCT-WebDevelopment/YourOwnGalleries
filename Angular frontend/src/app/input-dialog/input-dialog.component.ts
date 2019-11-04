import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

interface DialogData {
  name: string;
  header: string;
  title: string;
}

@Component({
  selector: "app-input-dialog",
  templateUrl: "./input-dialog.component.html",
  styleUrls: ["./input-dialog.component.css"]
})
export class InputDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
}
