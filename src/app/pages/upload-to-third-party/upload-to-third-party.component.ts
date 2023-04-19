import {
  Component,
  OnInit,
  ChangeDetectorRef,
  EventEmitter,
  ViewChild,
  TemplateRef,
  NgZone,
} from "@angular/core";
import { Router } from "@angular/router";
import { Subscription, of, Observable, fromEvent, merge } from "rxjs";
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpEventType,
  HttpErrorResponse,
} from "@angular/common/http";
import { DataService } from "src/app/shared/services/data.service";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";
import { map, tap, last, catchError, mapTo } from "rxjs/operators";
import { UploadToThirdPartyService } from "./upload-to-third-party.service";
import { keyvalue, mimeType } from "../sharedfiles/sharedfiles.model";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ThirdPartyFileUploadService } from "../third-party-file-upload/third-party-file-upload.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { DomSanitizer } from "@angular/platform-browser";
import * as moment from "moment";
import { Location } from "@angular/common";

export class FileUploadModel {
  data: File;
  state: string;
  inProgress: boolean;
  progress: number;
  isCompress: boolean;
  canRetry: boolean;
  canCancel: boolean;
  sub?: Subscription;
}

export interface UploadedData {
  type: string;
  name: string;
  sharedDate: string;
  fileSize: string;
  id: string;
  email: string;
}

@Component({
  selector: "app-upload-to-third-party",
  templateUrl: "./upload-to-third-party.component.html",
  styleUrls: ["./upload-to-third-party.component.scss"],
})
export class UploadToThirdPartyComponent implements OnInit {
  displayedColumns: string[] = [
    "type",
    "name",
    "sharedDate",
    "fileSize",
    "preview",
    "remove",
  ];

  urlProps: any;

  /* OLD PROP */
  isUploadBtnClicked: boolean = true;
  isSubmitBtnClicked: boolean = true;

  scanningFnEnable: boolean = true;
  uploadingFnEnable: boolean = false;

  public files: Array<FileUploadModel> = [];
  flip = false;
  email: string = "";
  emailBy: string = "";
  dataSource: any = [];

  fileToBeUploaded: any;
  isProgressCompleted: boolean;
  folderId: any;
  uploadedFilesArray: any = [];
  idCode: any;
  virusBackCard: boolean;
  completeBackCard: boolean;
  errorFilesArray: any = [];
  userId: number;
  supportedFormatsArr = [
    "jpeg",
    "jpg",
    "png",
    "pdf",
    "doc",
    "docx",
    "xlsx",
    "zip",
    "rar",
    "7z",
    "gz",
    "archive",
    "pps",
    "ppt",
    "pptx",
    "xlsm",
    "xls",
    "txt",
    "mp4",
    "mkv",
    "flv",
    "mov",
    "avi",
    "wmv",
    "3gp",
    "aac",
    "aac",
    "mp3",
    "m4b",
    "m4p",
    "ogg",
    "oga",
    "wma",
    "wmv",
  ];
  /* OLD PROP */

  isOnline: boolean;
  @BlockUI() blockUI: NgBlockUI;

  @ViewChild("cancelModal") cancelModalTemplate: TemplateRef<HTMLElement>;
  isDuplicateFileUploaded: boolean;
  online$: Observable<boolean>;

  /* Preview Props */

  @ViewChild("preview") previewTemplate: TemplateRef<HTMLElement>;
  url: any;
  blob_url: string;
  tryDoctype: any;
  archivedFilesArray: any = [];

