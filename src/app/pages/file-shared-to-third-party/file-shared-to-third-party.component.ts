import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  NgZone,
} from "@angular/core";
import { DataService } from "src/app/shared/services/data.service";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import {
  SharedToThird,
  mimeType,
  keyvalue,
  Shared,
  SharedData,
  SharedToThirdPartyData,
  Files,
} from "../sharedfiles/sharedfiles.model";
import { NgBlockUI, BlockUI } from "ng-block-ui";
import { SharedfilesService } from "../sharedfiles/sharedfiles.service";
import { ToastrService } from "ngx-toastr";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { DomSanitizer } from "@angular/platform-browser";
import { FileArchiveService } from "../file-archive/file-archive.service";
import { UploadToThirdPartyService } from "../upload-to-third-party/upload-to-third-party.service";
import { Sort } from "@angular/material/sort";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as moment from "moment";

@Component({
  selector: "app-file-shared-to-third-party",
  templateUrl: "./file-shared-to-third-party.component.html",
  styleUrls: ["./file-shared-to-third-party.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class FileSharedToThirdPartyComponent implements OnInit {
  @ViewChild("preview") template1: TemplateRef<HTMLElement>;

  @ViewChild("deleteFolderModal")
  deleteFolderModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild("deleteFileModal")
  deleteFileModalTemplate: TemplateRef<HTMLElement>;

  sharedToThirdDataSource: MatTableDataSource<any>;

  columnsToDisplay = [
    "type",
    "vessel_NAME",
    "description",
    "expired_ON",
    "review",
  ];
  innerDisplayedColumns = [
    "file_TYPE",
    "file_NAME",
    "preview",
    "uploadedat",
    "uploadedby",
    "file_SIZE",
    "archiveFile",
    "reviewFlag",
  ];
  expandedElement: Shared | null;
  selection = new SelectionModel<SharedToThird>(false, []);
  selection1 = new SelectionModel<SharedToThird>(true, []);

  sharedFileData: any[] = [];
  files: any = [];
  base64: string;
  base641: string;
  url: any;
  blob_url: string;
  tryDoctype: any;
  @BlockUI() blockUI: NgBlockUI;

  outerStrokeColor: string;
  innerStrokeColor: string;
  tempElement: any;
  tempIndex: any;

  searchFilterControl = new FormControl();
  searchUsersList: string[] = [];
  filteredOptions: Observable<any[]>;
  selectedUser: any;
  tempUserId: any;
  isManager: boolean;
  noDataFound: boolean;
  searchFilterFlag: boolean = true;
  searchUsersListForReassign: string[];
  allUsersList: any;
  currentUserRole: any;
  tempFileId: any;

  constructor(
    private dataService: DataService,
    private service: SharedfilesService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    readonly ngZone: NgZone,
    public dialogRef: MatDialogRef<any>,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private archiveService: FileArchiveService,
    private removeFileService: UploadToThirdPartyService
  ) {
    this.dataService.setNavbarTitle("Files Shared To Third Party");

    this.service.getAllUsers().then((res) => {
      console.log("All Users", res);
      this.allUsersList = res;
      this.searchUsersList = this.allUsersList.map((res) => res.name);
      console.log(this.searchUsersList);
    });

    this.filteredOptions = this.searchFilterControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.searchUsersList.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  searchFilterSubmit() {
    console.log(this.searchFilterControl.value);
    this.searchFilterFlag = false;
    this.selectedUser = this.searchFilterControl.value;
    let submittedValue = this.searchFilterControl.value;
    this.searchUsersListForReassign = this.allUsersList.filter(
      (item) => item.name !== this.selectedUser
    );
    let userId = this.allUsersList.filter(
      (res) => res.name === this.searchFilterControl.value
    )[0].id;
    console.log("userId", userId);
    this.tempUserId = userId;
    this.sharedFileData = [];
    this.getFoldersForManager(userId);
  }

  async ngOnInit() {
    //await this.getFoldersForUsers();

    console.log("ngOnInit....");

    this.dataService.getUserRole().then((res) => {
      this.currentUserRole = res;

      console.log(" this.currentUserRole", this.currentUserRole);
      if (this.currentUserRole === "2") {
        this.getFoldersForUsers();
      } else {
        this.isManager = true;
        console.log("  this.isManager", this.isManager);
        this.columnsToDisplay = [
          "type",
          "vessel_NAME",
          "description",
          "expired_ON",
          "review",
        ];
        this.innerDisplayedColumns = [
          "file_TYPE",
          "file_NAME",
          "preview",
          "uploadedat",
          "uploadedby",
          "file_SIZE",
          "reviewFlag",
        ];
      }
    });
  }

  async getFoldersForUsers() {
    console.log("get Folders");

    await this.service.getSharedToThirdPartyDetails().then((data: any) => {
      console.log(data);
      console.log(JSON.stringify(data));
      if (
        (data.status === 500 && data.error.message === "No Files Shared yet") ||
        data.length === 0
      ) {
        this.noDataFound = true;
        this.sharedFileData = [];
        this.sharedToThirdDataSource = new MatTableDataSource([]);
      } else {
        this.noDataFound = false;

        for (let index = 0; index < data.length; index++) {
          data[index].file_TYPE = this.getValueFromKey(data[index].file_TYPE);
          let sizeAbc = data[index].file_SIZE + "";
          let lnt = sizeAbc.length;
          if (lnt > 6) {
            data[index].file_SIZE =
              (Number(sizeAbc) / (1024 * 1024) + "").substring(0, 5) + "MB";
          } else {
            data[index].file_SIZE =
              (Number(sizeAbc) / 1024 + "").substring(0, 5) + "KB";
          }
          data[index].created_ON = moment(data[index].created_ON);
          data[index].expired_ON = moment(data[index].expired_ON);

          /* 
           data[index].created_ON = moment(data[index].created_ON).format("DD-MMM-YYYY HH:MM");
          data[index].expired_ON = moment(data[index].expired_ON).format("DD-MMM-YYYY HH:MM");
           */
        }
        // sorting data
        data.sort(this.sortByOrderBy("expired_ON"));
        data = [...data];
        //this.dataSource = data;
        //this.sharedToThirdDataSource=data;

        console.log("data", data);

        let groupedData = data.reduce((acc, next) => {
          // reusable file var
          let nextFile = {
            file_NAME: next.file_NAME,
            file_TYPE: next.file_TYPE,
            f_ID: next.f_ID,
            file_SIZE: next.file_SIZE,
            isViewed: next.isviewed,
            email: next.email,
            uploadedby: next.email,
            created_ON: next.created_ON,
            downloadLinkId: next.download_LINK_ID,
          };

          // find similar link id, and join them
          let exist = acc.find((v) => v.folder_ID === next.folder_ID);
          if (exist) {
            // id exists, update its folders
            exist.files.push(nextFile);
          } else {
            // create new folders
            acc.push({
              folder_ID: next.folder_ID,
              vessel_NAME: next.vessel_NAME,
              description: next.description,
              uploadedBy: next.email,
              expired_ON: next.expired_ON,
              files: [nextFile],
            });
          }
          return acc;
        }, []);

        console.log("groupedData", groupedData);

        groupedData.forEach((data) => {
          if (data.files && Array.isArray(data.files) && data.files.length) {
            this.sharedFileData = [
              ...this.sharedFileData,
              { ...data, files: new MatTableDataSource(data.files) },
            ];
          } else {
            this.sharedFileData = [...this.sharedFileData, data];
          }
        });

        for (let i = 0; i < this.sharedFileData.length; i++) {
          console.log(
            "******************************************************************************"
          );
          let totalFilesLength = this.sharedFileData[i].files.data.length;
          console.log("total files ::", totalFilesLength);
          let isViewedArray = this.sharedFileData[i].files.data.filter(
            (res) => res.isViewed === 1
          );
          console.log("isViewedArray ::", isViewedArray);
          let fileViewedLength = isViewedArray.length;
          console.log("fileViewedLength ::", fileViewedLength);
          console.log(
            "=================================================================================="
          );
          let percent = (fileViewedLength / totalFilesLength) * 100;
          console.log("percent", Math.round(percent));

          this.sharedFileData[i].progressPercent = Math.round(
            percent
          ).toString();
        }

        this.sharedToThirdDataSource = new MatTableDataSource(
          this.sharedFileData
        );

        console.log(
          "this.sharedToThirdDataSource ==>  ",
          this.sharedToThirdDataSource
        );
      }
    });
  }

  async getFoldersForManager(userId) {
    console.log("get Folders");

    await this.service
      .getSharedToThirdPartyDetailsForManger(userId)
      .then((data: any) => {
        console.log(data);

        if (
          (data.status === 500 &&
            data.error.message === "No Files Shared yet") ||
          data.length === 0
        ) {
          this.noDataFound = true;
          this.sharedFileData = [];
          this.sharedToThirdDataSource = new MatTableDataSource([]);
        } else {
          this.noDataFound = false;

          console.log(JSON.stringify(data));
          for (let index = 0; index < data.length; index++) {
            data[index].file_TYPE = this.getValueFromKey(data[index].file_TYPE);
            let sizeAbc = data[index].file_SIZE + "";
            let lnt = sizeAbc.length;
            if (lnt > 6) {
              data[index].file_SIZE =
                (Number(sizeAbc) / (1024 * 1024) + "").substring(0, 5) + "MB";
            } else {
              data[index].file_SIZE =
                (Number(sizeAbc) / 1024 + "").substring(0, 5) + "KB";
            }
            data[index].created_ON = moment(data[index].created_ON);
            data[index].expired_ON = moment(data[index].expired_ON);

            /* 
        data[index].created_ON = moment(data[index].created_ON).format("DD-MMM-YYYY HH:MM");
        data[index].expired_ON = moment(data[index].expired_ON).format("DD-MMM-YYYY HH:MM");
        */
          }
          // sorting data
          data.sort(this.sortByOrderBy("expired_ON"));
          data = [...data];
          //this.dataSource = data;
          //this.sharedToThirdDataSource=data;

          console.log("data", data);

          let groupedData = data.reduce((acc, next) => {
            // reusable file var
            let nextFile = {
              file_NAME: next.file_NAME,
              file_TYPE: next.file_TYPE,
              f_ID: next.f_ID,
              file_SIZE: next.file_SIZE,
              isViewed: next.isviewed,
              email: next.email,
              uploadedby: next.email,
              created_ON: next.created_ON,
              downloadLinkId: next.download_LINK_ID,
            };

            // find similar link id, and join them
            let exist = acc.find((v) => v.folder_ID === next.folder_ID);
            if (exist) {
              // id exists, update its folders
              exist.files.push(nextFile);
            } else {
              // create new folders
              acc.push({
                folder_ID: next.folder_ID,
                vessel_NAME: next.vessel_NAME,
                description: next.description,
                uploadedBy: next.email,
                expired_ON: next.expired_ON,
                files: [nextFile],
              });
            }
            return acc;
          }, []);

          console.log("groupedData", groupedData);

          groupedData.forEach((data) => {
            if (data.files && Array.isArray(data.files) && data.files.length) {
              this.sharedFileData = [
                ...this.sharedFileData,
                { ...data, files: new MatTableDataSource(data.files) },
              ];
            } else {
              this.sharedFileData = [...this.sharedFileData, data];
            }
          });

          for (let i = 0; i < this.sharedFileData.length; i++) {
            console.log(
              "******************************************************************************"
            );
            let totalFilesLength = this.sharedFileData[i].files.data.length;
            console.log("total files ::", totalFilesLength);
            let isViewedArray = this.sharedFileData[i].files.data.filter(
              (res) => res.isViewed === 1
            );
            console.log("isViewedArray ::", isViewedArray);
            let fileViewedLength = isViewedArray.length;
            console.log("fileViewedLength ::", fileViewedLength);
            console.log(
              "=================================================================================="
            );
            let percent = (fileViewedLength / totalFilesLength) * 100;
            console.log("percent", Math.round(percent));

            this.sharedFileData[i].progressPercent = Math.round(
              percent
            ).toString();
          }

          this.sharedToThirdDataSource = new MatTableDataSource(
            this.sharedFileData
          );

          console.log(
            "this.sharedToThirdDataSource ==>  ",
            this.sharedToThirdDataSource
          );
        }
      });
  }

  b64toBlob(dataURI, fileType) {
    console.log(fileType);
    console.log(this.getValueFromMIME(fileType));

    let mimeTypeValue = this.getValueFromMIME(fileType);

    /*  var binary_string =  window.atob(dataURI);
   var len = binary_string.length;
   var bytes = new Uint8Array( len );
   for (var i = 0; i < len; i++)        {
       bytes[i] = binary_string.charCodeAt(i);
   }
   return bytes.buffer; */

    var byteString = window.atob(dataURI);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: this.getValueFromMIME(fileType) });
  }

  async openPreviewModal(fileId, fileType, file) {
    console.log("FileID", fileId);
    console.log("file", file);
    let mimeTypeValue = this.getValueFromMIME(fileType);
    this.blockUI.start("Please wait , File is loading ...");
    if (mimeTypeValue != "unsupported") {
      await this.service.getFilePreview(fileId).then((res: any) => {
        console.log(res);

        if (res === null) {
          this.toastr.warning("something went wrong !");
          this.sharedFileData = [];

          this.ngOnInit();

          this.blockUI.stop();
          this.cd.detectChanges();
        }

        this.url = this.b64toBlob(res.fileData, fileType);
        console.log(this.url);
        this.blob_url = URL.createObjectURL(this.url);
        console.log(this.blob_url);
        this.tryDoctype = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.blob_url
        );
        if (this.tryDoctype != undefined) {
          console.log(this.tryDoctype);
          this.blockUI.stop();
        }
        console.log("base64", this.tryDoctype);
      });

      this.ngZone.run(() => {
        this.dialog.open(this.template1, {
          height: "500px",
          width: "800px",
          data: {
            title: "previewww",
          },
        });
      });
    } else {
      //this.toastr.warning("Cannot Preview this type of File","Unsupported Format");
      this.downloadfile(file);
      this.blockUI.stop();
    }
  }

  previewClose() {
    this.dialog.closeAll();
    this.sharedFileData = [];
    // this.ngOnInit();
    this.cd.detectChanges();
  }

  close() {
    this.dialog.closeAll();
  }

  /* Code For Folder Delete Operation */

  openDeleteFolderModal(folder) {
    console.log(folder);
    this.dialog.open(this.deleteFolderModalTemplate, {
      data: { folderId: folder.folder_ID },
    });
  }

  removeFolder(folder) {
    console.log(folder);
    console.log("FolderId", folder.folderId);
    this.blockUI.start("Archiving Folder ..");
    this.archiveService.folderArchive(folder.folderId).then(async (res) => {
      console.log(res);
      this.sharedFileData = [];
      this.ngOnInit();
      this.cd.detectChanges();
      this.close();
      this.blockUI.stop();
    });
  }

  /* Code For File Delete Operation */

  openDeleteFileModal(file) {
    console.log(file);
    this.dialog.open(this.deleteFileModalTemplate, {
      data: { fileId: file.f_ID, downloadLinkId: file.downloadLinkId },
    });
  }

  removeFile(file) {
    console.log(file);
    this.tempFileId = file.fileId;
    this.blockUI.start("Removing File ..");
    this.removeFileService
      .removeFileAndCancelLink(file.fileId, file.downloadLinkId)
      .then((res) => {
        console.log(res);
        this.toastr.success("File removed successfully");
        this.sharedFileData = [];
        // this.ngOnInit();
        this.refreshRemoveFile();
        this.cd.detectChanges();
        this.close();
        this.blockUI.stop();
      });
  }

  refreshRemoveFile() {
    console.log(this.sharedToThirdDataSource);
    console.log(this.tempIndex);
    let temp = this.sharedToThirdDataSource.data[
      this.tempIndex
    ].files.data.filter((res) => res.f_ID != this.tempFileId);
    this.sharedToThirdDataSource.data[this.tempIndex].files.data = temp;
    let tempData = this.sharedToThirdDataSource.data;

    let totalFilesLength = tempData[this.tempIndex].files.data.length;
    console.log("total files ::", totalFilesLength);
    let isViewedArray = tempData[this.tempIndex].files.data.filter(
      (res) => res.isViewed === 1
    );
    console.log("isViewedArray ::", isViewedArray);
    let fileViewedLength = isViewedArray.length;
    console.log("fileViewedLength ::", fileViewedLength);
    let percent = (fileViewedLength / totalFilesLength) * 100;
    console.log("percent", Math.round(percent));

    tempData[this.tempIndex].progressPercent = Math.round(percent).toString();

    console.log(temp);
    console.log(this.sharedToThirdDataSource);
  }

  getValueFromKey(key: string): string {
    for (let index = 0; index < keyvalue.length; index++) {
      if (key == keyvalue[index].type) {
        return keyvalue[index].value;
      }
    }
    return "extension";
  }

  getValueFromMIME(key: string): string {
    for (let index = 0; index < mimeType.length; index++) {
      if (key == mimeType[index].type) {
        return mimeType[index].value;
      }
    }
    return "unsupported";
  }

  downloadfile(file) {
    console.log(file);
    console.log(file.downloadLinkId);
    console.log(
      environment.api + "download/thirdparty/shared/file/" + file.f_ID
    );
    window.open(
      environment.api + "download/thirdparty/shared/file/" + file.f_ID,
      "_blank"
    );
  }

  sortByOrderBy(prop) {
    return function (a, b) {
      if (a[prop] > b[prop]) {
        return -1;
      } else if (a[prop] < b[prop]) {
        return 1;
      }
      return 0;
    };
  }

  sortData(sort: Sort) {
    console.log("SORT :: ", sort);

    const data = this.sharedToThirdDataSource.data;

    if (!sort.active || sort.direction === "") {
      this.sharedToThirdDataSource.data = data;
      return;
    }

    this.sharedToThirdDataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "vessel_NAME":
          return this.compare(a.vessel_NAME, b.vessel_NAME, isAsc);
        case "submittedDate":
          return this.compare(a.submittedDate, b.submittedDate, isAsc);
        case "expired_ON":
          return this.compare(a.expired_ON, b.expired_ON, isAsc);
        default:
          return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    console.log((a < b ? -1 : 1) * (isAsc ? 1 : -1));
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  toggleRow(element: Shared, index) {
    console.log(element);

    this.tempElement = element;
    this.tempIndex = index;

    element.files && (element.files as MatTableDataSource<Files>).data.length
      ? (this.expandedElement =
          this.expandedElement === element ? null : element)
      : null;
    this.cd.detectChanges();
  }

  toggleRow1(element: any, index) {
    console.log("ELEMENTS ::", element);
    console.log("INDEX ::", index);

    // this.tempElement = element;
    this.tempIndex = index;

    this.selection1.clear();
    this.files = [];
    element.files && element.files.length
      ? (this.expandedElement =
          this.expandedElement === element ? null : element)
      : null;
    console.log(element);
    console.log(index);
    console.log(element.folderId);
    this.service
      .getUploadedFilesForThisLinkId(element.folderId)
      .then((res: any) => {
        console.log(res);
        if (res.status === 404) {
          this.toastr.warning(
            "Please Upload atleast one file to view",
            "No Files Found"
          );
        } else if (res.status === 500) {
          this.toastr.warning("Something else happend", "Failed");
        } else if (res.length != 0) {
          console.log(this.sharedToThirdDataSource);
          let data = res;
          for (let i = 0; i < data.length; i++) {
            console.log(data[i].type, data[i].fileSize, data[i].sharedDate);
            data[i].type = this.getValueFromKey(data[i].type);
            let sizeAbc = data[i].fileSize + "";
            let lnt = sizeAbc.length;
            if (lnt > 6) {
              data[i].fileSize =
                (Number(sizeAbc) / (1024 * 1024) + "").substring(0, 5) + "MB";
            } else {
              data[i].fileSize =
                (Number(sizeAbc) / 1024 + "").substring(0, 5) + "KB";
            }
            data[i].sharedDate = new Date(data[i].sharedDate);
            data[i].folderID = element.folderId;
          }
          console.log(data);
          // res={...res,folderID:element.folderId}
          console.log("RES >>", res);
          this.sharedToThirdDataSource.data[index].files = res;
          console.log(this.sharedToThirdDataSource);
          console.log(this.sharedToThirdDataSource.data.length);
          this.cd.detectChanges();
        }
      });
    this.cd.detectChanges();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.sharedToThirdDataSource.filter = filterValue.trim().toLowerCase();
    if (this.sharedToThirdDataSource.filteredData.length === 0) {
      this.noDataFound = true;
    } else {
      this.noDataFound = false;
    }
  }
}
