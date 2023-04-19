import {
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  NgZone,
} from "@angular/core";
import { DataService } from "src/app/shared/services/data.service";
import { SharedfilesService } from "../sharedfiles/sharedfiles.service";
import {
  SharedData,
  Shared,
  SharedToThird,
  mimeType,
  keyvalue,
  Files,
} from "../sharedfiles/sharedfiles.model";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { environment } from "src/environments/environment";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { NgBlockUI, BlockUI } from "ng-block-ui";
import { DomSanitizer } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { FileArchiveService } from "../file-archive/file-archive.service";
import { UploadToThirdPartyService } from "../upload-to-third-party/upload-to-third-party.service";
import { Sort } from "@angular/material/sort";
import { ThemePalette } from "@angular/material/core";
import {
  CircleProgressComponent,
  CircleProgressOptions,
} from "ng-circle-progress";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as moment from "moment";

@Component({
  selector: "app-file-shared-by-third-party",
  templateUrl: "./file-shared-by-third-party.component.html",
  styleUrls: ["./file-shared-by-third-party.component.scss"],
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
export class FileSharedByThirdPartyComponent implements OnInit {
  dataSource: SharedData[];
  dataSource1: MatTableDataSource<any>;
  sharedFileData: any[] = [];
  @ViewChild("preview") template1: TemplateRef<HTMLElement>;

  color: ThemePalette = "primary";

  @ViewChild("deleteFolderModal")
  deleteFolderModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild("deleteFileModal")
  deleteFileModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild("reAssignModal") reAssignModalTemplate: TemplateRef<HTMLElement>;

  //'upload','share'
  columnsToDisplay = [
    "type",
    "vessel_NAME",
    "link_DESC",
    "imoNumber",
    "officialNumber",
    "submittedDate",
    "archiveFolder",
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

  //preview

  base64: string;
  base641: string;
  url: any;
  blob_url: string;
  tryDoctype: any;
  @BlockUI() blockUI: NgBlockUI;

  //temp properties
  tempI: number;
  reviewPropertyFlag = "../../../assets/review.svg";

  @ViewChild("circleProgress") circleProgress: CircleProgressComponent;
  options = new CircleProgressOptions();

  optionsA = {
    percent: 85,
    radius: 10,
    showBackground: false,
    outerStrokeWidth: 5,
    innerStrokeWidth: 5,
    subtitleFormat: false, // clear subtitleFormat coming from other options, because Angular does not assign if variable is undefined.
    startFromZero: false,
  };

  progressPercentage: any = "100";
  folderOpenedId: number = null;
  tempElement: Shared;
  currentUserRole: any;

  allUsersList: any;
  allActiveUsersList: any;

  reAssignModalForm: FormGroup;
  loggedInUserId: number;
  reassignLinkId: any;

  searchFilterControl = new FormControl();
  searchUsersList: string[] = [];
  filteredOptions: Observable<any[]>;
  selectedUser: any;
  tempUserId: any;
  isManager: boolean;
  noDataFound: boolean;
  searchFilterFlag: boolean = true;
  searchUsersListForReassign: string[];
  tempIndex: any;
  searchActiveUsersList: any;
  tempFileId: any;
  tempFileIdForFileRemove: any;

  constructor(
    private dataService: DataService,
    private service: SharedfilesService,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    readonly ngZone: NgZone,
    private archiveService: FileArchiveService,
    private removeFileService: UploadToThirdPartyService
  ) {
    this.dataService.setNavbarTitle("Files Shared By Third Party");
    this.service.getAllUsers().then((res) => {
      console.log("All Users", res);
      this.allUsersList = res;
      this.searchUsersList = this.allUsersList.map((res) => res.name);
      console.log(this.searchUsersList);
    });

    this.service.getAllActiveUsers().then((res) => {
      console.log("All ACTIVE  Users", res);
      this.allActiveUsersList = res;
      this.searchActiveUsersList = this.allActiveUsersList.map(
        (res) => res.name
      );
      console.log(this.searchActiveUsersList);
    });
    this.dataService.getLoggedInUserId().then((res) => {
      this.loggedInUserId = res;
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
    this.searchUsersListForReassign = this.allActiveUsersList.filter(
      (item: any) => item.name !== this.selectedUser
    );
    let userId = this.allUsersList.filter(
      (res) => res.name === this.searchFilterControl.value
    )[0].id;
    console.log("userId", userId);
    this.tempUserId = userId;
    this.sharedFileData = [];
    this.getManagerData(userId);
  }

  ngOnDestroy() {
    console.log("ng on destroy");
    this.tempUserId = null;
  }

  async getUsersData() {
    await this.service.getFileDetails().then((data: SharedData[]) => {
      console.log(JSON.stringify(data));
      console.log(data);
      if (data.length != 0) {
        this.noDataFound = false;
        this.tempI = 0;
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
          data[index].uploadedat = moment(data[index].uploadedat);

          /*  data[index].uploadedat = moment(data[index].uploadedat).format(
            "DD-MMM-YYYY HH:MM"
          ); */
        }
        // sorting data
        data.sort(this.sortByOrderBy("uploadedat"));
        data = [...data];
        this.dataSource = data;

        console.log("data", data);

        let groupedData = data.reduce((acc, next) => {
          let nextFile = {
            name: next.file_NAME,
            type: next.file_TYPE,
            id: next.f_ID,
            linkId: next.lid,
            fileSize: next.file_SIZE,
            isfolder: next.isfolder,
            isViewed: next.isviewed,
            email: next.email,
            uploadedby: next.uploadedby,
            sharedDate: next.uploadedat,
          };

          let linkIds = {
            linkId: next.lid,
          };

          // console.log("nextFile",nextFile)

          // find similar link id, and join them
          let exist = acc.find(
            (v) =>
              v.vessel_NAME === next.vessel_NAME &&
              v.description === next.description &&
              v.vsl_IMO_NO === next.vsl_IMO_NO &&
              v.vsl_OFFICIAL_NO === next.vsl_OFFICIAL_NO
          );
          //console.log("exist",exist)
          if (exist) {
            // id exists, update its folders
            exist.files.push(nextFile);
            exist.lid.push(linkIds);
          } else {
            // create new folders

            acc.push({
              lid: [linkIds],
              vessel_NAME: next.vessel_NAME,
              description: next.description,
              uploadedBy: next.uploadedby,
              submittedDate: next.uploadedat,
              vsl_IMO_NO: next.vsl_IMO_NO,
              vsl_OFFICIAL_NO: next.vsl_OFFICIAL_NO,
              reviewStatus: this.tempI++,
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

        console.log("sharedFileData", this.sharedFileData);

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

        this.dataSource1 = new MatTableDataSource(this.sharedFileData);
        this.dataSource1.connect().next(this.sharedFileData);

        console.log("this.dataSource1 ==>  ", this.dataSource1);
      } else {
        this.sharedFileData = [];
        this.dataSource1 = new MatTableDataSource([]);
        this.noDataFound = true;
      }
    });

    console.log(this.dataSource);
    console.log("this.dataSource1 :: ", this.dataSource1);
  }

  async getManagerData(userId) {
    await this.service.getPendingDocsForReview(userId).then((res: any) => {
      console.log(res);

      if (res.status != 500) {
        this.noDataFound = false;
        let data = res;

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
          data[index].uploadedat = moment(data[index].uploadedat);

          /* data[index].uploadedat = moment(data[index].uploadedat).format(
            "DD-MMM-YYYY HH:MM"
          ); */
        }
        // sorting data
        data.sort(this.sortByOrderBy("uploadedat"));
        data = [...data];
        this.dataSource = data;

        console.log("data", data);

        let groupedData = data.reduce((acc, next) => {
          // reusable file var

          let nextFile = {
            name: next.file_NAME,
            type: next.file_TYPE,
            id: next.f_ID,
            fileSize: next.file_SIZE,
            isfolder: next.isfolder,
            isViewed: next.isviewed,
            email: next.email,
            uploadedby: next.uploadedby,
            sharedDate: next.uploadedat,
          };

          let linkIds = {
            linkId: next.lid,
          };

          // console.log("nextFile",nextFile)

          // find similar link id, and join them
          let exist = acc.find(
            (v) =>
              v.vessel_NAME === next.vessel_NAME &&
              v.description === next.description &&
              v.vsl_IMO_NO === next.vsl_IMO_NO &&
              v.vsl_OFFICIAL_NO === next.vsl_OFFICIAL_NO
          );
          //console.log("exist",exist)
          if (exist) {
            // id exists, update its folders
            exist.files.push(nextFile);
            exist.lid.push(linkIds);
          } else {
            // create new folders

            acc.push({
              lid: [linkIds],
              vessel_NAME: next.vessel_NAME,
              description: next.description,
              uploadedBy: next.uploadedby,
              submittedDate: next.uploadedat,
              vsl_IMO_NO: next.vsl_IMO_NO,
              vsl_OFFICIAL_NO: next.vsl_OFFICIAL_NO,
              reviewStatus: this.tempI++,
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

        console.log("sharedFileData", this.sharedFileData);

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

        this.dataSource1 = new MatTableDataSource(this.sharedFileData);
      } else {
        this.sharedFileData = [];
        this.dataSource1 = new MatTableDataSource([]);
        this.noDataFound = true;
      }
      //this.dataSource1 = new MatTableDataSource(data);
    });

    console.log(this.dataSource);
    console.log("this.dataSource1 :: ", this.dataSource1);
  }

  async ngOnInit() {
    console.log(this.currentUserRole);

    this.dataService.getUserRole().then((res) => {
      this.currentUserRole = res;
      if (this.currentUserRole === "2") {
        this.getUsersData();
      } else {
        this.columnsToDisplay = [
          "type",
          "vessel_NAME",
          "link_DESC",
          "imoNumber",
          "officialNumber",
          "review",
          "reassign",
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
        this.reAssignModalForm = this.formBuilder.group(
          {
            newUser: [""],
          },
          { updateOn: "submit" }
        );
        this.isManager = true;
      }
    });
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
    console.log(key);
    console.log(mimeType);

    for (let index = 0; index < mimeType.length; index++) {
      if (key == mimeType[index].type) {
        return mimeType[index].value;
      }
    }
    return "unsupported";
  }

  downloadfile(file) {
    console.log(file);
    console.log(environment.api + "download/user/shared/file/" + file.id);
    window.open(
      environment.api + "download/user/shared/file/" + file.id,
      "_blank"
    );
    this.tempFileId = file.id;
    this.sharedFileData = [];
    if (this.currentUserRole === "2") {
      //this.ngOnInit();
      this.refreshPreview();
    } else {
      // this.searchFilterSubmit();
      this.refreshPreview();
    }
    this.cd.detectChanges();
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

    const data = this.dataSource1.data;

    if (!sort.active || sort.direction === "") {
      this.dataSource1.data = data;
      return;
    }

    this.dataSource1.data = data.sort((a, b) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "vessel_NAME":
          return this.compare(a.vessel_NAME, b.vessel_NAME, isAsc);
        case "submittedDate":
          return this.compare(a.submittedDate, b.submittedDate, isAsc);
        case "uploadedBy":
          return this.compare(a.uploadedBy, b.uploadedBy, isAsc);
        default:
          return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    console.log((a < b ? -1 : 1) * (isAsc ? 1 : -1));
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  toggle(element: Shared | any, index) {
    //  console.log("TOGGLE ......");
    //  console.log("TEMP INDEX ",this.tempIndex);
    //  console.log("TEMP ELEMENT",this.tempElement);
    this.tempElement = element;
    this.tempIndex = index;

    this.toggleRow(element, index);
    //this.expandedElement = this.expandedElement == element ? null : element;
  }

  toggleRow(element: Shared | any, index) {
    console.log(element);
    console.log(index);

    this.tempElement = element;
    this.tempIndex = index;

    console.log(element);
    let linkIDArray: any = element.lid;
    let tempLinkArr = linkIDArray.map((res) => res.linkId);
    console.log(tempLinkArr);
    tempLinkArr = tempLinkArr.filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) == index;
    });
    console.log(tempLinkArr);

    this.service.updateViewStatus(tempLinkArr).then((res) => {
      console.log("update view", res);
    });

    console.log(element.files);
    console.log(this.expandedElement);
    console.log(element);
    console.log((element.files as MatTableDataSource<Files>).data.length);
    console.log(this.expandedElement);
    console.log(this.expandedElement === element);
    element.files && (element.files as MatTableDataSource<Files>).data.length
      ? (this.expandedElement =
          this.expandedElement === element ? null : element)
      : null;
    console.log("this.expandedElement", this.expandedElement);
    console.log(
      "this.expandedElement === element",
      this.expandedElement === element
    );
    this.cd.detectChanges();

    /* switch(this.currentUserRole){

      case '1':
        console.log(element.lid);
        this.blockUI.start("loading ...")
         this.service.getPendingFilesForReview(element.lid).then((res:any) => {
              console.log(res);
              let data=res;
              for(let i=0;i<data.length;i++){
                   console.log(data[i].type,data[i].fileSize,data[i].sharedDate)
                   data[i].type=this.getValueFromKey(data[i].type);
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
                   
              }
              console.log(data);
              this.blockUI.stop();
              this.dataSource1.data[index].files=new MatTableDataSource(data);
              console.log(this.dataSource1); 

              console.log(element.files);
              console.log(this.expandedElement)
              console.log(element)
              console.log((element.files as MatTableDataSource<any>).data.length)

              element.files && (element.files as MatTableDataSource<any>).data.length ? (this.expandedElement = this.expandedElement === element ? null : element) : null;
              this.cd.detectChanges();

         })
        break;

      case '2':
         console.log(element)
        let linkIDArray:any=element.lid;
        let tempLinkArr=linkIDArray.map(res => res.linkId);
        console.log(tempLinkArr)
        tempLinkArr = tempLinkArr.filter( function( item, index, inputArray ) {
          return inputArray.indexOf(item) == index;
        });
        console.log(tempLinkArr)
    
       
        this.service.updateViewStatus(tempLinkArr).then(res => {
          console.log('update view',res)
        })
    
        console.log(element.files);
        console.log(this.expandedElement)
        console.log(element)
        console.log((element.files as MatTableDataSource<Files>).data.length)
        element.files && (element.files as MatTableDataSource<Files>).data.length ? (this.expandedElement = this.expandedElement === element ? null : element) : null;
        this.cd.detectChanges();

        break;  
    } */
  }

  /* Preview Code */

  b64toBlob(dataURI, fileType) {
    console.log(fileType);
    console.log(this.getValueFromMIME(fileType));

    let mimeTypeValue = this.getValueFromMIME(fileType);
    console.log(mimeTypeValue);

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
    console.log("fileType", fileType);
    console.log("file", file);

    this.tempFileId = fileId;

    let mimeTypeValue = this.getValueFromMIME(fileType);
    console.log(mimeTypeValue);
    this.blockUI.start("Please wait , File is loading ...");
    if (mimeTypeValue != "unsupported") {
      await this.service.getFilePreview(fileId).then((res: any) => {
        console.log(res);
        console.log(typeof res);
        if (res === null) {
          this.toastr.warning("something went wrong !");
          this.sharedFileData = [];
          if (this.currentUserRole === "2") {
            this.ngOnInit();
          } else {
            this.searchFilterSubmit();
          }

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
          height: "600px",
          width: "800px",
          disableClose: true,
          data: {
            title: "previewww",
          },
        });
      });
    } else {
      //this.toastr.warning("Cannot Preview this type of File","Unsupported Format");

      this.downloadfile(file);
      this.blockUI.stop();
      this.cd.detectChanges();
    }
  }

  /* Code For Folder Delete Operation */

  openDeleteFolderModal(folder) {
    console.log(folder);
    this.dialog.open(this.deleteFolderModalTemplate, {
      data: { folderId: folder.lid },
    });
  }

  removeFolder(folder) {
    console.log(folder);
    console.log("FolderId", folder.folderId);
    let linkIdArr = folder.folderId.map((res) => res.linkId);
    console.log(linkIdArr);
    linkIdArr = linkIdArr.filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) == index;
    });
    console.log(linkIdArr);
    this.blockUI.start("Archiving Folder ..");
    //linkIdArr
    this.archiveService.linkArchive(linkIdArr).then(async (res) => {
      console.log(res);
      if (res) {
        this.toastr.success("Folder removed successfully ..");
        this.sharedFileData = [];
        this.ngOnInit();
        this.cd.detectChanges();
        this.close();
        this.blockUI.stop();
      } else {
        this.blockUI.stop();
      }
    });
  }

  /* Code For File Delete Operation */

  openDeleteFileModal(file) {
    console.log(file);
    this.tempFileIdForFileRemove = file.id;
    this.dialog.open(this.deleteFileModalTemplate, {
      data: { fileId: file.id },
    });
  }

  removeFile(file) {
    console.log(file.fileId);
    this.blockUI.start("Removing File ..");
    this.removeFileService.removeFile(file.fileId).then((res) => {
      console.log(res);
      this.toastr.success("File removed successfully");
      this.sharedFileData = [];
      //this.ngOnInit();
      this.refreshRemoveFile();
      this.cd.detectChanges();
      console.log("res");

      this.close();
      this.blockUI.stop();
    });
  }

  /* Code For Re Assign Operation */

  openReAssignModal(folderData) {
    console.log(folderData);
    let linkIDArray = folderData.lid.map((res) => res.linkId);
    console.log(linkIDArray);

    linkIDArray = linkIDArray.filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) == index;
    });
    console.log(linkIDArray);

    this.reassignLinkId = linkIDArray;

    console.log(this.reassignLinkId);

    this.dialog.open(this.reAssignModalTemplate, {
      height: "300px",
      width: "400px",
      data: { oldUser: folderData.uploadedBy },
    });
  }

  onReassignSubmit() {
    console.log(this.reAssignModalForm.value);

    if (
      this.reAssignModalForm.value.newUser != null &&
      this.reAssignModalForm.value.newUser != ""
    ) {
      this.blockUI.start("re-assigning task ...");
      console.log(this.loggedInUserId, this.reassignLinkId);
      this.service
        .reAssignTask(
          this.reAssignModalForm.value.newUser,
          this.reassignLinkId,
          this.loggedInUserId
        )
        .then((res) => {
          console.log(res);
          if (res) {
            this.blockUI.stop();
            this.reAssignModalForm.reset();
            this.reassignLinkId = null;
            this.searchFilterSubmit();
            this.toastr.success("Re-assigned successfully");
          } else {
            this.blockUI.stop();
            this.toastr.error("something went wrong ");
          }
        });
      this.close();
    } else {
      this.toastr.warning("please select new user");
    }
  }

  close() {
    this.dialog.closeAll();
  }

  refreshPreview() {
    console.log("refreshPreview ....");
    console.log("this.tempIndex ....", this.tempIndex);
    console.log("this.tempFileId ....", this.tempFileId);
    console.log(this.dataSource1);
    let temp = this.dataSource1.data[this.tempIndex].files.data.filter(
      (res) => res.id === this.tempFileId
    );
    console.log(temp);
    temp[0].isViewed = 1;
    console.log(temp);

    /* Percentage increment */

    let tempData = this.dataSource1.data;

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
  }

  refreshRemoveFile() {
    console.log(this.dataSource1);
    let temp = this.dataSource1.data[this.tempIndex].files.data.filter(
      (res) => res.id != this.tempFileIdForFileRemove
    );
    this.dataSource1.data[this.tempIndex].files.data = temp;
    let tempData = this.dataSource1.data;

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
    console.log(this.dataSource1);
  }

  previewClose() {
    this.dialog.closeAll();
    console.log("Preview close ...");
    console.log(this.tempElement === this.expandedElement);
    console.log(this.tempElement);
    console.log(this.tempIndex);
    console.log(this.tempFileId);
    console.log(this.expandedElement);
    //this.sharedFileData = [];
    if (this.currentUserRole === "2") {
      //this.ngOnInit();

      this.refreshPreview();

      //   const newState:any = this.dataSource1.data.map(obj =>
      //     obj.files.data.id === this.tempFileId ? { ...obj, isViewed: 1 } : obj
      // );

      // console.log(newState);
      // this.dataSource1 = newState;
    } else {
      //this.getManagerData(this.tempUserId);
      this.refreshPreview();
    }

    this.cd.detectChanges();
    this.dataSource1._updateChangeSubscription();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
    if (this.dataSource1.filteredData.length === 0) {
      this.noDataFound = true;
    } else {
      this.noDataFound = false;
    }
  }
}
