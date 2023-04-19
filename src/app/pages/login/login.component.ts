import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import {
  HttpRequest,
  HttpClient,
  HttpEventType,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { DataService } from "../../shared/services/data.service";
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../environments/environment";
import { NgBlockUI, BlockUI } from "ng-block-ui";
import { CookieService } from "ngx-cookie-service";
import { TokenServiceService } from "src/app/shared/services/token-service.service";
import { LoginService } from "./login.service";
import { CountdownModule, CountdownComponent } from "ngx-countdown";
import { fromEvent, merge, Observable, of } from "rxjs";
import { mapTo } from "rxjs/operators";
import { APP_CONSTANTS } from "../../shared/services/appConstants";

export interface userDetails {
  email: string;
  username: string;
  linkId: string;
}

export class User {
  email: string;
  pwd: string;
}

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  //Login-Component Properties
  loginForm: FormGroup;
  urlParam: string;
  isDisabled: boolean = false;
  user: User;
  isNormalLogin: boolean;
  isThirdPartyLogin: boolean;
  otpGenerated: boolean;
  leftSideImg = "../../assets/BlueUpload.svg";
  @ViewChild("cd", { static: false }) private countdown: CountdownComponent;
  APP_CONSTANT: any = APP_CONSTANTS;

  //OTP UI Config
  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: "",
    inputStyles: {
      width: "60px",
      height: "60px",
    },
  };
  countDownConfig = {
    leftTime: 900,
    notify: [2, 5],
    format: "mm:ss",
    demand: false,
  };

  //Block UI instance
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI() blockUI1: NgBlockUI;
  linkType: any;
  enterOtp: boolean = true;
  countdownFinished: boolean = false;
  timer: boolean;
  regenOtp: boolean;
  attemptStatus: boolean = false;
  attemptMessage: any;
  hideHintButton: boolean = false;
  showHintMessage: any;

  online$: Observable<boolean>;
  isOnline: boolean;
  inactiveUser: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private dataService: DataService,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private tokenService: TokenServiceService,
    private loginService: LoginService
  ) {
    //Getting urn from url param
    this.urlParam = this.route.snapshot.paramMap.get("id");
    console.log("this.urn ::", this.urlParam);
    this.user = new User();

    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, "online").pipe(mapTo(true)),
      fromEvent(window, "offline").pipe(mapTo(false))
    );
    this.networkStatus();
  }

  public networkStatus() {
    this.online$.subscribe((value) => {
      this.isOnline = value;
    });
  }

  ngOnInit(): void {
    console.log(this.urlParam);
    if (this.urlParam != "newLogin" && this.urlParam != null) {
      this.isThirdPartyLogin = true;
      this.otpGenerated = false;
      const headers = new HttpHeaders().set("InterceptorSkipHeader", "");
      this.http
        .get(environment.api + "public/" + this.urlParam, { headers: headers })
        .subscribe(
          (data: any) => {
            console.log(data);
            //&& data.username != null
            if (data.email != null) {
              this.dataService.setEmailAndFileOwner(
                data.email,
                data.username,
                data.linkId
              );
              console.log("data " + JSON.stringify(data));
              this.user.email = data.email;
              this.isDisabled = true;
              this.isThirdPartyLogin = true;
              this.otpGenerated = false;
              this.linkType = data.linkType;
              console.log("isThirdPartyLogin ", this.isThirdPartyLogin);
            } else {
              this.toastr.error("Entered OTP is not valid");
            }
          },
          (error) => {
            console.log("err", error);
            console.log("err", error.message);
            this.toastr.error(error.error.message, "Error");
            this.router.navigateByUrl("full/invalid");
          }
        );
    } else {
      console.log("Normal Login......");
      this.isNormalLogin = true;
    }

    /* localStorage.removeItem("t");
    localStorage.removeItem("a");
    localStorage.removeItem("g"); */
  }

  async onSubmit() {
    if (this.urlParam != "newLogin" && this.urlParam != null) {
      let data = {
        username: this.user.email,
        password: this.user.pwd,
        url: this.urlParam,
        linkType: this.linkType,
      };
      console.log(data);
      const headers = new HttpHeaders().set("InterceptorSkipHeader", "");
      this.http
        .post(environment.api + "public/auth", data, { headers: headers })
        .subscribe(
          (data: any) => {
            console.log(data);
            if (data) {
              //this.router.navigateByUrl("full/thirdPartyFileUpload");
              this.router.navigate(["full/thirdPartyFileUpload"], {
                state: { IdCode: data, LinkType: this.linkType },
              });
              localStorage.setItem("t", "a");
              localStorage.setItem("urlParam", this.urlParam);
              console.log("success");
            } else {
              this.toastr.error("Entered OTP is not valid", "Failed");
            }
          },
          (error) => {
            console.log("Error");
          }
        );
    } else {
      console.log(this.blockUI1);
      this.blockUI1.start("Checking Credentials ...");
      let data = {
        email: this.user.email,
        pwd: this.user.pwd,
      };
      console.log(data);
      if (this.isOnline) {
        if (data.email && data.pwd) {
          this.tokenService.getAccessToken(data.email, data.pwd).then(
            (res: any) => {
              this.blockUI1.stop();
              console.log("AccessToken::", res);
              this.cookieService.set("access_token", res.access_token);
              if (res.access_token) {
                this.loginService.getUserId(data).then((res: any) => {
                  console.log("ParentID ::", res);
                  console.log(
                    "LAST LOGOUT AND LOGIN ::",
                    res.last_login,
                    res.last_logOut
                  );
                  if (res.last_login && res.last_logOut) {
                    this.dataService.setLoggedInUserId(res.userId);
                    this.dataService.setUserRole(res.role);
                    this.dataService.setUsername(
                      res.firstName + " " + res.lastName
                    );
                    this.dataService.setLastLogin(res.last_login);
                    this.dataService.setLastLogout(res.last_logOut);
                    if (res.passwordExpiredOn != null) {
                      this.dataService.setPasswordExpiryNotification(
                        res.passwordExpiredOn
                      );
                    }
                    this.dataService.setAuth();
                    this.router.navigate(["main/dash"], {
                      state: { prevUrl: "login" },
                    });
                  } else {
                    this.dataService.setLoggedInUserId(res.userId);
                    this.dataService.setUsername(
                      res.firstName + " " + res.lastName
                    );
                    this.router.navigateByUrl("/full/changePassword");
                  }
                });
              } else {
                console.log("ERROR", res.status);
                if (res.status === 400) {
                  console.log("ERROR", res.status);
                  this.loginService
                    .getRemainingAttempts(data.email)
                    .then((res: any) => {
                      console.log(res);
                      if (res.status != null) {
                        this.attemptStatus = true;
                        this.hideHintButton = true;

                        this.attemptMessage = res.status;
                        if (
                          res.status === this.APP_CONSTANT.INACTIVE_USER_MSG
                        ) {
                          this.inactiveUser = true;
                        } else {
                          this.inactiveUser = false;
                        }
                      } else {
                        this.toastr.error(
                          "Invalid Credentials",
                          "Login Failed"
                        );
                        this.blockUI1.stop();
                      }
                    });
                  this.blockUI1.stop();
                } else if (res.status === 500) {
                  this.toastr.error("Something went wrong");
                }
              }
            },
            (error: any) => {
              console.log("error", error);
            }
          );
        } else {
          this.blockUI1.stop();
          this.toastr.warning("Please fill all required fields !");
        }
      } else {
        this.toastr.warning(
          "Please check internet connection and try again",
          "No Internet"
        );
        this.blockUI1.stop();
      }
    }
  }

  onOtpChange(event) {
    console.log(typeof event);
    console.log(event);
    // get Entered OTP
    this.user.pwd = event;
  }

  generateOTP() {
    console.log(this.urlParam);

    let data = { urn: this.urlParam };
    this.blockUI.start("Generating Passcode ...");
    const headers = new HttpHeaders().set("InterceptorSkipHeader", "");
    this.http
      .put(environment.api + "public/link/generate/otp", data, {
        headers: headers,
      })
      .subscribe(
        (resp: any) => {
          console.log(resp);
          this.otpGenerated = true;
          this.blockUI.stop();
          this.timer = true;
          this.enterOtp = false;
        },
        (error: any) => {
          console.log(error);
          this.blockUI.stop();
          this.toastr.warning(error.error.message);
        }
      );

    this.leftSideImg = "../../assets/secured-file-sharing.jpg";
  }

  enterOTP() {
    this.otpGenerated = true;
    this.enterOtp = false;
    this.regenOtp = true;
    this.leftSideImg = "../../assets/secured-file-sharing.jpg";
  }

  regenOTP() {
    console.log("regen otp");
    let data = { urn: this.urlParam };
    this.blockUI.start("Re-Generating Passcode ...");
    const headers = new HttpHeaders().set("InterceptorSkipHeader", "");
    this.countdownFinished = false;
    this.http
      .put(environment.api + "public/link/generate/otp", data, {
        headers: headers,
      })
      .subscribe((resp: any) => {
        console.log(resp);
        this.toastr.success("OTP shared to your mail id successfully");
        this.otpGenerated = true;
        this.blockUI.stop();
        this.countdownFinished = false;
        this.timer = true;
        this.countdown.restart();
        this.enterOtp = false;
      });
    // this.otpGenerated=false;
    // this.countdownFinished=false;
    // this.regenOtp=false;
    // this.timer=false;
    this.leftSideImg = "../../assets/secured-file-sharing.jpg";
  }

  regenOTP1() {
    this.regenOtp = false;
    this.regenOTP();
  }

  handleEvent(event) {
    console.log(event);
    if (event.action === "done") {
      this.countdownFinished = true;
    }
  }

  showHint() {
    let email = this.user.email;
    this.loginService.getPasswordHint(email).then((res) => {
      console.log(res);
      if (res.hint) {
        this.showHintMessage = res.hint;
        this.hideHintButton = false;
      } else {
        this.toastr.warning("No Hint Found");
      }
    });
  }
}
