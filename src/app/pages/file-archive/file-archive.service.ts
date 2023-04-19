import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DataService } from 'src/app/shared/services/data.service';

@Injectable({
  providedIn: 'root'
})
export class FileArchiveService {

  constructor(private http: HttpClient,
    private dataService: DataService) { }

  public getAllArchivedFiles(): Promise<any[]> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then(res => {
        this.http.get(environment.api + "user/file/archived/" + res).subscribe(
          (resp: any[]) => {
            console.log("resp ::", resp);
            resolve(resp);
          },
          (error) => {
            console.log(error);
            resolve(error);
          }
        );
      })
      
    })
  }

  public restoreFile(fileId): Promise<any[]> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then(res => {
        let userId=res;
      this.http
          .put(environment.api + "user/file/unarchived",{fileId,userId})
          .subscribe(
            (resp: any) => {
              resolve(resp);
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
            }
          );
      })
    });
  }

  /* Archive Folder (LINK)(For Upload link - approach 1)  */

  public linkArchive(linkId): Promise<any[]> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then(res => {
        let userId=res;
      this.http
          .put(environment.api + "user/link/archive",{userId,linkId})
          .subscribe(
            (resp: any) => {
              resolve(resp);
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
            }
          );
      })
    });
  }

  /* UN Archive Folder (LINK)(For Upload link - approach 1) */

  public linkUnArchive(linkId): Promise<any[]> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then(res => {
        let userId=res;
      this.http
          .put(environment.api + "user/link/unarchive",{userId,linkId})
          .subscribe(
            (resp: any) => {
              resolve(resp);
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
            }
          );
      })
    });
  }


  /* Archive Folder (For download link - approach 2) */

  public folderArchive(folderId): Promise<any[]> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then(res => {
        let userId=res;
      this.http
          .put(environment.api + "user/folder/archive",{userId,folderId})
          .subscribe(
            (resp: any) => {
              resolve(resp);
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
              resolve(error);
            }
          );
      })
    });
  }

  /* UN - Archive Folder (For download link - approach 2) */

  public folderUnArchive(folderId): Promise<any[]> {
    return new Promise((resolve) => {
      this.dataService.getLoggedInUserId().then(res => {
        let userId=res;
      this.http
          .put(environment.api + "user/folder/unarchive",{userId,folderId})
          .subscribe(
            (resp: any) => {
              resolve(resp);
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
              resolve(error);
            }
          );
      })
    });
  }



}




