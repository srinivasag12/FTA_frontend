import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SharedUploadLinkService {

  constructor(private http: HttpClient) { }

  public updateLinkStatus(urn,status): Promise<any[]> {
    return new Promise((resolve) => {
      this.http
          .put(environment.api + "user/link/status",{urn,status})
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

  public updateDownloadLinkStatus(urn,status): Promise<any[]> {
    return new Promise((resolve) => {
      this.http
          .put(environment.api + "user/downlink/status",{urn,status})
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

  public cancelRequest(urn): Promise<any[]> {
    return new Promise((resolve) => {
      this.http
          .put(environment.api + "user/link/cancel",{urn})
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



  public extendLinkValidity(urn,days): Promise<any[]> {
    return new Promise((resolve) => {
      this.http
          .put(environment.api + "user/link/ext",{urn,days})
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

  public extendDownloadLinkValidity(urn,days): Promise<any[]> {
    return new Promise((resolve) => {
      this.http
          .put(environment.api + "user/downlink/ext",{urn,days})
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

  public generateNewPasscode(urn): Promise<any[]> {
    let data={"urn":urn}
    return new Promise((resolve) => {
      this.http
          .put(environment.api + "user/link/regen",data)
          .subscribe(
            (resp: any) => {
              resolve(resp);
            },
            (error) => {
              resolve(error)
              console.log("Error" + JSON.stringify(error));
            }
          );
    });
  }


}
