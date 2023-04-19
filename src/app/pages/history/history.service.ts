import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: "root",
})
export class HistoryService {
  constructor(private http: HttpClient, private toastr: ToastrService) {}

  public getHistory(userId): Promise<any[]> {
    return new Promise((resolve) => {
      this.http.get(environment.api + "user/history/" + userId).subscribe(
        (resp: any[]) => {
          console.log("resp ::", resp);
          resolve(resp);
        },
        (error) => {
          console.log(error);
          resolve(error);
        }
      );
    });
  }

  public getHistoryForManager(): Promise<any[]> {
    return new Promise((resolve) => {
      this.http.get(environment.api + "manager/link/history").subscribe(
        (resp: any[]) => {
          console.log("resp ::", resp);
          resolve(resp);
        },
        (error) => {
          console.log(error);
          resolve(error);
        }
      );
    });
  }

  public getHistoryLinkDetails(type, vessel, descId): Promise<any[]> {
    console.log(
      "P1 ::",
      type + " -- " + "P2 ::",
      vessel + " -- " + "P3 ::",
      descId
    );
    console.log(encodeURIComponent(vessel));
    return new Promise((resolve) => {
      this.http
        .get(
          environment.api +
            "user/link/history/" +
            type +
            "/" +
            encodeURIComponent(vessel) +
            "/" +
            descId
        )
        .subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            console.log(error);
            this.toastr.warning(error.error.message);
            resolve([]);
          }
        );
    });
  }

  public getDescriptionData() {
    return new Promise((resolve) => {
      this.http.get(environment.api + "user/description").subscribe(
        (resp: any[]) => {
          console.log("resp ::", resp);
          resolve(resp);
        },
        (error) => {}
      );
    });
  }
}
