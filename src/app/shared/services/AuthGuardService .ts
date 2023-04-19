import { Injectable } from "@angular/core";
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { DataService } from "./data.service";
@Injectable({
  providedIn: "root",
})
export class AuthGuardService implements CanActivate, CanActivateChild{
  constructor(public auth: DataService, public router: Router) {
    console.log("AUTH GUARD SERVICE ..")
  }
  
  canActivate(): boolean {
    console.log("AUTH GUARD SERVICE , CAN ACTIVATE BLOCK")
   /*  if (!this.auth.getAuth()) {
      localStorage.removeItem("a");
      localStorage.removeItem("g");
      this.router.navigate(["invalid"]);
      return false;
    }
    return true; */
    let isLoggedIn:boolean=true;
    if(isLoggedIn){
      return true;
    }
    else{
      this.router.navigate(["invalid"]);
      return false;
    }

  }

  canActivateChild( next: ActivatedRouteSnapshot,): boolean {
    console.log("AUTH GUARD SERVICE , CAN ACTIVATE CHILD BLOCK")
      if (!this.auth.getAuth()) {
      console.log("REMOVING a & g ITEMS FROM LOCAL STORAGE ");
      localStorage.removeItem("a");
      localStorage.removeItem("g");
      this.router.navigate(["full/invalid"]);
      return false;
    }
    else{
     return this.checkUserRole(next)
    }
    
  }

   checkUserRole(route){
    console.log("CHECK USER ROLE ...");
    let role = this.auth.getRole();
    if (route.data.role && route.data.role.indexOf(role) === -1) {
      this.router.navigate(["full/invalid"]);
      return false;
    }
    return true;
    
  }

}
