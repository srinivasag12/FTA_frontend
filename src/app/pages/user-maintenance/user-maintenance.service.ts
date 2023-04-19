import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class UserMaintenanceService {
  constructor(private http: HttpClient, private tostr: ToastrService) {}

  public getAllUsers(): Promise<any[]> {
    return new Promise((resolve) => {
      this.http.get(environment.api + "manager/all/users/").subscribe(
        (resp: any[]) => {
          resolve(resp);
        },
        (error) => {}
      );
    });
  }

  public getAllRoles(): Promise<any[]> {
    return new Promise((resolve) => {
      this.http.get(environment.api + "manager/all/roles/").subscribe(
        (resp: any[]) => {
          resolve(resp);
        },
        (error) => {}
      );
    });
  }

  public createUser(reqData: any): Promise<any> {
    return new Promise((resolve) => {
      this.http.post(environment.api + "manager/add/user", reqData).subscribe(
        (resp: any) => {
          resolve(resp);
        },
        (error: any) => {
          resolve(error);
        }
      );
    });
  }

  public updateUser(reqData: any): Promise<any> {
    return new Promise((resolve) => {
      this.http
        .put(environment.api + "manager/update/status", reqData)
        .subscribe(
          (resp: any) => {
            resolve(resp);
          },
          (error: any) => {
            resolve(error);
          }
        );
    });
  }

  public resetPasswordDefault(reqData: any): Promise<any> {
    return new Promise((resolve) => {
      this.http
        .put(environment.api + "manager/resetDefault/password", reqData)
        .subscribe(
          (resp: any) => {
            resolve(resp);
          },
          (error: any) => {
            resolve(error);
          }
        );
    });
  }


  public unlockUser(reqData: any): Promise<any> {
    return new Promise((resolve) => {
      this.http
        .put(environment.api + "manager/unlock/user", reqData)
        .subscribe(
          (resp: any) => {
            resolve(resp);
          },
          (error: any) => {
            resolve(error);
          }
        );
    });
  }
}
