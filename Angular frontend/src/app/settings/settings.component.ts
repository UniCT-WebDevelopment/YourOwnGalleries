import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService, IUser } from "../auth.service";
import { SnackbarService } from "../snackbar.service";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.css"]
})
export class SettingsComponent implements OnInit {
  user: IUser;
  prevUser: IUser;
  subscription: Subscription;
  timer: any; // NodeJS.Timer doesn't work
  constructor(
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    delete user.token;
    this.user = { ...user, password: "", confirmPass: "" };
    this.prevUser = { ...this.user };
  }

  saveChanges(): void {
    this.authService.updateUserData(this.user).subscribe(
      response => {
        this.authService.setUser(this.user);
        this.prevUser = this.user;
        this.snackbarService.showSnackbar("Updated", 3000);
      },
      error => {
        this.snackbarService.showSnackbar(error.error.message, 5000);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => (this.user = { ...this.prevUser }), 1000);
      }
    );
  }

  deleteAccount(): void {
    this.authService.deleteAccount().subscribe(
      response => {
        this.authService.deleteUser();
        this.router.navigate(["access"]);
      },
      error => {
        this.snackbarService.showSnackbar(
          "Can't delete account, try again.",
          5000
        );
      }
    );
  }
}
