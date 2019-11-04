import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { AuthService } from "../auth.service";
import { finalize, take } from "rxjs/operators";
import { LogoutDialogComponent } from "../logout-dialog/logout-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { Router, Event } from "@angular/router";
import {
  faPowerOff,
  faEllipsisV,
  faDownload
} from "@fortawesome/free-solid-svg-icons";
import { BottomSheetService } from "../bottom-sheet.service";
import { DownloadService } from "../download.service";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class TopbarComponent implements OnInit {
  username: string;
  dialogSub: Subscription;
  logoutSub: Subscription;
  faPowerOff = faPowerOff;
  faEllipsisV = faEllipsisV;
  faDownload = faDownload;
  menuEnabled: boolean;
  badgeActive: boolean;
  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
    private bottomSheetService: BottomSheetService,
    private downloadService: DownloadService
  ) {}

  ngOnInit() {
    this.menuEnabled = this.badgeActive = false;
    this.username = this.authService.getUsername();
    this.authService.usernameChanged.subscribe(
      username => (this.username = username)
    );
    this.bottomSheetService.toggleTopbarMenu.subscribe(
      enabled => (this.menuEnabled = enabled)
    );
    this.downloadService.badge.subscribe(() => (this.badgeActive = true));
    this.router.events.subscribe((event: Event) => {
      this.menuEnabled = false;
    });
  }

  openLogoutDialog(): void {
    const dialogRef = this.dialog.open(LogoutDialogComponent, {
      width: "250px"
    });

    this.dialogSub = dialogRef
      .beforeClosed()
      .pipe(take(1))
      .subscribe(exit => {
        if (exit) {
          this.authService
            .signOut()
            .pipe(
              finalize(() => {
                localStorage.clear();
                this.router.navigate(["access"]);
              })
            )
            .subscribe();
        }
      });
  }

  menuClick() {
    this.bottomSheetService.menuClick();
  }

  showDownloads(): void {
    this.badgeActive = false;
    this.downloadService.toggleDownloadsCard();
  }
}
