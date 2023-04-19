import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { SharedfilesService } from "src/app/pages/sharedfiles/sharedfiles.service";
import { Subscription } from "rxjs";
import { DataService } from "../services/data.service";
import { CookieService } from "ngx-cookie-service";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { APP_CONSTANTS } from "../services/appConstants";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  title: any;
  subscription: Subscription;

  @Output() toggleSideBar: EventEmitter<any> = new EventEmitter();

  loggedInUserName: number;
  APP_CONSTANT: any = APP_CONSTANTS;

  constructor(
    private dataService: DataService,
    private cookieService: CookieService,
    private http: HttpClient
  ) {
    console.log("navbar ...");
    this.subscription = this.dataService.getNavbarTitle().subscribe((title) => {
      console.log(title);
      if (title) {
        this.title = title;
      } else {
        this.title = "IRI FILE TRANSFER";
      }
    });

    this.dataService.getUsername().then((res) => {
      console.log("Logged In Username ::", res);
      this.loggedInUserName = res;
    });
  }

  ngOnInit(): void {}

  toggleSidebar() {
    this.toggleSideBar.emit();
  }

  signOut() {
    // this.cookieService.delete('access_token');
    this.dataService.getLoggedInUserId().then((res) => {
      console.log(res);
      this.http.put(environment.api + "user/logout", { userId: res }).subscribe(
        (resp: any) => {
          console.log(resp);
          this.cookieService.delete("access_token");
          localStorage.removeItem("a");
          localStorage.removeItem("g");
          localStorage.removeItem("role");
          localStorage.removeItem("username");
        },
        (error) => {
          console.log("Error" + JSON.stringify(error));
        }
      );
    });
  }
}
