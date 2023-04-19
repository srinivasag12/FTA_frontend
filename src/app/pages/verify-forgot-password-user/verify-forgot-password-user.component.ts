import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
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
import { ForgotPasswordService } from "./forgot-password.service";
import { fromEvent, merge, Observable, of } from "rxjs";
import { mapTo } from "rxjs/operators";
import { APP_CONSTANTS } from "src/app/shared/services/appConstants";
import { CountdownComponent } from "ngx-countdown";

export class User {
  email: string;
  pwd: string;
  userId: number;
  uniqueId: number;
}

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
  selector: "app-verify-forgot-password-user",
  templateUrl: "./verify-forgot-password-user.component.html",
  styleUrls: ["./verify-forgot-password-user.component.scss"],
})
export class VerifyForgotPasswordUserComponent implements OnInit {
  forgotPasswordUserForm: FormGroup;
  forgotPasswordOtpValidationForm: FormGroup;
  changePasswordForm: FormGroup;

  enteredUserName: any;

  step2: boolean;
  step1: boolean = true;
  step3: boolean;

  user: User;

  fieldTextTypeForPass: boolean;
  fieldTextTypeForConfPass: boolean;

  errorMatcher = new CrossFieldErrorMatcher();

  /* OTP UI CONFIG */
  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: "",
    inputStyles: {
      width: "50px",
      height: "50px",
    },
  };

  online$: Observable<boolean>;
  isOnline: boolean;

  APP_CONSTANT: any = APP_CONSTANTS;

  timer: boolean;
  countDownConfig = {
    leftTime: 900,
    notify: [2, 5],
    format: "mm:ss",
    demand: false,
  };
  countdownFinished: boolean = false;
  @ViewChild("cd", { static: false }) private countdown: CountdownComponent;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private forgetPwdService: ForgotPasswordService,
    private dataService: DataService,
    private router: Router,
    private location: Location,
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    /* User Form Initialise */
    this.user = new User();

    /* Form to get OTP for forgot password user */
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.forgotPasswordUserForm = this.fb.group({
      email: ["", [Validators.required, Validators.pattern(emailRegex)]],
    });

    /* Form to validate OTP for forgot password user */

    this.forgotPasswordOtpValidationForm = new FormGroup({
      email: new FormControl("", [Validators.required]),
      otp: new FormControl("", [Validators.required]),
    });

    /* Form to set new password */

    this.changePasswordForm = new FormGroup(
      {
        newPassword: new FormControl("", [
          Validators.required,
          Validators.pattern(
            /^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{8,30}$/
          ),
        ]),
        confirmNewPassword: new FormControl("", [Validators.required]),
        hint: new FormControl(""),
      },
      { validators: passwordMatchValidator }
    );

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

  ngOnInit(): void {}

  /* STEP-1  Generate Password Block */

  generateOtpForForgotPasswordUser() {
    console.log(this.forgotPasswordUserForm.valid);
    console.log(this.forgotPasswordUserForm.value);
    let isValid = this.forgotPasswordUserForm.valid;

    if (isValid) {
      let emailIdForForgotPwd = this.forgotPasswordUserForm.value.email.toLowerCase();
      console.log("emailIdForForgotPwd ::", emailIdForForgotPwd);

      this.forgetPwdService
        .generateOtpForForgetPasswordUser(emailIdForForgotPwd)
        .then((res: any) => {
          console.log(res);
          if (res.status != 500) {
            this.user.email = emailIdForForgotPwd;
            this.user.userId = res;

            this.step2 = true;
            this.timer = true;
            this.step1 = false;
          } else {
            this.toastr.error(res.error.message);
          }
        });
    } else {
      if (
        this.forgotPasswordUserForm.value.email === "" ||
        this.forgotPasswordUserForm.value.email === undefined
      ) {
        this.toastr.warning("Please enter email id");
      } else {
        this.toastr.warning("Please enter valid email id");
      }
    }
  }

  /* STEP -2   OTP Password Verification Block */

  validateOtp() {
    console.log(this.user);

    this.forgetPwdService
      .verifyOtpForForgetPwdUser(
        this.forgotPasswordUserForm.value.email.toLowerCase(),
        this.user.userId,
        this.user.pwd
      )
      .then((res: any) => {
        console.log(res);
        if (res != 0) {
          this.step2 = false;
          this.step3 = true;
          this.user.uniqueId = res;
        } else {
          if (this.countdownFinished) {
            this.toastr.warning(
              "Entered OTP got Expired ,Please regenerate the New OTP and Try"
            );
          } else {
            this.toastr.error("Invalid OTP");
          }
        }
      });
  }

  onOtpChange(event) {
    console.log(event);
    this.user.pwd = event;
  }

  regenOTP() {
    let emailIdForForgotPwd = this.forgotPasswordUserForm.value.email.toLowerCase();
    console.log("emailIdForForgotPwd ::", emailIdForForgotPwd);
    this.forgetPwdService
      .generateOtpForForgetPasswordUser(emailIdForForgotPwd)
      .then((res: any) => {
        console.log(res);
        if (res.status != 500) {
          this.toastr.success("OTP shared to your mail id successfully");
          this.countdownFinished = false;
          this.timer = true;
          this.countdown.restart();
        } else {
          this.toastr.error(res.error.message);
        }
      });
  }

  /* STEP -3  */

  onChangePasswordSubmit() {
    console.log(this.changePasswordForm.valid);
    console.log(this.changePasswordForm.value);
    console.log(this.user);

    let isNewPasswordFormValid = this.changePasswordForm.valid;

    if (isNewPasswordFormValid) {
      this.forgetPwdService
        .resetPassword(
          this.user.userId,
          this.user.uniqueId,
          this.changePasswordForm.value.newPassword,
          this.changePasswordForm.value.hint
        )
        .then((res: any) => {
          if (res) {
            this.toastr.success("Password rested sucessfully");
            this.router.navigateByUrl("/full/login/newLogin");
          } else {
            this.toastr.error("Something went wrong");
          }
        });
    } else if (
      this.changePasswordForm.value.newPassword !=
      this.changePasswordForm.value.confirmNewPassword
    ) {
      // this.toastr.warning("Passwords do not match");
    } else {
      this.toastr.warning("Please enter new password");
    }
  }

  toggleFieldTextTypeConfPass() {
    this.fieldTextTypeForConfPass = !this.fieldTextTypeForConfPass;
  }

  toggleFieldTextTypePass() {
    this.fieldTextTypeForPass = !this.fieldTextTypeForPass;
  }

  navigateToLogin() {
    this.location.back();
  }

  handleEvent(event) {
    console.log(event);
    if (event.action === "done") {
      this.countdownFinished = true;
    }
  }
}
