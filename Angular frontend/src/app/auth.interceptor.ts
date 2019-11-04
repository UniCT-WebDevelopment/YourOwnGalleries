import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import {
  AuthService,
  CHANGE_PASSWORD_API,
  SIGN_IN_API,
  SIGN_UP_API
} from "./auth.service";
import { switchMap, catchError, filter, take, map, tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { SnackbarService } from "./snackbar.service";
import { MatDialog } from "@angular/material/dialog";

const DOMAIN_REGEX = /http:\/\/localhost:8000\/api\//g;
const REFRESH_TOKEN_API = "http://localhost:8000/api/refresh";

const EXCLUSIONS = [
  REFRESH_TOKEN_API,
  CHANGE_PASSWORD_API,
  SIGN_IN_API,
  SIGN_UP_API
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshTokenInProgress = false;
  // Refresh Token Subject tracks the current token, or is null if no token is currently
  // available (e.g. refresh pending).
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(
    public authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
    private dialog: MatDialog
  ) {}

  /*
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (EXCLUSIONS.includes(request.url)) {
      return next.handle(request);
    } else if (request.url.match(DOMAIN_REGEX)) {
      // Do not send token to another domain
      const tokenExpired = this.authService.isTokenExpired();

      if (!tokenExpired) {
        return next.handle(this.injectToken(request));
      } else {
        return this.authService.refreshToken().pipe(
          switchMap(token => {
            this.authService.replaceToken(token);
            return next.handle(this.injectToken(request, token));
          }),
          catchError(error => {
            // Redirect to access if an error occurred while retrieving token
            console.log(error);
            return this.redirectOnError("Token refresh error");
          })
        );
      }
    } else {
      // Request sent to another domain
      return this.redirectOnError("Wrong domain");
    }
  }
  */

  redirectOnError(message: string): Observable<never> {
    this.authService.deleteUser();
    this.dialog.closeAll();
    this.router.navigate(["access"]);
    // this.snackbarService.showSnackbar(message, 5000);
    return throwError({
      status: 500,
      error: { message }
    });
  }

  injectToken(request: HttpRequest<any>, token: string = null) {
    return request.clone({
      setHeaders: {
        Authorization: this.authService.getToken()
      }
    });
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(this.injectToken(request)).pipe(
      catchError(error => {
        console.log(error);
        // We don't want to refresh token for some requests like login or refresh token itself
        // So we verify url and we throw an error if it's the case
        if (EXCLUSIONS.includes(request.url)) {
          // We do another check to see if refresh token failed
          console.log("exclusions");
          return throwError(error);
        }

        // If error status is different than 401 we want to skip refresh token
        // So we check that and throw the error if it's the case
        if (error.status !== 401) {
          return throwError(error);
        }

        if (this.refreshTokenInProgress) {
          // If refreshTokenInProgress is true, we will wait until refreshTokenSubject has a non-null value
          // – which means the new token is ready and we can retry the request again
          return this.refreshTokenSubject.pipe(
            filter(result => result !== null),
            take(1),
            switchMap(token => next.handle(this.injectToken(request, token)))
          );
        } else {
          this.refreshTokenInProgress = true;

          // Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
          this.refreshTokenSubject.next(null);

          return this.authService.refreshToken().pipe(
            switchMap(token => {
              this.authService.replaceToken(token);
              this.refreshTokenInProgress = false;
              this.refreshTokenSubject.next(token);
              return next.handle(this.injectToken(request, token));
            }),
            catchError(err => {
              this.refreshTokenInProgress = false;
              return throwError(err);
            })
          );
        }
      }),
      tap(event => {
        if (event instanceof HttpResponse) {
          if (event.status === 429) {
            // Too many requests, redirect to login
            this.router.navigate(["access/signin"]);
            this.snackbarService.showSnackbar("Too many requests");
          }
        }
      })
    );
  }
}
