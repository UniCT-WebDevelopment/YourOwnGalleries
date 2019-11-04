import { Component, OnInit, OnDestroy } from "@angular/core";
import { User } from "../../user";
import { AuthService } from "../../auth.service";
import { Router } from "@angular/router";
import { SnackbarService } from "../../snackbar.service";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css", "../access.component.css"]
})
export class SignUpComponent implements OnInit {
  enableSubmit = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {}

  attemptSignUp(myForm: HTMLFormElement): void {
    const data = myForm.form.controls;
    const user = new User(
      data.email.value,
      data.name.value,
      data.pass.value,
      data.c_pass.value
    );
    this.enableSubmit = false;
    this.authService.signUp(user).subscribe(
      response => {
        this.snackbarService.showSnackbar(
          "Registration completed, please sign in",
          3000
        );
        this.router.navigate(["access/signin"]);
      },
      error => {
        this.snackbarService.showSnackbar(error.error.message, 5000);
        this.enableSubmit = true;
      }
    );
  }
  checkPasswords(pass: string, cPass: string): void {
    if (pass !== cPass) {
      this.snackbarService.showSnackbar(
        "Password and confirm password fields must match.",
        2000
      );
    } else {
      this.snackbarService.closeSnackbar();
    }
  }

  navigateSignIn(): void {
    this.router.navigate(["access/signin"]);
  }
}
