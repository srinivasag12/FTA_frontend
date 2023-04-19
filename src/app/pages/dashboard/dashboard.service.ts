import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { DataService } from "src/app/shared/services/data.service";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  isAdmin: boolean;
  isUser: boolean;

  constructor(private http: HttpClient, private dataService: DataService) {
    this.dataService.getUserRole().then((res) => {
      console.log(res);
      switch (res) {
        case 1:
          this.isAdmin = true;
          break;
        case 2:
          this.isUser = true;
          break;
      }
    });
  }

  /*  USERS DATA FOR DASHBOARD */
  /* =================================================================================== */

  // PIE CHART DATA

  async getPieChartData(UploadOrDownload) {
    return new Promise((resolve) => {
      let userId = localStorage.getItem("g");
      console.log(userId);
      this.dataService.getUserRole().then((res: any) => {
        console.log(res);
        if (UploadOrDownload === "U") {
          if (res === "2") {
            this.http
              .get(
                environment.api +
                  "dashboard/user/filecountbyvsl/" +
                  userId +
                  "/" +
                  1
              )
              .subscribe(
                (resp: any[]) => {
                  console.log("resp ::", resp);
                  resolve(resp);
                },
                (error) => {
                  console.log(error);
                }
              );
          } else {
            this.http
              .get(environment.api + "dashboard/manager/filecountbyvsl/" + 1)
              .subscribe(
                (resp: any[]) => {
                  console.log("resp ::", resp);
                  resolve(resp);
                },
                (error) => {
                  console.log(error);
                }
              );
          }
        } else if (UploadOrDownload === "D") {
          if (res === "2") {
            this.http
              .get(
                environment.api +
                  "dashboard/user/filecountbyvsl/" +
                  userId +
                  "/" +
                  0
              )
              .subscribe(
                (resp: any[]) => {
                  console.log("resp ::", resp);
                  resolve(resp);
                },
                (error) => {
                  console.log(error);
                }
              );
          } else {
            this.http
              .get(environment.api + "dashboard/manager/filecountbyvsl/" + 0)
              .subscribe(
                (resp: any[]) => {
                  console.log("resp ::", resp);
                  resolve(resp);
                },
                (error) => {
                  console.log(error);
                }
              );
          }
        }
      });
    });
  }

  // BAR CHART DATA

  async getBarChartData(UploadOrDownload) {
    return new Promise((resolve) => {
      let userId = localStorage.getItem("g");
      console.log(userId);
      this.dataService.getUserRole().then((res: any) => {
        console.log(res);
        if (UploadOrDownload === "U") {
          if (res === "2") {
            this.http
              .get(
                environment.api +
                  "dashboard/user/vslByInspectionType/" +
                  userId +
                  "/" +
                  1
              )
              .subscribe(
                (resp: any[]) => {
                  console.log("resp ::", resp);
                  resolve(resp);
                },
                (error) => {
                  console.log(error);
                }
              );
          } else {
            this.http
              .get(
                environment.api +
                  "dashboard/manager/vslByInspectionType" +
                  "/" +
                  1
              )
              .subscribe(
                (resp: any[]) => {
                  console.log("resp ::", resp);
                  resolve(resp);
                },
                (error) => {
                  console.log(error);
                }
              );
          }
        } else if (UploadOrDownload === "D") {
          if (res === "2") {
            this.http
              .get(
                environment.api +
                  "dashboard/user/vslByInspectionType/" +
                  userId +
                  "/" +
                  0
              )
              .subscribe(
                (resp: any[]) => {
                  console.log("resp ::", resp);
                  resolve(resp);
                },
                (error) => {
                  console.log(error);
                }
              );
          } else {
            this.http
              .get(
                environment.api +
                  "dashboard/manager/vslByInspectionType" +
                  "/" +
                  0
              )
              .subscribe(
                (resp: any[]) => {
                  console.log("resp ::", resp);
                  resolve(resp);
                },
                (error) => {
                  console.log(error);
                }
              );
          }
        }
      });
    });
  }

  // FOLDER NOT VIEWED LAST 15/30/45 DAYS

  /* UPLOAD */

  getFoldersNotViewedData(days, pageNo, pageSize) {
    return new Promise((resolve) => {
      let userId = localStorage.getItem("g");
      console.log(userId);
      this.dataService.getUserRole().then((res: any) => {
        console.log(res);
        if (res === "2") {
          this.http
            .get(
              environment.api +
                "dashboard/user/notviewdFolder/" +
                userId +
                "/" +
                days +
                "/" +
                pageNo +
                "/" +
                pageSize +
                "/" +
                1
            )
            .subscribe(
              (resp: any[]) => {
                console.log("resp ::", resp);
                resolve(resp);
              },
              (error) => {
                console.log(error);
              }
            );
        } else {
          this.http
            .get(
              environment.api +
                "dashboard/manager/notviewdFolder/" +
                days +
                "/" +
                pageNo +
                "/" +
                pageSize +
                "/" +
                1
            )
            .subscribe(
              (resp: any[]) => {
                console.log("resp ::", resp);
                resolve(resp);
              },
              (error) => {
                console.log(error);
              }
            );
        }
      });
    });
  }

  /* DOWNLOAD */

  getFoldersNotViewedDataForDownload(days, pageNo, pageSize) {
    return new Promise((resolve) => {
      let userId = localStorage.getItem("g");
      console.log(userId);
      this.dataService.getUserRole().then((res: any) => {
        console.log(res);
        if (res === "2") {
          this.http
            .get(
              environment.api +
                "dashboard/user/notviewdFolder/" +
                userId +
                "/" +
                days +
                "/" +
                pageNo +
                "/" +
                pageSize +
                "/" +
                0
            )
            .subscribe(
              (resp: any[]) => {
                console.log("resp ::", resp);
                resolve(resp);
              },
              (error) => {
                console.log(error);
                resolve([]);
              }
            );
        } else {
          this.http
            .get(
              environment.api +
                "dashboard/manager/notviewdFolder/" +
                days +
                "/" +
                pageNo +
                "/" +
                pageSize +
                "/" +
                0
            )
            .subscribe(
              (resp: any[]) => {
                console.log("resp ::", resp);
                resolve(resp);
              },
              (error) => {
                console.log(error);
                resolve([]);
              }
            );
        }
      });
    });
  }

  // FILE GOING TO DELETE IN LAST 15/30/45 DAYS

  public getFileGoingToDelete(days, pageNo, pageSize) {
    let userId = localStorage.getItem("g");
    return new Promise((resolve) => {
      this.http
        .get(
          environment.api +
            "dashboard/user/archieveFileToDelete/" +
            userId +
            "/" +
            days +
            "/" +
            pageNo +
            "/" +
            pageSize +
            "/" +
            1
        )
        .subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            resolve(error);
          }
        );
    });
  }

  public getFileGoingToDeleteForDownload(days, pageNo, pageSize) {
    let userId = localStorage.getItem("g");
    return new Promise((resolve) => {
      this.http
        .get(
          environment.api +
            "dashboard/user/archieveFileToDelete/" +
            userId +
            "/" +
            days +
            "/" +
            pageNo +
            "/" +
            pageSize +
            "/" +
            0
        )
        .subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            resolve([]);
          }
        );
    });
  }

  // RECENT RE-ASSIGN

  public getRecentReassign(pageNo, pageSize) {
    return new Promise((resolve) => {
      this.http
        .get(
          environment.api +
            "dashboard/manager/recentReassigned/" +
            pageNo +
            "/" +
            pageSize
        )
        .subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            resolve(error);
          }
        );
    });
  }

  /* =================================================================================== */

  /*  MANAGERS DATA FOR DASHBOARD */
  /* =================================================================================== */

  // PIE CHART DATA

  // BAR CHART DATA

  // FOLDER NOT VIEWED LAST 15/30/45 DAYS

  // FILE GOING TO DELETE IN LAST 15/30/45 DAYS

  /* =================================================================================== */

  public latestFileUploadedByThirdParty(userID, pageNumber): Promise<any[]> {
    console.log("userID", userID);
    console.log("pageNumber", pageNumber);

    return new Promise((resolve) => {
      let userId = userID;
      let pageSize = 4;
      let pageNo = pageNumber;
      this.http
        .get(
          environment.api +
            "user/dash/recent/files/" +
            userId +
            "/" +
            pageSize +
            "/" +
            pageNo
        )
        .subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            console.log("error", error);
            resolve([]);
            //this.router.navigateByUrl("login/newLogin");
          }
        );
    });
  }

  public latestFilesSharedToMe(): Promise<any[]> {
    return new Promise((resolve) => {
      let userId = 1012;
      let pageSize = 5;
      let pageNo = 0;
      this.http
        .get(
          environment.api +
            "user/dash/recent/shared/" +
            userId +
            "/" +
            pageSize +
            "/" +
            pageNo
        )
        .subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            //this.router.navigateByUrl("login/newLogin");
          }
        );
    });
  }

  public latestFileUploadUrlStatus(userID, pageNumber): Promise<any[]> {
    return new Promise((resolve) => {
      let userId = userID;
      let pageSize = 4;
      let pageNo = pageNumber;
      this.http
        .get(
          environment.api +
            "user/dash/recent/url/" +
            userId +
            "/" +
            pageSize +
            "/" +
            pageNo
        )
        .subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            console.log("error", error);
            resolve([]);
            //this.router.navigateByUrl("login/newLogin");
          }
        );
    });
  }
}