  constructor(
    private _http: HttpClient,
    private dataService: DataService,
    private tostr: ToastrService,
    private changeDetectorRef: ChangeDetectorRef,
    private uploadThirdPartyService: UploadToThirdPartyService,
    private router: Router,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private thirdPartyService: ThirdPartyFileUploadService,
    private sanitizer: DomSanitizer,
    readonly ngZone: NgZone,
    private location: Location
  ) {
    /* let navigationExtras=this.router.getCurrentNavigation().extras.state;
    this.urlProps=navigationExtras.uploadProp; 
    console.log("URL PROPS ::",this.urlProps);

    this.folderId=this.urlProps.folderId;
    */

    let folderId = localStorage.getItem("folderId");
    this.folderId = folderId;

    this.dataService.setNavbarTitle("Share To Third Party File Upload");

    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, "online").pipe(mapTo(true)),
      fromEvent(window, "offline").pipe(mapTo(false))
    );

    this.networkStatus();
  }

  ngOnInit(): void {
    this.dataService.getLoggedInUserId().then((res) => {
      this.userId = res;
    });
    this.uploadThirdPartyService
      .getUploadedFilesList(this.folderId)
      .then((res: any) => {
        console.log("Uploaded Files ::", res);
        this.uploadedFilesArray = res.uploadedFiles.map((res) => res.name);
        console.log(this.uploadedFilesArray);
        this.archivedFilesArray = res.archieveFiles;
        //this.dataSource=res;
        let data = res.uploadedFiles;
        for (let i = 0; i < data.length; i++) {
          data[i].type = this.getValueFromKey(data[i].type);
          // data[i].sharedDate = moment(data[i].sharedDate).format(
          //   "DD-MMM-YYYY HH:MM"
          // );
          data[i].sharedDate = moment(data[i].sharedDate).toString();

          let sizeAbc = data[i].fileSize + "";
          let lnt = sizeAbc.length;
          if (lnt > 6) {
            data[i].fileSize =
              (Number(sizeAbc) / (1024 * 1024) + "").substring(0, 5) + "MB";
          } else {
            data[i].fileSize =
              (Number(sizeAbc) / 1024 + "").substring(0, 5) + "KB";
          }
        }

        this.dataSource = data;
      });
  }

  ngOnDestroy() {
    localStorage.removeItem("folderId");
  }

  public networkStatus() {
    this.online$.subscribe((value) => {
      this.isOnline = value;
    });
  }

  async openPreviewModal(fileId, fileType) {
    console.log(fileId, fileType);
    let mimeTypeValue = this.getValueFromMIME(fileType);
    console.log("mimeTypeValue", mimeTypeValue);
    if (mimeTypeValue != "unsupported") {
      this.blockUI.start("Please wait , File is loading ...");
      await this.thirdPartyService.getFilePreview(fileId).then((res: any) => {
        console.log(res);
        this.url = this.b64toBlob(res.fileData, mimeTypeValue);
        console.log(this.url);
        this.blob_url = URL.createObjectURL(this.url);
        console.log(this.blob_url);
        this.tryDoctype = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.blob_url
        );
        if (this.tryDoctype != undefined) {
          this.blockUI.stop();
        }
        console.log("base64", this.tryDoctype);
      });

      this.ngZone.run(() => {
        this.dialog.open(this.previewTemplate, {
          height: "600px",
          width: "800px",
          data: {
            title: "previewww",
          },
        });
      });
    } else {
      this.downloadfile(fileId);
    }
  }

  b64toBlob(dataURI, fileType) {
    console.log(fileType);
    console.log(this.getValueFromMIME(fileType));

    let mimeTypeValue = this.getValueFromMIME(fileType);

    var byteString = window.atob(dataURI);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: fileType });
  }

  downloadfile(fileID) {
    console.log(fileID);
    console.log(environment.api + "download/thirdparty/shared/file/" + fileID);
    window.open(
      environment.api + "download/thirdparty/shared/file/" + fileID,
      "_blank"
    );
  }

  getValueFromMIME(key: string): string {
    console.log(key);
    for (let index = 0; index < mimeType.length; index++) {
      if (key == mimeType[index].type) {
        return mimeType[index].value;
      }
    }
    return "unsupported";
  }

  getValueFromKey(key: string): string {
    console.log(key);
    for (let index = 0; index < keyvalue.length; index++) {
      if (key == keyvalue[index].type) {
        return keyvalue[index].value;
      }
    }
    return "extension";
  }

  goToThirdPartyPage() {
    //this.router.navigate(['main/sharedfiles'],{ state: { prevUrl: "uploadToThirdParty" } });
    //this.router.navigateByUrl("..");
    this.location.back();
  }

  cancelLink(data) {
    console.log(data);
  }

  onClick() {
    console.log("onClick...");
    let fileUpload = document.getElementById("fileUpload") as HTMLInputElement;
    fileUpload.onchange = () => {
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];
        console.log(file);
        let FileSize = file.size / 1024 / 1024; // in MB
        console.log("FileSize", FileSize);

        let file_name_array = file.name.split(".");
        let file_extension = file_name_array[
          file_name_array.length - 1
        ].toLowerCase();
        console.log("FILE EXTENSION >>>", file_extension);
        console.log(
          "FILE SUPPORTED",
          this.supportedFormatsArr.includes(file_extension)
        );

        if (this.supportedFormatsArr.includes(file_extension)) {
          if (FileSize < 1024) {
            if (this.uploadedFilesArray.indexOf(file.name) !== -1) {
              //this.isSubmitBtnClicked=true;
              this.tostr.warning(file.name + " file name already exist");
              this.isDuplicateFileUploaded = true;
            } else if (
              this.archivedFilesArray.length > 0
                ? this.archivedFilesArray.indexOf(file.name) !== -1
                : false
            ) {
              this.tostr.warning(
                file.name +
                  " file name already exist in archived files, if required please restore from archived files"
              );
              this.isDuplicateFileUploaded = true;
            } else {
              this.isDuplicateFileUploaded = false;
              this.files.push({
                data: file,
                state: "in",
                inProgress: false,
                progress: 0,
                isCompress: false,
                canRetry: false,
                canCancel: true,
              });
            }
          } else {
            this.tostr.warning("File size exceeds 1 GB");
            this.isDuplicateFileUploaded = true;
          }
        } else {
          this.tostr.warning(
            file_extension + " file type format not supported"
          );
          this.isDuplicateFileUploaded = true;
        }
      }
      this.uploadFiles();
    };
    fileUpload.click();
  }

  cancelFile(file: FileUploadModel) {
    file.sub.unsubscribe();
    this.removeFileFromArray(file);
  }

  retryFile(file: FileUploadModel) {
    this.uploadFile(file);
    file.canRetry = false;
  }

  private uploadFile(file: FileUploadModel) {
    console.log("email", this.emailBy, "fileOwner", this.email);
    console.log("File", file.data);
    const fd = new FormData();
    let folderId = this.folderId;
    console.log(folderId);
    fd.append("file", file.data);
    fd.append("fileOwner", this.userId.toString());
    fd.append("folderId", folderId.toString());
    const headers = new HttpHeaders().set("InterceptorSkipHeader", "");
    const req = new HttpRequest(
      "POST",
      environment.api + "user/upload/file",
      fd,
      {
        reportProgress: true,
      }
    );

    file.inProgress = true;
    file.sub = this._http
      .request(req)
      .pipe(
        map((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              file.progress = Math.round((event.loaded * 100) / event.total);
              console.log("Live progress -->", file.progress);
              if (event.total === event.loaded) {
                file.inProgress = false;
                file.isCompress = true;
                break;
              }
              break;
            case HttpEventType.Response:
              return event;
          }
        }),
        tap((message) => {}),
        last(),
        catchError((error: HttpErrorResponse) => {
          console.log("error", error);
          console.log("file", file);

          console.log("this.errorFilesArray", this.errorFilesArray);
          file.inProgress = false;
          file.isCompress = false;
          file.canRetry = false;

          this.isSubmitBtnClicked = true;
          this.isProgressCompleted = true;
          this.removeFileFromArray(file);
          if (error.error.msg === "Virus Detected") {
            this.flip = true;
            this.virusBackCard = true;
            this.errorFilesArray.push(file.data.name);
          } else if (error.error.msg.includes("File format not supported")) {
            console.log("FILE NOT SUPPORT >>>", error.error.msg);
            this.tostr.warning(error.error.msg);
          } else {
            file.canRetry = true;
            console.log("OTHER >>>", error.error.message);
            this.tostr.show("something went wrong", error.error.message);
          }

          this.completeBackCard = false;
          //this.tostr.error(error.error.msg, error.error.operation);

          return of(`${file.data.name} upload failed.`);
        })
      )
      .subscribe((event: any) => {
        file.isCompress = false;
        console.log(event);
        //console.log(this.dataSource[index]);
        //this.dataSource[index].fileId=event.body.fileId;
        //console.log(this.dataSource[index]);

        if (typeof event === "object") {
          //console.log(this.dataSource[index]);
          this.removeFileFromArray(file);
          new EventEmitter<string>().emit(event.body);
        }

        this.onFileComplete(event);
      });
  }

  public reUpload() {
    console.log("reupload", this.flip);
    this.errorFilesArray = [];
    this.flip = !this.flip;
    // this.virusBackCard=false;
    // this.completeBackCard=true;
  }

  private uploadFiles() {
    console.log("uploadFiles ...");
    console.log("fileToBeUploaded", this.fileToBeUploaded);

    if (this.isDuplicateFileUploaded) {
      this.isSubmitBtnClicked = true;
    } else {
      this.isSubmitBtnClicked = false;
    }

    this.isUploadBtnClicked = true;
    let fileUpload = document.getElementById("fileUpload") as HTMLInputElement;
    fileUpload.value = "";

    // this.files.forEach((file) => {
    //   console.log("file :: ",file);
    //   let sizeAbc = file.data.size+"";
    //   let lnt = sizeAbc.length;
    //   let size;
    //   if (lnt > 6) {
    //    size =
    //       (Number(sizeAbc) / (1024 * 1024) + "").substring(0, 5) + "MB";
    //   } else {
    //    size =
    //       (Number(sizeAbc) / 1024 + "").substring(0, 5) + "KB";
    //   }

    //   console.log("size ",size)
    //   this.dataSource.push({
    //     icon: "insert_photo",
    //     name: file.data.name,
    //     uploadedDate: "January 1,2020",
    //     uploadedBy: "Test",
    //     fileSize: size,
    //     fileData:file
    //   });

    //   console.log("Data source " + JSON.stringify(this.dataSource));
    //   this.dataSource = [...this.dataSource];
    // });

    this.files.forEach((file, index) => {
      console.log("file details", file);

      this.uploadFile(file);

      console.log("uploadedFiles", index);
    });
  }

  private removeFileFromArray(file: FileUploadModel) {
    console.log("removeFileFromArray", file);
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

  onFileChange(files) {
    console.log("onFileChange...");
    for (var i = 0; i < files.length; i++) {
      console.log(files[i]);
      //this.fileToBeUploaded.push(files[i]);
    }
  }

  onFileComplete(evt: any) {
    console.log("evt ::", evt);

    if (evt.body.operation === "Success") {
      this.isProgressCompleted = true;
      console.log("Files Remaining ", this.files.length);
      if (this.files.length === 0) {
        this.isSubmitBtnClicked = true;
      }
      //"Uploaded"
      this.tostr.success(evt.body.msg);
      this.ngOnInit();

      //this.getPreviousUploadedData(this.folderId)
      //this.flip=true;
    } else {
      this.isProgressCompleted = true;
      this.isSubmitBtnClicked = true;
      this.tostr.error(evt.body.msg, "Failed to Upload");
      //this.flip=true;
    }
  }

  openCancelModal(file) {
    console.log(file);
    this.dialog.open(this.cancelModalTemplate, {
      data: { fileId: file.id },
    });
  }

  fileRemove(file) {
    console.log(file);
    this.uploadThirdPartyService.removeFile(file.fileId).then((res) => {
      console.log(res);
      this.tostr.success("File Removed successfully");
      this.ngOnInit();
      this.changeDetectorRef.detectChanges();
      this.close();
    });
  }

  close() {
    this.dialog.closeAll();
  }
}
