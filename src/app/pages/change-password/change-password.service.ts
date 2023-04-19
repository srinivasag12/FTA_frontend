import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { DataService } from 'src/app/shared/services/data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {

  constructor(private http: HttpClient) { }

  public changePasswordForUser(reqObj): Promise<any[]> {
    return new Promise((resolve) => {
      this.http
          .put(environment.api + "user/change/password",reqObj)
          .subscribe(
            (resp: any) => {
              resolve(resp);
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
              resolve(error)
            }
          );
    });
  }

  public changePasswordForManager(reqObj): Promise<any[]> {
    return new Promise((resolve) => {
      this.http
          .put(environment.api + "manager/change/password",reqObj)
          .subscribe(
            (resp: any) => {
              resolve(resp);
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
              resolve(error)
            }
          );
    });
  }

  
}
