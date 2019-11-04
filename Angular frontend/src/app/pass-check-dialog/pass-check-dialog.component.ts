import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-pass-check-dialog",
  templateUrl: "./pass-check-dialog.component.html",
  styleUrls: ["./pass-check-dialog.component.css"]
})
export class PassCheckDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<PassCheckDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  checkPassword(): void {
    this.authService.checkPassword(this.data).subscribe(
      response => this.dialogRef.close(true),
      error => {
        this.dialogRef.close(false);
      }
    );
  }

  onNoAction(): void {
    this.dialogRef.close(false);
  }
}
