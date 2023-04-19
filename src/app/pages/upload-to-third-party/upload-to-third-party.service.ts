import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadToThirdPartyService {

  constructor(private http: HttpClient) { }

  getUploadedFilesList(folderId:any){
    //const headers = new HttpHeaders().set("InterceptorSkipHeader", '');
    return new Promise((resolve) => {
    this.http.get(environment.api + "user/uploaded/files/"+ folderId)
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

  removeFile(fileId){
    // const httpOptions = {
    //   headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    //   body: { 'fileId': fileId }
    // };
    return new Promise((resolve) => {
      this.http.delete(environment.api + "user/delete/file/"+fileId)
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

  removeFileAndCancelLink(fileId,downloadLinkId){
  
    return new Promise((resolve) => {
      this.http
          .put(environment.api + "user/remove/file",{downloadLinkId,fileId})
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


  removeSharedFile(fileId){
    // const httpOptions = {
    //   headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    //   body: { 'fileId': fileId }
    // };
    return new Promise((resolve) => {
      this.http.delete(environment.api + "user/remove/sharedfile/"+fileId)
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



  

}
