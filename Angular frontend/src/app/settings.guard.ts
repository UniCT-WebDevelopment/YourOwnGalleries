import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate
} from "@angular/router";
import { Observable, of } from "rxjs";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { PassCheckDialogComponent } from "./pass-check-dialog/pass-check-dialog.component";
import { Location } from "@angular/common";

@Injectable({
  providedIn: "root"
})
export class SettingsGuard implements CanActivate {
  constructor(private dialog: MatDialog, private location: Location) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (location.pathname === state.url) {
      return of(true);
    }
    const dialogRef = this.dialog.open(PassCheckDialogComponent, {
      width: "250px",
      data: ""
    });
    return dialogRef.afterClosed();
  }
}
