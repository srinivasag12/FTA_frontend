import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ForgotPasswordService {
  constructor(private router: Router, private http: HttpClient) {}

  /* Generate OTP Service  */

  public generateOtpForForgetPasswordUser(email): Promise<any[]> {
    const headers = new HttpHeaders().set("InterceptorSkipHeader", "");
    return new Promise((resolve) => {
      this.http
        .put(
          environment.api + "public/forget/password",
          { email: email },
          { headers: headers }
        )
        .subscribe(
          (resp: any) => {
            resolve(resp);
          },
          (error) => {
            resolve(error);
            console.log("Error" + JSON.stringify(error));
          }
        );
    });
  }

  /* Verify OTP Password  */

  public verifyOtpForForgetPwdUser(email, userId, otp): Promise<any[]> {
    let reqObj = {
      email: email,
      userId: userId,
      otp: otp,
    };

    console.log("verifyOtpForForgetPwdUser", reqObj);
    const headers = new HttpHeaders().set("InterceptorSkipHeader", "");

    return new Promise((resolve) => {
      this.http
        .put(environment.api + "public/verify/otp", reqObj, {
          headers: headers,
        })
        .subscribe(
          (resp: any) => {
            resolve(resp);
          },
          (error) => {
            resolve(error);
            console.log("Error" + JSON.stringify(error));
          }
        );
    });
  }

  /* Update New Password  */

  public resetPassword(userId, uniqueId, newPwd, hint): Promise<any[]> {
    let reqObj = {
      userID: userId,
      uniqueId: uniqueId,
      pwd: newPwd,
      hint: hint,
    };
    const headers = new HttpHeaders().set("InterceptorSkipHeader", "");

    console.log("resetPassword", reqObj);

    return new Promise((resolve) => {
      this.http
        .put(environment.api + "public/reset/password", reqObj, {
          headers: headers,
        })
        .subscribe(
          (resp: any) => {
            resolve(resp);
          },
          (error) => {
            resolve(error);
            console.log("Error" + JSON.stringify(error));
          }
        );
    });
  }
}
