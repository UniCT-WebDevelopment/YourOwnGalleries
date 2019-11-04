import { Component, OnInit, OnDestroy } from "@angular/core";
import { User } from "../../user";
import { Router } from "@angular/router";
import { AuthService } from "../../auth.service";
import { SnackbarService } from "../../snackbar.service";

@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.css", "../access.component.css"]
})
export class SignInComponent implements OnInit {
  debounce = 2000;
  enableSubmit = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {}

  attemptSignIn(myForm: HTMLFormElement): void {
    const data = myForm.form.controls;
    const user = new User(data.email.value, null, data.pass.value, null);
    this.enableSubmit = false;
    this.authService.signIn(user).subscribe(
      response => {
        this.authService.setUser({ ...response });
        this.snackbarService.showSnackbar("Login successful", this.debounce);
        setTimeout(() => {
          this.router.navigate(["home"]);
        }, this.debounce);
      },
      error => {
        console.log(error);
        this.snackbarService.showSnackbar(error.statusText, 5000);
        this.enableSubmit = true;
      }
    );
  }

  navigateForgot(): void {
    this.router.navigate(["access/forgot"]);
  }

  navigateSignUp(): void {
    this.router.navigate(["access/signup"]);
  }
}
