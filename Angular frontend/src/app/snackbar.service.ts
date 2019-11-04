import { Injectable, OnInit } from "@angular/core";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";
import { SnackbarComponent } from "./snackbar/snackbar.component";

@Injectable({
  providedIn: "root"
})
export class SnackbarService implements OnInit {
  open: boolean;
  ref: MatSnackBarRef<SnackbarComponent>;
  constructor(private snackbar: MatSnackBar) {}

  ngOnInit() {
    this.open = false;
  }

  showSnackbar(message: string, duration?: number): void {
    if (!this.open) {
      this.open = true;
      this.ref = this.snackbar.openFromComponent(SnackbarComponent, {
        duration,
        panelClass: "selectable",
        data: { message }
      });
      this.ref.afterDismissed().subscribe(() => (this.open = false));
    }
  }

  closeSnackbar(): void {
    this.ref.dismiss();
    this.open = false;
  }

  isOpen(): boolean {
    return this.open;
  }
}
