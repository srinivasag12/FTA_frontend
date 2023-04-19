import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root",
})
export class TokenServiceService {
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  public getAccessToken(username, password): Promise<any[]> {
    return new Promise((resolve) => {
      let params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      params.append("grant_type", "password");
      params.append("client_id", environment.IRI_CLIENT);

      let headers = new HttpHeaders({
        "Content-type": "application/x-www-form-urlencoded; charset=utf-8",
        Authorization:
          "Basic " +
          btoa(environment.IRI_CLIENT + ":" + environment.IRI_SECRET),
      }).set("InterceptorSkipHeader", "");

      this.http
        .post(environment.token_api + "oauth/token", params.toString(), {
          headers: headers,
        })
        .subscribe(
          (data: any) => {
            console.log(data);
            resolve(data);
          },
          (error) => {
            console.log(error);
            resolve(error);
            //this.toastr.error("Invalid Credentials","Login Failed ")
          }
        );
    });
  }
}
