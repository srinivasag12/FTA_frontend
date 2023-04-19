import { Injectable } from "@angular/core";
import { Promise } from "es6-promise";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataService {
  email: string = "";
  emailBy: string = "";
  loggedInUserId: number;
  auth: boolean = false;
  private subject = new Subject<any>();
  linkId: string;

  constructor() {}
  setEmailAndFileOwner(
    email: string,
    emailBy: string,
    linkId: string
  ): Promise<Boolean> {
    return new Promise((resolve) => {
      this.email = email;
      this.emailBy = emailBy;
      this.linkId = linkId;
      resolve(true);
    });
  }

  getEmailAndFileOwner(): Promise<any> {
    return new Promise((resolve) => {
      let data = {
        email: this.email,
        emailBy: this.emailBy,
        linkId: this.linkId,
      };

      resolve(data);
    });
  }

  setLoggedInUserId(id: number) {
    localStorage.setItem("g", id + "");
    //this.loggedInUserId = id;
  }

  getLoggedInUserId(): Promise<number> {
    return new Promise((resolve) => {
      let id: number = +localStorage.getItem("g");
      resolve(id);
    });
  }

  setUserRole(id: any) {
    localStorage.setItem("role", id + "");
  }

  getUserRole(): Promise<number> {
    return new Promise((resolve) => {
      let id: any = localStorage.getItem("role");
      resolve(id);
    });
  }

  getRole() {
    let role = localStorage.getItem("role");
    return role;
  }

  setUsername(id: any) {
    localStorage.setItem("username", id + "");
  }

  getUsername(): Promise<number> {
    return new Promise((resolve) => {
      let id: any = localStorage.getItem("username");
      resolve(id);
    });
  }

  setLastLogin(id: any) {
    localStorage.setItem("last_login", id + "");
  }

  getLastLogin(): Promise<number> {
    return new Promise((resolve) => {
      let id: any = localStorage.getItem("last_login");
      resolve(id);
    });
  }

  setLastLogout(id: any) {
    localStorage.setItem("last_logout", id + "");
  }

  getLastLogout(): Promise<number> {
    return new Promise((resolve) => {
      let id: any = localStorage.getItem("last_logout");
      console.log(id);
      resolve(id);
    });
  }

  getLastLoginAndLogout() {
    return new Promise((resolve) => {
      let login: any = localStorage.getItem("last_login");
      let logout: any = localStorage.getItem("last_logout");

      let msg = "Last LogIn :" + login + " , " + " Last LogOut :" + logout;
      console.log(msg);
      resolve(msg);
    });
  }

  setAuth() {
    localStorage.setItem("a", "true");
    // this.auth = true;
  }

  getAuth(): boolean {
    const auth = localStorage.getItem("a");
    return auth == "true";
  }

  setNavbarTitle(title) {
    this.subject.next(title);
  }

  getNavbarTitle() {
    return this.subject.asObservable();
  }

  setPrevRouteUrl(url) {
    localStorage.setItem("prevUrl", url);
  }

  getPrevRouteUrl() {
    return localStorage.getItem("prevUrl");
  }

  removePrevUrl() {
    localStorage.removeItem("prevUrl");
  }

  setPasswordExpiryNotification(notification) {
    localStorage.setItem("passwordExpiryNotification", notification);
  }

  getPasswordExpiryNotification() {
    return new Promise((resolve) => {
      let id: any = localStorage.getItem("passwordExpiryNotification");
      console.log(id);
      resolve(id);
    });
  }

  removePasswordExpiryNotification() {
    localStorage.removeItem("passwordExpiryNotification");
  }
}
