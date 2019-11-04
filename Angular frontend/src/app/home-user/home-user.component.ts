import { Component, OnInit } from "@angular/core";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { DownloadService } from "../download.service";
import { SnackbarService } from "../snackbar.service";

@Component({
  selector: "app-home-user",
  templateUrl: "./home-user.component.html",
  styleUrls: ["./home-user.component.css"]
})
export class HomeUserComponent implements OnInit {
  showDownloads: boolean;
  constructor(
    private authService: AuthService,
    private router: Router,
    private downloadService: DownloadService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {
    this.showDownloads = false;
    this.downloadService.toggle.subscribe(show => (this.showDownloads = show));
  }

  attemptSignOut(): void {
    this.authService.signOut().subscribe(
      response => {},
      error => {
        this.snackbarService.showSnackbar("Signout failed", 3000);
      },
      () => {
        this.authService.deleteUser();
        this.router.navigate(["access"]);
      }
    );
  }
}
