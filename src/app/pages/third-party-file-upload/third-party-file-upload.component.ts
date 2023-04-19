import {
  Component,
  OnInit,
  EventEmitter,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
  NgZone,
} from "@angular/core";
import { fromEvent, merge, Observable, Subscription } from "rxjs";
import {
  HttpRequest,
  HttpClient,
  HttpEventType,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { of } from "rxjs/observable/of";
import { catchError, last, map, mapTo, tap } from "rxjs/operators";
import { DataService } from "../../shared/services/data.service";
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../environments/environment";
import { ThirdPartyFileUploadService } from "./third-party-file-upload.service";
import { MatTable } from "@angular/material/table";
import { keyvalue, mimeType } from "../sharedfiles/sharedfiles.model";
import { Router } from "@angular/router";
import { SharedfilesService } from "../sharedfiles/sharedfiles.service";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { NgBlockUI, BlockUI } from "ng-block-ui";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import * as moment from "moment";
import { APP_CONSTANTS } from "src/app/shared/services/appConstants";

export interface SharingData {
  icon: string;
  name: string;
  uploadedDate: string;
  uploadedBy: string;
  fileSize: string;
  fileId: string;
}

// const FILE_DATA: SharingData[] = [
//   {
//     icon: "insert_photo",
//     name: "Sample.jpg",
//     uploadedDate: "January 1,2020",
//     uploadedBy: "b.jagan@bsolsystems.com",
//     fileSize: "2 MB",
//   },
// ];

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

@Component({
  selector: "app-third-party-file-upload",
  templateUrl: "./third-party-file-upload.component.html",
  styleUrls: ["./third-party-file-upload.component.scss"],
})
export class ThirdPartyFileUploadComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    "icon",
    "name",
    "sharedDate",
    "fileSize",
    "remove",
    "preview",
  ];

  @ViewChild("table") table: MatTable<any>;
  @ViewChild("preview") previewTemplate: TemplateRef<HTMLElement>;
  @ViewChild("fileRemoveModal")
  fileRemoveModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild("complete") completeModalTemplate: TemplateRef<HTMLElement>;
  @BlockUI() blockUI: NgBlockUI;

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
  linkId: any;
  uploadedFilesArray: any = [];
  idCode: any;
  virusBackCard: boolean;
  completeBackCard: boolean;
  errorFilesArray: any = [];
  linkType: any;
  uploadListCaption: string;
  url: any;
  blob_url: string;
  tryDoctype: any;
  isDuplicateFileUploaded: boolean;
  isCompleteBtnEnable: boolean;
  daysLeftToExpiryUploadLink: any;
  vesselName: any;
  description: any;
  vesselImoNo: any;
  vesselOfficialNo: any;
  noFilesUploaded: boolean;
  downloadExpiryDate: any;
  downloadSharedList: boolean;

  isOnline: boolean;
  online$: Observable<boolean>;
  temp: boolean;

  horizontalPosition: MatSnackBarHorizontalPosition = "end";
  verticalPosition: MatSnackBarVerticalPosition = "top";
  urlParam: string;

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

  APP_CONSTANT: any = APP_CONSTANTS;

  constructor(
    private _http: HttpClient,
    private dataService: DataService,
    private tostr: ToastrService,
    private changeDetectorRef: ChangeDetectorRef,
    private thirdPartyService: ThirdPartyFileUploadService,
    private router: Router,
    private service: SharedfilesService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private sanitizer: DomSanitizer,
    readonly ngZone: NgZone,
    private _snackBar: MatSnackBar
  ) {
    this.fileToBeUploaded = [];
    console.log(
      "IdCode :: ",
      this.router.getCurrentNavigation().extras.state.IdCode
    );
    this.idCode = this.router.getCurrentNavigation().extras.state.IdCode;
    this.linkType = this.router.getCurrentNavigation().extras.state.LinkType;

    console.log("URL PARAM :: ", localStorage.getItem("urlParam"));
    this.urlParam = localStorage.getItem("urlParam");

    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, "online").pipe(mapTo(true)),
      fromEvent(window, "offline").pipe(mapTo(false))
    );
    this.networkStatus();
  }

  ngOnInit(): void {
    this.dataService.getEmailAndFileOwner().then((data) => {
      console.log(data);
      this.emailBy = data.emailBy;
      this.email = data.email;
      this.linkId = data.linkId;
      this.getPreviousUploadedData(this.linkId, this.linkType);
    });

    localStorage.removeItem("t");
    localStorage.removeItem("a");
    localStorage.removeItem("g");
  }

  logout() {
    console.log("Logout...");
    console.log("URL PARAM ", localStorage.getItem("urlParam"));
    localStorage.removeItem("urlParam");
    //this.router.navigateByUrl('')
  }

  public networkStatus() {
    this.online$.subscribe((value) => {
      this.isOnline = value;
    });
  }

  getValueFromKey(key: string): string {
    for (let index = 0; index < keyvalue.length; index++) {
      if (key === keyvalue[index].type) {
        return keyvalue[index].value;
      }
    }
    return "extension";
  }

  getPreviousUploadedData(linkId, linkType) {
    console.log("LinkType ::", linkType);

    if (linkType === 1) {
      this.uploadListCaption = "UPLOADED FILES LIST";
      this.thirdPartyService
        .getPrevUploadedFilesList(linkId)
        .then((data: any) => {
          console.log(data);

          if (data.uploadedFile.length === 0) {
            this.noFilesUploaded = true;
          } else {
            this.noFilesUploaded = false;
          }

          this.vesselName = data.vesselName;
          this.description = data.desc;
          this.vesselImoNo = data.imo;
          this.vesselOfficialNo = data.vslOfficialNo;
          /* Expiry Date Logic  */

          let todayDate = moment();
          let expiryDate = moment(data.expirtyDate);
          let pending_days = expiryDate.diff(todayDate, "days");
          console.log(pending_days);
          console.log(typeof pending_days);
          console.log(pending_days + 1);
          this.daysLeftToExpiryUploadLink = pending_days + 1;

          //this.daysLeftToExpiryUploadLink=Math.round(pending_days);
          console.log(
            "this.daysLeftToExpiryUploadLink ::",
            this.daysLeftToExpiryUploadLink
          );

          console.log("PENDING DAYS ::", pending_days);

          /*  */
          this.uploadedFilesArray = data.uploadedFile.map((res) => res.name);
          console.log(this.uploadedFilesArray);
          let uploadedFileData = data.uploadedFile;

          uploadedFileData.forEach((file) => {
            file.icon = this.getValueFromKey(file.type);
            console.log("file :: ", file);
            let sizeAbc = file.fileSize + "";
            let lnt = sizeAbc.length;
            let size;
            if (lnt > 6) {
              size =
                (Number(sizeAbc) / (1024 * 1024) + "").substring(0, 5) + "MB";
            } else {
              size = (Number(sizeAbc) / 1024 + "").substring(0, 5) + "KB";
            }
            file.fileSize = size;
          });
          uploadedFileData = [...uploadedFileData];
          this.dataSource = uploadedFileData;

          this.changeDetectorRef.detectChanges();
          this.table.renderRows();
        })
        .catch((res) => {
          console.log(res);
        });
    } else if (linkType === 3) {
      this.downloadSharedList = true;
      this.uploadListCaption = "SHARED FILES LIST";
      this.displayedColumns = [
        "icon",
        "name",
        "fileSize",
        "preview",
        //"add"
      ];
      this.thirdPartyService
        .getSharedFilesList(linkId, this.idCode)
        .then((data: any) => {
          console.log("DATA ::", data);
          this.vesselName = data.vesselName;
          this.description = data.description;
          this.vesselImoNo = data.imo;
          this.vesselOfficialNo = data.vesselOfficialNo;
          this.downloadExpiryDate = data.expDate;

          /* Expiry Date Logic  */

          let todayDate: any = new Date();
          let expiryDate: any = new Date(data.expDate).getTime();
          let pending_days = (expiryDate - todayDate) / (1000 * 60 * 60 * 24);

          // this.downloadExpiryDate=Math.round(pending_days);
          console.log(
            "this.daysLeftToExpiryUploadLink ::",
            this.daysLeftToExpiryUploadLink
          );

          console.log("PENDING DAYS ::", pending_days);

          console.log(
            "DOWNLOAD ::",
            this.vesselName,
            this.description,
            this.vesselImoNo,
            this.vesselOfficialNo
          );

          let downloadFileDetails = data.fileDetails;

          downloadFileDetails.forEach((file) => {
            file.icon = this.getValueFromKey(file.type);
            console.log("file :: ", file);
            let sizeAbc = file.fileSize + "";
            let lnt = sizeAbc.length;
            let size;
            if (lnt > 6) {
              size =
                (Number(sizeAbc) / (1024 * 1024) + "").substring(0, 5) + "MB";
            } else {
              size = (Number(sizeAbc) / 1024 + "").substring(0, 5) + "KB";
            }
            file.fileSize = size;
          });
          downloadFileDetails = [...downloadFileDetails];
          this.dataSource = downloadFileDetails;

          console.log(this.dataSource);

          this.changeDetectorRef.detectChanges();
          this.table.renderRows();
        });
    }
  }

  /* Preview Code */

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

    return new Blob([ab], { type: this.getValueFromMIME(fileType) });
  }

  async openPreviewModal(fileId, fileType) {
    console.log("FileID", fileId);
    let mimeTypeValue = this.getValueFromMIME(this.getValueFromKey(fileType));

    if (mimeTypeValue != "unsupported") {
      this.blockUI.start("Please wait , File is loading ...");
      if (!this.downloadSharedList) {
        await this.thirdPartyService.getFilePreview(fileId).then((res: any) => {
          console.log(res);
          this.url = this.b64toBlob(
            res.fileData,
            this.getValueFromKey(fileType)
          );
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
      } else {
        await this.thirdPartyService
          .getFilePreviewForThirdpartyDownload(fileId, this.linkId)
          .then(async (res: any) => {
            console.log(res);
            this.url = this.b64toBlob(
              res.fileData,
              this.getValueFromKey(fileType)
            );
            console.log(this.url);

            this.blob_url = await URL.createObjectURL(this.url);
            //this.blob_url =  URL.createObjectURL(res);

            console.log(this.blob_url);
            this.tryDoctype = await this.sanitizer.bypassSecurityTrustResourceUrl(
              this.blob_url
            );
            if (this.tryDoctype != undefined) {
              this.blockUI.stop();
              this.temp = true;
            }
            console.log("base64", this.tryDoctype);
          });
      }

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
      // this.tostr.warning("Cannot Preview this type of File","Unsupported Format");
      this.downloadfile(fileId);
    }
  }

  openCompleteModal() {
    if (!this.noFilesUploaded) {
      this.dialog.open(this.completeModalTemplate);
    } else {
      this.tostr.warning("Please upload at least one file or photo");
    }
  }

  getValueFromMIME(key: string): string {
    for (let index = 0; index < mimeType.length; index++) {
      if (key == mimeType[index].type) {
        return mimeType[index].value;
      }
    }
    return "unsupported";
  }

  /* Preview Code Ends */

  onClick() {
    console.log("onClick...");
    this.isCompleteBtnEnable = true;
    let fileUpload = document.getElementById("fileUpload") as HTMLInputElement;
    console.log("File Upload :: ", fileUpload);
    fileUpload.onchange = () => {
      console.log("File Upload FILES :: ", fileUpload.files);
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
    let linkId = this.linkId;
    console.log(linkId);
    fd.append("file", file.data);
    fd.append("email", this.email);
    fd.append("fileOwner", "1012");
    fd.append("IdCode", this.idCode);
    fd.append("link", linkId.toString());
    const headers = new HttpHeaders().set("InterceptorSkipHeader", "");
    const req = new HttpRequest("POST", environment.api + "public/upload", fd, {
      reportProgress: true,
    });

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

          console.log(error.error.msg);
          console.log(typeof error.error.msg);

          console.log("file", file);

          console.log("this.errorFilesArray", this.errorFilesArray);
          file.inProgress = false;
          file.isCompress = false;
          file.canRetry = false;
          //this.tostr.error(error.error.msg, error.error.operation);
          this.isSubmitBtnClicked = true;
          this.isProgressCompleted = true;
          this.removeFileFromArray(file);

          if (error.error.msg === "Virus Detected") {
            console.log("VIRUS >>>", error.error.msg);
            this.errorFilesArray.push(file.data.name);
            this.flip = true;
            this.virusBackCard = true;
          } else if (error.error.msg.includes("File format not supported")) {
            console.log("FILE NOT SUPPORT >>>", error.error.msg);
            this.tostr.warning(error.error.msg);
          } else {
            file.canRetry = true;
            console.log("OTHER >>>", error.error.message);
            this.tostr.warning("something went wrong", error.error.message);
          }

          this.completeBackCard = false;
          return of(`${file.data.name} upload failed.`);
        })
      )
      .subscribe((event: any) => {
        file.isCompress = false;
        // console.log(event,index);
        //console.log(this.dataSource[index]);
        //this.dataSource[index].fileId=event.body.fileId;
        //console.log(this.dataSource[index]);

        if (typeof event === "object") {
          // console.log(this.dataSource[index]);
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
      this.isCompleteBtnEnable = true;
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

    console.log("FILES", this.files);
    console.log("FILES LENGTH", this.files.length);

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
      this.isCompleteBtnEnable = true;
      this.tostr.success(evt.body.msg);

      this.getPreviousUploadedData(this.linkId, this.linkType);
      //this.flip=true;
    } else {
      this.isProgressCompleted = true;
      this.isSubmitBtnClicked = true;
      this.isCompleteBtnEnable = true;
      this.tostr.error(evt.body.filename, "Failed to Upload");
      //this.flip=true;
    }
  }

  ngOnDestroy() {
    localStorage.removeItem("t");
  }

  openRemoveModal(file, index) {
    console.log(file, index);
    this.dialog.open(this.fileRemoveModalTemplate, {
      data: { fileId: file.id, index: index },
    });
  }

  close() {
    this.dialog.closeAll();
  }

  removeUploaded(file: any) {
    if (!this.completeBackCard) {
      this.close();
      this.blockUI.start("Removing File...");
      console.log(" removed file  ", file);
      console.log("FileID ::", file.fileId);
      console.log("INDEX ::", file.index);
      let index = this.dataSource.indexOf(file);
      let tableData = this.dataSource;
      console.log("this.idCode", this.idCode);
      console.log("index", index);
      if (file.index > -1) {
        this.dataService.getEmailAndFileOwner().then(
          async (res) => {
            await this.thirdPartyService
              .deleteUploadedFile(file.fileId, res.linkId, this.idCode)
              .then((res) => {
                console.log(res);
                console.log("this.dataSource", this.dataSource);

                if (res) {
                  //this.tostr.success("File removed successfully ");
                  // this._snackBar.open("File removed successfully",{
                  //   horizontalPosition: this.horizontalPosition,
                  //    verticalPosition: this.verticalPosition,
                  // });
                  this.ngZone.run(() => {
                    this.tostr.success("File removed successfully ");
                    // this._snackBar.open("File removed successfully","",{
                    //   horizontalPosition: 'end',
                    //   verticalPosition: 'top',
                    // });
                  });

                  console.log("TOASTER GOING TO DISPLAY");

                  this.blockUI.stop();

                  this.deleteFileFromList(file.index);
                } else {
                  this.blockUI.stop();
                  this.tostr.success("Unable to delete file", "Failed");
                }
              });

            // tableData.splice(index, 1);
            // console.log(tableData)
          },
          (err) => {
            this.tostr.warning("Failed to Delete File");
            console.log(err);
          }
        );
        this.dataSource = tableData;
      }
      console.log(tableData);
      this.changeDetectorRef.detectChanges();
      this.dataSource = tableData;
    } else {
      this.tostr.warning("Link Completed , Cannot remove file");
      this.dialog.closeAll();
    }
  }

  deleteFileFromList(index) {
    console.log("Index ::", index);
    this.dataSource.splice(index, 1);
    this.uploadedFilesArray.splice(index, 1);
    this.changeDetectorRef.detectChanges();
    this.table.renderRows();
    console.log("After Splice ::", this.dataSource);
    //this.tostr.success("File removed successfully ")
  }

  //submit operations start

  complete() {
    console.log(this.dataSource);
    if (this.dataSource.length != 0) {
      this.dataService.getEmailAndFileOwner().then((res) => {
        console.log(res.linkId);
        let data = { link: res.linkId, idCode: this.idCode };
        const headers = new HttpHeaders().set("InterceptorSkipHeader", "");
        this._http
          .put(environment.api + "public/upload/complete", data, {
            headers: headers,
          })
          .subscribe(
            (resp: any) => {
              console.log(resp);
              this.virusBackCard = false;
              this.completeBackCard = true;
              this.tostr.success("File Uploaded  successfully");
              this.flip = true;
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
            }
          );
      });
    } else {
      this.tostr.warning("Please upload at least one file or photo");
    }
  }

  completeLink() {
    console.log(this.dataSource);
    if (this.dataSource.length != 0) {
      this.dataService.getEmailAndFileOwner().then((res) => {
        console.log(res.linkId);
        let data = { link: res.linkId, idCode: this.idCode };
        const headers = new HttpHeaders().set("InterceptorSkipHeader", "");
        this._http
          .put(environment.api + "public/upload/complete", data, {
            headers: headers,
          })
          .subscribe(
            (resp: any) => {
              console.log(resp);
              this.virusBackCard = false;
              this.completeBackCard = true;
              this.flip = true;
              this.tostr.success("File Uploaded  successfully");
              this.isSubmitBtnClicked = false;
              this.dialog.closeAll();
            },
            (error) => {
              console.log("Error" + JSON.stringify(error));
            }
          );
      });
    } else {
      this.tostr.warning("Please upload at least one file or photo");
      this.dialog.closeAll();
    }
  }

  downloadfile(id: string) {
    console.log(environment.api + "download/thirdparty/shared/file/" + id);
    if (!this.downloadSharedList) {
      window.open(
        environment.api + "download/thirdparty/shared/file/" + id,
        "_blank"
      );
    } else {
      window.open(
        environment.api + "download/view/shared/file/" + this.linkId + "/" + id,
        "_blank"
      );
    }
  }

  // upload all file at once

  upload() {
    //alert("file uploaded");
    this.isSubmitBtnClicked = false;
    // this.files.forEach((file) => {
    //   this.uploadFile(file);
    // })

    this.functionOne().then(() => {
      // after function one
      this.functionTwo();
    });

    window.close();
    // console.log(JSON.stringify(this.files));
  }

  functionOne() {
    return new Promise((resolve) => {
      setTimeout(function () {
        console.log("first function executed");
        this.scanningFnEnable = false;
        console.log("scanningFnEnable", this.scanningFnEnable);
        resolve([]);
      }, 10000);
    });
  }

  functionTwo() {
    return new Promise((resolve) => {
      console.log("second function executed");
      this.scanningFnEnable = false;
      this.uploadingFnEnable = true;
      console.log("uploadingFnEnable", this.uploadingFnEnable);
      resolve([]);
    });
  }
}
