import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  constructor(private http: HttpClient) {}

  public getUserId(userData): Promise<any[]> {
    return new Promise((resolve) => {
      this.http.post(environment.api + "user/login", userData).subscribe(
        (data: any) => {
          console.log(data);
          resolve(data);
        },
        (err) => {
          console.log(err);
          resolve(err);
        }
      );
    });
  }

  public getRemainingAttempts(email): Promise<any> {
    const headers = new HttpHeaders().set("InterceptorSkipHeader", "");
    return new Promise((resolve) => {
      this.http
        .get(environment.api + "public/account/status/" + email, {
          headers: headers,
        })
        .subscribe(
          (resp: string) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            console.log("error ::", error);
          }
        );
    });
  }

  public getPasswordHint(email): Promise<any> {
    const headers = new HttpHeaders().set("InterceptorSkipHeader", "");
    return new Promise((resolve) => {
      this.http
        .get(environment.api + "public/account/hint/" + email, {
          headers: headers,
        })
        .subscribe(
          (resp: string) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            console.log("error ::", error);
          }
        );
    });
  }
}
