import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ThirdPartyFileUploadService {

  constructor(private http: HttpClient,private tostr: ToastrService,) { }

  deleteUploadedFile(fileId,linkId,idCode){
  //   const httpOptions = {
  //     headers: new HttpHeaders({ 'Content-Type': 'application/json' }).set("InterceptorSkipHeader", ''), 
  //     body:{'fileId':fileId,'idCode':idCode,'linkId':linkId}
  // };
    const headers = new HttpHeaders().set("InterceptorSkipHeader", '');
    
    return new Promise((resolve) => {
      this.http.delete(environment.api + "public/file/"+idCode+'/'+linkId+'/'+fileId,{ headers: headers })
      .subscribe(
        (resp: Boolean) => {
          resolve(resp);
          

        },
        (error) => {
          console.log("Error" + JSON.stringify(error));
        }
      )
    })
  }

  getPrevUploadedFilesList(linkId:any){
    const headers = new HttpHeaders().set("InterceptorSkipHeader", '');
    return new Promise((resolve) => {
    this.http.get(environment.api + "public/prevUpload/"+ linkId,{ headers: headers })
    .subscribe(
      (resp: any) => {
        resolve(resp);
      },
      (error) => {
        console.log("Error" + JSON.stringify(error));
      }
    )
    })
  }

  public getFilePreview(fid): Promise<any[]> {
    const headers = new HttpHeaders().set("InterceptorSkipHeader", '');
    return new Promise((resolve) => {
        this.http.get(environment.api + "download/thirdparty/shared/file/preview/" + fid,{ headers: headers }).subscribe(
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

  public getFilePreviewForThirdpartyDownload(fid,linkId): Promise<any[]> {
    const headers = new HttpHeaders().set("InterceptorSkipHeader", '',);
    return new Promise((resolve) => {
        this.http.get(environment.api + "download/view/shared/file/preview/"+linkId+'/'+fid,{ headers: headers, }).subscribe(
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

  getSharedFilesList(linkId:any,idCode:any){
    const headers = new HttpHeaders().set("InterceptorSkipHeader", '');
    return new Promise((resolve) => {
    this.http.get(environment.api + "public/link/details/"+ linkId +"/"+idCode,{ headers: headers })
    .subscribe(
      (resp: any) => {
        resolve(resp);
      },
      (error) => {
        console.log("Error" + JSON.stringify(error));
      }
    )
    })
  }

  
}
