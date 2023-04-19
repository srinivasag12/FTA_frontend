import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { ToastrService } from "ngx-toastr";
import { DataService } from "src/app/shared/services/data.service";
import { environment } from "src/environments/environment";
import { ChangePasswordService } from "./change-password.service";
import { fromEvent, merge, Observable, of } from "rxjs";
import { mapTo } from "rxjs/operators";
import { APP_CONSTANTS } from "src/app/shared/services/appConstants";
import { BlockUI, NgBlockUI } from "ng-block-ui";

export const passwordMatchValidator: ValidatorFn = (
  formGroup: FormGroup
): ValidationErrors | null => {
  return formGroup.get("newPassword").value ===
    formGroup.get("confirmNewPassword").value
    ? null
    : { passwordMismatch: true };
};

/** Error when the parent is invalid */
class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return control.dirty && form.invalid;
  }
}

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.scss"],
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  fieldTextTypeForCurrentPass: boolean;
  fieldTextTypeForPass: boolean;
  fieldTextTypeForConfPass: boolean;
  loggedInUserId: number;
  loggedInUserRole: string;
  loggedInUsername: any = null;
  errorMatcher = new CrossFieldErrorMatcher();
  isCurrentPwdInvalid: boolean = false;

  online$: Observable<boolean>;
  isOnline: boolean;

  @BlockUI() blockUI: NgBlockUI;

  APP_CONSTANT: any = APP_CONSTANTS;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private dataService: DataService,
    private router: Router,
    private location: Location,
    private http: HttpClient,
    private cookieService: CookieService,
    private changePasswordService: ChangePasswordService
  ) {
    this.changePasswordForm = new FormGroup(
      {
        currentPassword: new FormControl("", [Validators.required]),
        newPassword: new FormControl("", [
          Validators.required,
          Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z]).{8,30}$/),
        ]),
        confirmNewPassword: new FormControl("", [Validators.required]),
        passwordHint: new FormControl(""),
      },
      { validators: passwordMatchValidator }
    );

    this.dataService.getLoggedInUserId().then((res) => {
      console.log("Logged In User ID ::", res);
      this.loggedInUserId = res;
    });
    this.dataService.getUserRole().then((res: any) => {
      console.log("Logged In User Role ::", res);
      this.loggedInUserRole = res;
      console.log(typeof res);
    });

    /* Checking Internet connection */

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

  async ngOnInit() {
    await this.dataService.getUsername().then((res: any) => {
      console.log("Logged In User name ::", res);
      this.loggedInUsername = res;
    });
  }

  toggleFieldTextTypeConfPass() {
    this.fieldTextTypeForConfPass = !this.fieldTextTypeForConfPass;
  }

  toggleFieldTextTypePass() {
    this.fieldTextTypeForPass = !this.fieldTextTypeForPass;
  }

  toggleFieldTextTypeCurrentPass() {
    this.fieldTextTypeForCurrentPass = !this.fieldTextTypeForCurrentPass;
  }

  onChangePasswordSubmit() {
    console.log(this.changePasswordForm.value);
    this.isCurrentPwdInvalid = false;
    let reqObj = {
      userId: this.loggedInUserId,
      pwd: this.changePasswordForm.value.newPassword,
      oldPwd: this.changePasswordForm.value.currentPassword,
      pwdHint:
        this.changePasswordForm.value.passwordHint === ""
          ? null
          : this.changePasswordForm.value.passwordHint,
    };

    if (this.changePasswordForm.valid) {
      console.log("req data ::", reqObj);
      this.blockUI.start("Changing Password ...");
      if (reqObj.oldPwd != reqObj.pwd) {
        if (this.loggedInUserRole === "1") {
          console.log("Change Password For manager ...");
          this.changePasswordService
            .changePasswordForManager(reqObj)
            .then((res: any) => {
              console.log(res);
              if (res === true) {
                console.log("Password changed successfully");
                this.blockUI.stop();
                this.toastr.success("Password changed successfully");
                this.goBack();
              } else if (
                res.status === 500 &&
                res.error.message === "Invalid password"
              ) {
                this.isCurrentPwdInvalid = true;
                this.blockUI.stop();
                this.toastr.warning(res.error.message);
              }
            });
        } else if (this.loggedInUserRole === "2") {
          console.log("Change Password For user ...");
          this.changePasswordService
            .changePasswordForUser(reqObj)
            .then((res: any) => {
              console.log(res);
              if (res === true) {
                console.log("Password changed successfully");
                this.blockUI.stop();
                this.toastr.success("Password changed successfully");
                this.goBack();
              } else if (
                /* res.error.message === " Invalid password supply, please enter Correct old password" */
                res.status === 500 &&
                res.error.message === "Invalid password"
              ) {
                this.isCurrentPwdInvalid = true;
                this.blockUI.stop();
                /* this.toastr.warning(res.error.message); */
              }
            });
        } else if (this.loggedInUserRole === null) {
          console.log("Change Password For New User ...");
          this.changePasswordService
            .changePasswordForUser(reqObj)
            .then((res: any) => {
              console.log(res);
              if (res === true) {
                console.log("Password changed successfully");
                this.toastr.success("Password changed successfully");
                this.blockUI.stop();
                this.navigateToLogin();
              } else if (
                res.status === 500 &&
                res.error.message === "Invalid password"
              ) {
                this.isCurrentPwdInvalid = true;
                this.blockUI.stop();
                /* this.toastr.warning(res.error.message); */
              }
            });
        }
      } else {
        this.blockUI.stop();
        this.toastr.warning(
          "New password is same as old password , please provide new password"
        );
        this.changePasswordForm.get("newPassword").reset();
        this.changePasswordForm.get("confirmNewPassword").reset();
      }
    } else {
      this.toastr.warning("Please fill all required fields with valid details");
    }
  }

  goBack() {
    console.log("goBack ...");
    //this.signOut();
    if (!this.loggedInUserRole) {
      localStorage.removeItem("username");
    }

    this.location.back();
    // this.router.navigateByUrl("full/login/newLogin");
  }

  ngOnDestroy() {
    if (!this.loggedInUserRole) {
      localStorage.removeItem("username");
    }
  }

  navigateToLogin() {
    this.signOut();
    this.router.navigateByUrl("full/login/newLogin");
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
          this.router.navigateByUrl("full/login/newLogin");
        },
        (error) => {
          console.log("Error" + JSON.stringify(error));
        }
      );
    });
  }
}
