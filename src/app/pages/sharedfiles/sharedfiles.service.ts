import { Injectable } from "@angular/core";
import { Promise } from "es6-promise";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { SharedData } from "./sharedfiles.model";
import { environment } from "../../../environments/environment";
import { DataService } from "../../shared/services/data.service";

import { Router } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: "root",
})
export class SharedfilesService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private dataService: DataService,
    private cookieService:CookieService,
    private tostr: ToastrService,
  ) {}

  public sendDownloadlink(email: string,vslInfor:any): Promise<Boolean> {
    console.log("email",email)
    console.log("vslInfor",vslInfor)
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then((id: number) => {
        let data = {
          email: email,
          userId: id,
          vesselName:vslInfor.vesselName,
          vesselOfficialNo:vslInfor.vesselOfficialNo,
          imoNo:vslInfor.vesselImoNo,
          desc:vslInfor.description,
          linkType:1,
          days:vslInfor.linkDurationDays
        };
        console.log("id " + JSON.stringify(data));
        console.log("data ",data);
         this.http
          .post(environment.api + "link/generate", data)
          .subscribe(
            (resp: Boolean) => {
              resolve(resp);
            },
            (error:any) => {
              resolve(false);
              console.log("Error" , error);
              this.tostr.warning(error.error.message, "Failed");
            
            }
          ); 
      });
    });
  }


  public generateLinkID(vesselName:any,vesselDescription:any,vesselOfficialNo:any,vesselImoNo:any): Promise<any> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then((id: number) => {
        let data ={
          "vessel":vesselName,
          "desc":vesselDescription,
          "userId":id,
          "imo":vesselImoNo,
          "vslOfficialNo":vesselOfficialNo
          }

          console.log(data)
      
        this.http
          .post(environment.api + "user/create/folder", data)
          .subscribe(
            (resp: any) => {
              resolve(resp);
            },
            (error:any) => {
              console.log("Error" , error);
              resolve(error)
            }
          ); 
      })
    });

  }

  public shareFilesToThirdParty(reqData:any): Promise<any> {
    console.log("Req Data ::",reqData)
    return new Promise((resolve) => {
      
        this.http
          .post(environment.api + "user/share/files", reqData)
          .subscribe(
            (resp: any) => {
              if(resp.length === 0){
                this.tostr.success("Files shared to third party users successfully ","File Shared");
              }              
              resolve(resp);
            },
            (error:any) => {
              console.log("Error" , error);
              resolve(error)
            }
          ); 
   
    });

  }


  public mergeFiles(reqData:any): Promise<any[]> {
    return new Promise((resolve) => {
      this.http
          .put(environment.api + "user/merge/files",reqData)
          .subscribe(
            (resp: any) => {
              this.tostr.success("File Merged Successfully ");
              resolve(resp);
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
            }
          );
    });
  }

  public getGeneratedLinkDetails(): Promise<any[]> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then((id: number) => {
        this.http.get(environment.api + "user/shared/folder/" + id+"/"+0+"/"+10).subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            //this.router.navigateByUrl("login/newLogin");
          }
        );
      });
    });
  }

  public getPendingDocsForReview(userId): Promise<any[]> {
    return new Promise((resolve) => {
        this.http.get(environment.api + "manager/user/links/"+userId).subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
           resolve(error)
          }
        );
     
    });
  }

  public getPendingFilesForReview(linkId): Promise<any[]> {
    return new Promise((resolve) => {
        this.http.get(environment.api + "manager/link/files"+"/"+linkId).subscribe(
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

  public getDescriptionData(){
    return new Promise((resolve) => {
      this.http.get(environment.api + "user/description").subscribe(
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


  public getAllUsers(){
    return new Promise((resolve) => {
      this.http.get(environment.api + "manager/users").subscribe(
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

  public getAllActiveUsers(){
    return new Promise((resolve) => {
      this.http.get(environment.api + "manager/a/users/").subscribe(
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


  public checkFileIsShared(fId){
    return new Promise((resolve) => {
      this.http.get(environment.api + "user/check/file/"+fId).subscribe(
        (resp: any[]) => {
          console.log("resp ::", resp);
          resolve(resp);
        },
        (error) => {
          console.log(error)
        }
      );
    });
  }





  public getUploadedFilesForThisLinkId(linkId){
    return new Promise((resolve) => {
      this.http.get(environment.api + "user/uploaded/files/" + linkId).subscribe(
        (resp: any[]) => {
          console.log("resp ::", resp);
          resolve(resp);
        },
        (error) => {
          resolve(error);
          //this.router.navigateByUrl("login/newLogin");
        }
      );
    })
  }




  public getFileDetails(): Promise<any[]> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then((id: number) => {
        this.http.get(environment.api + "user/files/shared/" + id).subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            resolve([])
          }
        );
      });
    });
  }

  public getSharedToThirdPartyDetails(): Promise<any[]> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then((id: number) => {
        this.http.get(environment.api + "user/sharedtothirdparty/" + id).subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            resolve(error)
          }
        );
      })
    })
  }

  public getSharedToThirdPartyDetailsForManger(userId): Promise<any[]> {
    return new Promise((resolve) => {
     
        this.http.get(environment.api + "user/sharedtothirdparty/" + userId).subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            resolve(error)
          }
        );
      })
   
  }

  public getFilePreview(fid): Promise<any[]> {
    return new Promise((resolve) => {
        this.http.get(environment.api + "download/user/shared/file/preview/" + fid).subscribe(
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

  public getUploadedFileDetails(pageNumber,filterOption): Promise<SharedData[]> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then((id: number) => {
        let pageNo=pageNumber;
        let pageSize=10;
    
        this.http.get(environment.api + "user/all/links/" + id +'/'+pageNo+'/'+pageSize+'/'+filterOption).subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            resolve([]);
            //this.router.navigateByUrl("login/newLogin");
            
          }
        );
      });
    });
  }


  public getDownloadLinkDetails(pageNumber,filterOption): Promise<SharedData[]> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then((id: number) => {
        let pageNo=pageNumber;
        let pageSize=10;
    
        this.http.get(environment.api + "user/all/downlink/" + id +'/'+pageNo+'/'+pageSize+'/'+filterOption).subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            resolve([]);
            //this.router.navigateByUrl("login/newLogin");
            
          }
        );
      });
    });
  }

  public updateViewStatus(linkIdArray): Promise<any[]> {

    return new Promise((resolve) => {
      this.http
          .put(environment.api + "user/link/view",{"linkArray":linkIdArray})
          .subscribe(
            (resp: any) => {
              resolve(resp);
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
            }
          );
    });
  }

  public reAssignTask(newUserId,linkId,loggedInUserId): Promise<any[]> {

    let reqObj={
      "loggedInUser":loggedInUserId,
      "newUser":newUserId,
      "linkId":linkId
    }

    return new Promise((resolve) => {
      this.http
          .put(environment.api + "manager/reassign",reqObj)
          .subscribe(
            (resp: any) => {
              resolve(resp);
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
            }
          );
    });
  }



}
