import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";
import { DataService } from "./data.service";
@Injectable({
  providedIn: "root",
})
export class ThirdPartyAuthGuardService implements CanActivate {
  constructor(public auth: DataService, public router: Router) {}
  canActivate(): boolean {
    if (localStorage.getItem("t") != "a") {
      this.router.navigate(["full/invalid"]);
      return false;
    }
    return true;
  }
}
