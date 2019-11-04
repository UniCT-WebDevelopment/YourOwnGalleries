import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../auth.service";
import { SnackbarService } from "../../snackbar.service";

@Component({
  selector: "app-forgot",
  templateUrl: "./forgot.component.html",
  styleUrls: ["./forgot.component.css", "../access.component.css"]
})
export class ForgotComponent implements OnInit {
  debounce = 5000;
  enableSend = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {}

  attemptPasswordChange(myForm: HTMLFormElement): void {
    const email = myForm.form.controls.email.value;
    this.enableSend = false;
    this.authService.changePassword(email).subscribe(
      response => {
        this.snackbarService.showSnackbar("Check your mailbox", 3000);
        setTimeout(() => {
          this.router.navigate(["access/signin"]);
        }, this.debounce);
      },
      error => {
        this.snackbarService.showSnackbar(error.error.message, 3000);
        this.enableSend = true;
      }
    );
  }

  navigateSignIn(): void {
    this.router.navigate(["access/signin"]);
  }

  navigateSignUp(): void {
    this.router.navigate(["access/signup"]);
  }
}
