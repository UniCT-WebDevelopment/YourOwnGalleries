import { Injectable, EventEmitter } from "@angular/core";
import { HttpClient, HttpResponse, HttpHeaders } from "@angular/common/http";
import { User } from "./user";
import { Observable } from "rxjs";
import { JwtHelperService } from "@auth0/angular-jwt";
import { take } from "rxjs/operators";

export interface IUser {
  name: string;
  email: string;
  password: string;
  confirmPass: string;
}

export const SIGN_UP_API = "http://localhost:8000/api/registration";
export const SIGN_IN_API = "http://localhost:8000/api/signin";
const SIGN_OUT_API = "http://localhost:8000/api/signout";
const UNREGISTER_API = "http://localhost:8000/api/unregistration";
export const CHANGE_PASSWORD_API = "http://localhost:8000/api/forgot";
const REFRESH_TOKEN_API = "http://localhost:8000/api/refresh";
const CHECK_PASSWORD_API = "http://localhost:8000/api/password/check";
const UPDATE_USER_DATA_API = "http://localhost:8000/api/registration/update";

const jwtHelper = new JwtHelperService();

export interface ISignedInUser {
  name: string;
  token: string;
  email: string;
}

@Injectable({
  providedIn: "root"
})
export class AuthService {
  usernameChanged = new EventEmitter<string>();
  constructor(private http: HttpClient) {}

  signIn(user: User): Observable<ISignedInUser> {
    return this.http.post<ISignedInUser>(SIGN_IN_API, {
      email: user.email,
      password: user.password
    });
  }

  signOut(): Observable<void> {
    return this.http.delete<void>(SIGN_OUT_API);
  }

  signUp(user: User): Observable<HttpResponse<any>> {
    return this.http.post<any>(
      SIGN_UP_API,
      {
        email: user.email,
        password: user.password,
        name: user.name,
        c_password: user.confirmPass
      },
      { observe: "response" }
    );
  }

  changePassword(email: string): Observable<void> {
    return this.http
      .post<void>(CHANGE_PASSWORD_API, {
        email
      })
      .pipe(take(1));
  }

  checkPassword(password: string): Observable<void> {
    return this.http.post<void>(CHECK_PASSWORD_API, { password }).pipe(take(1));
  }

  getToken(): string {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    return currentUser ? currentUser.token : "";
  }

  isTokenExpired(): boolean {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    return currentUser && currentUser.token
      ? jwtHelper.isTokenExpired(currentUser.token.replace("Bearer ", ""))
      : true;
  }

  isTokenNull(): boolean {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    return !(currentUser && currentUser.token);
  }

  refreshToken(): Observable<string> {
    let headers = new HttpHeaders();
    headers = headers.set("Authorization", this.getToken());
    return this.http
      .get<string>(REFRESH_TOKEN_API, {
        headers,
        responseType: "text" as "json"
      })
      .pipe(take(1));
  }

  setUser(user: ISignedInUser | IUser): void {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    currentUser =
      currentUser && currentUser.token
        ? { ...user, token: currentUser.token }
        : user;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    this.usernameChanged.emit(currentUser.name);
  }

  deleteUser(): void {
    localStorage.removeItem("currentUser");
  }

  getUser(): ISignedInUser {
    return JSON.parse(localStorage.getItem("currentUser"));
  }

  getUsername(): string {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    return currentUser ? (currentUser.name ? currentUser.name : "?") : "";
  }

  replaceToken(token: string): void {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    currentUser.token = token;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }

  getUserRole(): string {
    try {
      const role = jwtHelper.decodeToken(this.getToken()).role;
      return role;
    } catch (e) {
      return "user";
    }
  }

  updateUserData(user: IUser): Observable<IUser> {
    return this.http
      .post<IUser>(UPDATE_USER_DATA_API, { ...user })
      .pipe(take(1));
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(UNREGISTER_API).pipe(take(1));
  }
}
