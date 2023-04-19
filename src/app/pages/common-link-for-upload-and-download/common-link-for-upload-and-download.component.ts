import { Component, OnInit, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { DataService } from 'src/app/shared/services/data.service';
import { ToastrService } from 'ngx-toastr';
import { UploadToThirdPartyService } from '../upload-to-third-party/upload-to-third-party.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FileUploadModel } from '../third-party-file-upload/third-party-file-upload.component';
import { environment } from 'src/environments/environment';
import { map, tap, last, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-common-link-for-upload-and-download',
  templateUrl: './common-link-for-upload-and-download.component.html',
  styleUrls: ['./common-link-for-upload-and-download.component.scss']
})

export class CommonLinkForUploadAndDownloadComponent implements OnInit {

  /* OLD PROP */
  isUploadBtnClicked:boolean=true;
  isSubmitBtnClicked:boolean=true;

  scanningFnEnable:boolean=true;
  uploadingFnEnable:boolean=false;

  public files: Array<FileUploadModel> = [];
  flip = false;
  email: string = "";
  emailBy: string = "";
  dataSource:any = [];

  fileToBeUploaded: any;
  isProgressCompleted: boolean;
  folderId: any;
  uploadedFilesArray: any=[];
  idCode: any;
  virusBackCard: boolean;
  completeBackCard: boolean;
  errorFilesArray: any=[];
  userId: number;
  /* OLD PROP */
  
  constructor(
    private _http: HttpClient,
    private dataService: DataService,
    private tostr: ToastrService,
    private changeDetectorRef: ChangeDetectorRef,
    private uploadThirdPartyService:UploadToThirdPartyService,
    private router: Router,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
  ) { }

  ngOnInit(): void {
    this.dataService.getLoggedInUserId().then(res => {
      this.userId=res;
    });
  }

  // onClick() {
  //   console.log('onClick...')
  //   let fileUpload = document.getElementById(
  //     "fileUpload"
  //   ) as HTMLInputElement;
  //   fileUpload.onchange = () => {
  //     for (let index = 0; index < fileUpload.files.length; index++) {
  //       const file = fileUpload.files[index];
  //       console.log(file);
  //       if(this.uploadedFilesArray.indexOf(file.name)!==-1){
  //           this.tostr.error(file.name+ " already Uploaded","Duplicate File");
            
  //       }
  //       else{
  //         this.files.push({
  //           data: file,
  //           state: "in",
  //           inProgress: false,
  //           progress: 0,
  //           canRetry: false,
  //           canCancel: true,
  //         });
  //       }
        
  //     }
  //     this.uploadFiles();
  //   };
  //   fileUpload.click();
  // }

  // cancelFile(file: FileUploadModel) {
  //   file.sub.unsubscribe();
  //   this.removeFileFromArray(file);
  // }

  // retryFile(file: FileUploadModel,index) {
  //   this.uploadFile(file,index);
  //   file.canRetry = false;
  // }

  // private uploadFile(file: FileUploadModel,index) {
  //   console.log("email", this.emailBy,"fileOwner", this.email);
  //   console.log("File",file.data);
  //   const fd = new FormData();
  //   let folderId=this.folderId;
  //   console.log(folderId)
  //   fd.append("file",file.data);
  //   fd.append("fileOwner", this.userId.toString());
  //   fd.append("folderId",folderId.toString());
  //   const headers = new HttpHeaders().set("InterceptorSkipHeader", '');
  //   const req = new HttpRequest("POST", environment.api + "user/upload/file", fd, {
  //     reportProgress: true,
  //   });

  //   file.inProgress = true;
  //   file.sub = this._http
  //     .request(req)
  //     .pipe(
  //       map((event) => {
  //         switch (event.type) {
  //           case HttpEventType.UploadProgress:
  //             file.progress = Math.round((event.loaded * 100) / event.total);
  //             break;
  //           case HttpEventType.Response:
  //             return event;
  //         }
  //       }),
  //       tap((message) => {}),
  //       last(),
  //       catchError((error: HttpErrorResponse) => {
  //         console.log("error",error)
  //         console.log("file",file);
  //         this.errorFilesArray.push(file.data.name);
  //         console.log("this.errorFilesArray",this.errorFilesArray)
  //         file.inProgress = false;
  //         file.canRetry = false;
          
  //         this.isSubmitBtnClicked=true;
  //         this.isProgressCompleted=true;
  //         this.removeFileFromArray(file);
  //         if(error.error.msg==='Virus Detected'){
  //           this.flip=true;
  //           this.virusBackCard=true;
  //           this.completeBackCard=false;
  //           this.tostr.error(error.error.msg, error.error.operation);
  //         }
  //         else{
  //           this.tostr.error("Something happend , Failed to upload files", "Failed");
  //         }
         
  //         return of(`${file.data.name} upload failed.`);
  //       })
  //     )
  //     .subscribe((event: any) => {
  //       console.log(event,index);
  //       console.log(this.dataSource[index]);
  //       console.log(this.dataSource[index]);

  //       if (typeof event === "object") {
  //         console.log(this.dataSource[index]);
  //         this.removeFileFromArray(file);
  //         new EventEmitter<string>().emit(event.body);
  //       }

  //       this.onFileComplete(event);
  //     });
  // }

  // public reUpload(){
  //   console.log('reupload',this.flip);
  //   this.errorFilesArray=[];
  //   this.flip=!this.flip;
   
  // }

  // private uploadFiles() {
  //   console.log('uploadFiles ...');
  //   console.log('fileToBeUploaded',this.fileToBeUploaded)
  //    this.isSubmitBtnClicked=false;
  //   this.isUploadBtnClicked=true;
  //   let fileUpload = document.getElementById(
  //     "fileUpload"
  //   ) as HTMLInputElement;
  //   fileUpload.value = "";

    

  //   this.files.forEach((file,index) => {
  //     console.log("file details",file);
  //     this.uploadFile(file,index);
  //     console.log("uploadedFiles",index) 
  //   })
  // }

  // private removeFileFromArray(file: FileUploadModel) {
  //   console.log("removeFileFromArray",file);
  //   const index = this.files.indexOf(file);
  //   if (index > -1) {
  //     this.files.splice(index, 1);
  //   }
  // }


  // onFileChange(files) {
  //   console.log('onFileChange...')
  //   for (var i = 0; i < files.length; i++) {
  //     console.log(files[i]);
  //   }
  // }

  // onFileComplete(evt: any) {

  //   console.log("evt ::",evt);
    
  //   if (evt.body.operation === "Success") {
  //     this.isProgressCompleted=true;
  //     this.isSubmitBtnClicked=true;
  //     this.tostr.success(evt.body.msg, "Uploaded");
  //     this.ngOnInit();

      
  //   } else {
  //     this.isProgressCompleted=true;
  //     this.isSubmitBtnClicked=true;
  //     this.tostr.error(evt.body.msg, "Failed to Upload");
  //   }
  // }


}
