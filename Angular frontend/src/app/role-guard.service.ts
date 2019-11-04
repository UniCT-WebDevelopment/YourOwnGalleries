import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root"
})
export class RoleGuardService {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // This will be passed from the route config
    // on the data property
    const expectedRole = route.data.expectedRole;

    if (this.authService.isTokenNull()) {
      this.router.navigate(["access"]);
      return false;
    }

    const role = this.authService.getUserRole();

    if (role === expectedRole) {
      return true;
    } else {
      this.router.navigate([role]).then(success => {
        if (!success) {
          this.router.navigate(["access"]);
          return false;
        }
        return true;
      });
    }
  }
}
