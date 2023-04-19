import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  Inject,
  NgZone,
  ChangeDetectorRef,
  ElementRef,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormGroupDirective,
} from "@angular/forms";
import {
  SharingData,
  SharedData,
  keyvalue,
  SharedDataSource,
  Shared,
  Files,
  mimeType,
  SharedToThird,
  SharedToThirdFiles,
  Description,
} from "./sharedfiles.model";
import { SharedfilesService } from "./sharedfiles.service";
import { ToastrService } from "ngx-toastr";
import { environment } from "../../../environments/environment";
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import { DataService } from "src/app/shared/services/data.service";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { MatTableDataSource } from "@angular/material/table";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";
import { NgBlockUI, BlockUI } from "ng-block-ui";
import { SelectionModel } from "@angular/cdk/collections";
import { Router, NavigationEnd, RoutesRecognized } from "@angular/router";
import { CustomValidators } from "./customValidators";
import { MatChipInputEvent } from "@angular/material/chips/chip-input";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import {
  TabComponent,
  Tab,
  SelectEventArgs,
} from "@syncfusion/ej2-angular-navigations";
import { filter, pairwise } from "rxjs/operators";
import { MatChipList } from "@angular/material/chips";
import { FileArchiveService } from "../file-archive/file-archive.service";
import { UploadToThirdPartyService } from "../upload-to-third-party/upload-to-third-party.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as moment from "moment";

@Component({
  selector: "app-sharedfiles",
  templateUrl: "./sharedfiles.component.html",
  styleUrls: ["./sharedfiles.component.scss"],
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
export class SharedfilesComponent implements OnInit {
  @ViewChild("preview") template1: TemplateRef<HTMLElement>;
  @ViewChild("shareToModal") shareToModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild("deleteFolderModal")
  deleteFolderModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild("deleteFileModal")
  deleteFileModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild("mergeFileModal") mergeFileModalTemplate: TemplateRef<HTMLElement>;

  @ViewChild("tab") tab: TabComponent;
  dataSource: SharedData[];
  dataSource1: MatTableDataSource<any>;
  //'upload','share'
  columnsToDisplay = ["type", "vessel_NAME", "link_DESC"];
  innerDisplayedColumns = [
    "file_TYPE",
    "file_NAME",
    "preview",
    "uploadedat",
    "uploadedby",
    "file_SIZE",
  ];
  expandedElement: Shared | null;

  sharedToThirdDataSource: MatTableDataSource<any>;
  dataSourceForFolderClose: MatTableDataSource<any>;

  columnsToDisplaySharedToThird = [
    "type",
    "imoNo",
    "vesselName",
    "officialNo",
    "desc",
    "upload",
    "share",
    "archiveFolder",
  ];
  innerColumnsToDisplaySharedToThird = [
    "select",
    "type",
    "name",
    "preview",
    "sharedDate",
    "fileSize",
    "archiveFile",
  ];

  selection = new SelectionModel<SharedToThird>(false, []);
  selection1 = new SelectionModel<SharedToThird>(true, []);

  // Mapping Tab items Header property
  public headerText: Object = [
    { text: "Send Upload Link" },
    // { text: "Shared To Me" },
    // { text: "Shared By Me" },
    { text: "Send Download Link" },
  ];

  flip = false;
  enableProgressBar = false;

  thirdPartyFileUploadForm: FormGroup;
  emailFormControl: FormGroup;
  isEmailFormvalid: any;
  @ViewChild("emailForm", { static: false }) emailForm: FormGroupDirective;

  @ViewChild("emailListForUpload") emailListForUpload: MatChipList;
  @ViewChild("emailListForDownload") emailListForDownload: MatChipList;

  @ViewChild("chipsInput") chipsInput: ElementRef<HTMLInputElement>;
  @ViewChild("chipsInputDownload")
  chipsInputDownload: ElementRef<HTMLInputElement>;

  emailName: any;

  linkIdGenForm: FormGroup;

  _value: number = 15;
  _step: number = 1;
  _min: number = 1;
  _max: number = 30;

  _valueForThird: number = 15;
  _stepForThird: number = 1;
  _minForThird: number = 1;
  _maxForThird: number = 30;

  sharedFileData: any[] = [];
  base64: string;
  base641: string;
  url: any;
  blob_url: string;
  tryDoctype: any;
  @BlockUI() blockUI: NgBlockUI;
  uploadReqData: any;
  sendToThirdPartyModalForm: FormGroup;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  emails: any = [];
  uploadEmails: any = [];
  downloadEmails: any = [];

  files: any = [];
  folderIdTemp: any;
  sendingProgressBar: boolean = false;
  previousUrl: string;
  isUploadLink: boolean;
  isDownloadLink: boolean;
  sharedEmailList: any = [];
  description: any = [];
  loggedInUserId: number;
  tempIndex: any;
  tempFileId: any;
  noDataFound: boolean;
  isImg: any;
  iosDevice: boolean = false;
  iosDeviceArr = ["iPhone", "iPod", "iPad"];
  isExpanded: boolean = true;

  constructor(
    private service: SharedfilesService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private dataService: DataService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private removeFileService: UploadToThirdPartyService,
    private archiveService: FileArchiveService,
    readonly ngZone: NgZone,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    router.events
      .pipe(
        filter((evt: any) => evt instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((events: RoutesRecognized[]) => {
        console.log("previous url", events[0].urlAfterRedirects);
        console.log("current url", events[1].urlAfterRedirects);

        this.dataService.setPrevRouteUrl(events[0].urlAfterRedirects);

        console.log("this.previousUrl", this.previousUrl);
      });

    const numericNumberReg = "^-?[0-9]\\d*(\\.\\d{1,2})?$";

    console.log(
      "IS IPHONE OR IPAD",
      navigator.platform.match(/iPhone|iPod|iPad/)
    );
    let iosType = navigator.platform.match(/iPhone|iPod|iPad/)
      ? navigator.platform.match(/iPhone|iPod|iPad/).toString()
      : "";
    console.log("iosType", iosType);
    console.log(
      "this.iosDeviceArr.includes(iosType)",
      this.iosDeviceArr.includes(iosType)
    );
    if (iosType != "") {
      this.iosDevice = this.iosDeviceArr.includes(iosType);
    }

    this.dataService.getLoggedInUserId().then((res) => {
      console.log("USER ID ::", res);
      this.loggedInUserId = res;
    });

    console.log("this.router", this.router);
    console.log(
      "NAVIGATION EXTRAS ::",
      this.router.getCurrentNavigation().extras.state
    );
    /* if(this.router.getCurrentNavigation().extras.state){
      this.previousUrl=this.router.getCurrentNavigation().extras.state.prevUrl;
    } */

    this.service.getDescriptionData().then((res) => {
      console.log(res);
      this.description = res;
    });

    this.thirdPartyFileUploadForm = new FormGroup({
      vesselName: new FormControl("", [
        Validators.required,
        CustomValidators.validateDotAtFirstChar,
      ]),
      description: new FormControl("", Validators.required),
      vesselImoNo: new FormControl("", [
        Validators.required,
        CustomValidators.validateDot,
        Validators.required,
        Validators.max(9999999),
        Validators.min(999999),
        Validators.pattern(numericNumberReg),
      ]),
      vesselOfficialNo: new FormControl("", [
        Validators.required,
        CustomValidators.validateDot,
        Validators.required,
        Validators.min(999),
        Validators.max(999999),
      ]),
      linkDurationDays: new FormControl(),
    });

    this.linkIdGenForm = new FormGroup({
      vesselName: new FormControl("", [
        Validators.required,
        CustomValidators.validateDotAtFirstChar,
      ]),
      description: new FormControl("", Validators.required),
      vesselImoNo: new FormControl("", [
        Validators.required,
        CustomValidators.validateDot,
        Validators.required,
        Validators.max(9999999),
        Validators.min(999999),
      ]),
      vesselOfficialNo: new FormControl("", [
        Validators.required,
        CustomValidators.validateDot,
        Validators.required,
        Validators.max(999999),
        Validators.min(999),
      ]),
    });

    //this.emailFormControl = new FormControl(this.emails, [CustomValidators.validateRequired, CustomValidators.validateEmails]);

    this.dataSource = [];
  }

  keyPress(event: any) {
    console.log("KEY PRESS >>>>", event);
    console.log(event.target.value);
    console.log(event.target.value.charAt(0));
    console.log("EXP 1 ::", event.target.value.charAt(0) === "0");
    console.log("EXP 2 ::", event.keyCode === 48);
    const pattern = /[0-9\+\-\ ]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.target.value.charAt(0) === 0 && event.keyCode === 48) {
      event.preventDefault();
    }
  }

  preventNonNumericalInput(e: any) {
    console.log("preventNonNumericalInput");
    e = e || window.event;
    var charCode = typeof e.which == "undefined" ? e.keyCode : e.which;
    var charStr = String.fromCharCode(charCode);

    if (!charStr.match(/^[0-9]+$/)) e.preventDefault();
  }

  get VesselImoNo() {
    return this.thirdPartyFileUploadForm.get("vesselOfficialNo");
  }

  ngOnInit() {
    console.log("this.tab", this.tab);

    this.initUploadEmailForm();

    this.initDownloadEmailForm();

    this.service.getFileDetails().then((data: SharedData[]) => {
      console.log(data);
      console.log(JSON.stringify(data));

      if (data.length != 0) {
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
          data[index].uploadedat = new Date(data[index].uploadedat);
        }
        // sorting data
        data.sort(this.sortByOrderBy("uploadedDate"));
        data = [...data];
        this.dataSource = data;

        console.log("data", data);

        let groupedData = data.reduce((acc, next) => {
          // reusable file var
          let nextFile = {
            file_NAME: next.file_NAME,
            file_TYPE: next.file_TYPE,
            f_ID: next.f_ID,
            file_SIZE: next.file_SIZE,
            isfolder: next.isfolder,
            email: next.email,
            uploadedby: next.uploadedby,
            uploadedat: next.uploadedat,
          };

          // find similar link id, and join them
          let exist = acc.find((v) => v.lid === next.lid);
          if (exist) {
            // id exists, update its folders
            exist.files.push(nextFile);
          } else {
            // create new folders
            acc.push({
              lid: next.lid,
              vessel_NAME: next.vessel_NAME,
              link_DESC: next.description,
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
        this.dataSource1 = new MatTableDataSource(this.sharedFileData);
      } else {
        this.noDataFound = true;
      }

      console.log("this.dataSource1 ==>  ", this.dataSource1);
    });
    console.log(this.dataSource);
    console.log("this.dataSource1 :: ", this.dataSource1);

    /* this.service.getGeneratedLinkDetails().then(res => {
      console.log("RESPONSE",res);
      let data =res;
      for(let i=0;i<data.length;i++){
        data[i].files=null;
        data[i]={...data[i],type:"folder"}
      }
      console.log(data);
      this.sharedToThirdDataSource=new MatTableDataSource(data);
      
    }) */
  }

  initUploadEmailForm() {
    console.log("INIT UPLOAD EMAIL FORM METHOD");
    this.uploadEmails = [];

    this.emailFormControl = this.formBuilder.group(
      {
        emailsForUpload: [
          this.uploadEmails,
          [CustomValidators.validateRequired, CustomValidators.validateEmails],
        ],
      },
      { updateOn: "submit" }
    );

    this.isEmailFormvalid = this.emailFormControl.valid;
    this.emailFormControl.controls["emailsForUpload"].setValue(
      this.uploadEmails
    );

    this.emailFormControl
      .get("emailsForUpload")
      .statusChanges.subscribe(
        (status) => (this.emailListForUpload.errorState = status === "INVALID")
      );
  }

  initDownloadEmailForm() {
    console.log("INIT DOWNLOAD EMAIL FORM METHOD");
    this.downloadEmails = [];

    this.sendToThirdPartyModalForm = this.formBuilder.group(
      {
        emailsForDownload: [
          this.downloadEmails,
          [CustomValidators.validateRequired, CustomValidators.validateEmails],
        ],
        days: [""],
        comments: [""],
      },
      { updateOn: "submit" }
    );

    this.sendToThirdPartyModalForm.controls["emailsForDownload"].setValue(
      this.downloadEmails
    );

    this.sendToThirdPartyModalForm
      .get("emailsForDownload")
      .statusChanges.subscribe((status) => {
        console.log(status);
        this.emailListForDownload.errorState = status === "INVALID";
      });
  }

  /* Code For Folder Delete Operation */

  openDeleteFolderModal(folder) {
    console.log(folder);
    this.dialog.open(this.deleteFolderModalTemplate, {
      data: { folderId: folder.folderId },
    });
  }

  removeFolder(folder) {
    console.log(folder);
    console.log("FolderId", folder.folderId);
    this.blockUI.start("Archiving Folder ..");
    this.archiveService
      .folderArchive(folder.folderId)
      .then(async (res: any) => {
        console.log(res);
        if (res.status === 500) {
          this.toastr.error(res.error.message);
          this.close();
          this.blockUI.stop();
        } else {
          //this.sharedFileData=[];
          this.toastr.success("Folder removed successfully");
          this.getFolders();
          this.cd.detectChanges();
          this.close();
          this.blockUI.stop();
        }
      });
  }

  /* Code For File Delete Operation */

  openDeleteFileModal(file) {
    console.log(file);
    this.service.checkFileIsShared(file.id).then((res) => {
      if (!res) {
        this.ngZone.run(() => {
          this.dialog.open(this.deleteFileModalTemplate, {
            data: { fileId: file.id },
          });
        });
      } else {
        this.toastr.error("File is shared already , can't delete file");
      }
    });
  }

  removeFile(file) {
    console.log(file);
    this.tempFileId = file.fileId;
    this.blockUI.start("Removing Shared File ..");
    this.removeFileService.removeSharedFile(file.fileId).then((res) => {
      console.log(res);
      this.toastr.success("File Removed Successfully");
      //this.getFolders();
      this.refreshRemoveFile();
      this.cd.detectChanges();
      this.close();
      this.dialog.closeAll();
      this.blockUI.stop();
    });
  }

  refreshRemoveFile() {
    console.log("Refresh Remove File ...");
    console.log("this.sharedToThirdDataSource", this.sharedToThirdDataSource);
    console.log("this.tempIndex", this.tempIndex);
    console.log("this.tempFileId", this.tempFileId);
    let temp = this.sharedToThirdDataSource.data[0].files.filter(
      (res) => res.id != this.tempFileId
    );
    this.sharedToThirdDataSource.data[0].files = temp;
    console.log(temp);
    console.log(this.sharedToThirdDataSource);
  }

  openFileMergeModal() {
    console.log("this.mergeFileModalTemplate ..");
    this.ngZone.run(() => {
      this.dialog.open(this.mergeFileModalTemplate, {});
    });
  }

  omit_hash_char(event) {
    let k;
    k = event.charCode; //         k = event.keyCode;  (Both can be used)
    console.log("K", k);
    // return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
    return k != 35;
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

  getFolders() {
    console.log("get Folders");
    this.service.getGeneratedLinkDetails().then((res) => {
      console.log("RESPONSE", res);
      if (res.length != 0) {
        this.noDataFound = false;
        let data = res;
        for (let i = 0; i < data.length; i++) {
          data[i].files = null;
          data[i] = { ...data[i], type: "folder" };
        }
        console.log(data);
        this.sharedToThirdDataSource = new MatTableDataSource(data);
        this.dataSourceForFolderClose = new MatTableDataSource(data);
      } else {
        this.noDataFound = true;
        this.sharedToThirdDataSource = new MatTableDataSource([]);
      }
    });
  }

  public tabSelected(e: SelectEventArgs): void {
    console.log("ON TABS SELECTED METHOD");
    console.log(e);
    if (e.isSwiped) {
      e.cancel = true;
    }
    switch (e.selectedIndex) {
      case 0:
        console.log("ON TABS 0 SELECTED METHOD");
        this.dataService.setNavbarTitle("Send Upload Link");
        this.isDownloadLink = false;
        this.isUploadLink = true;
        this.initUploadEmailForm();

        if (this.uploadEmails.length != 0) {
          this.uploadEmails = [];
        }
        console.log("TAB 0", this.uploadEmails);
        break;
      case 1:
        console.log("ON TABS 1 SELECTED METHOD");
        this.dataService.setNavbarTitle("Send Download Link");
        this.isDownloadLink = true;
        this.isUploadLink = false;
        this.isExpanded = true;
        this.initDownloadEmailForm();
        if (this.downloadEmails.length != 0) {
          this.downloadEmails = [];
        }
        console.log("TAB 1", this.downloadEmails);
        this.service.getGeneratedLinkDetails().then((res) => {
          console.log("RESPONSE", res);
          if (res.length != 0) {
            this.noDataFound = false;
            let data = res;
            for (let i = 0; i < data.length; i++) {
              data[i].files = null;
              data[i] = { ...data[i], type: "folder" };
            }
            console.log(data);
            this.sharedToThirdDataSource = new MatTableDataSource(data);
            this.dataSourceForFolderClose = new MatTableDataSource(data);
          } else {
            this.noDataFound = true;
          }
        });
        break;
    }
  }

  public oncreated(tab) {
    console.log("ON CREATE TABS METHOD");
    //modify the tab data here.
    //tab.select(2);

    this.previousUrl = this.dataService.getPrevRouteUrl();
    console.log(this.previousUrl);

    if (this.previousUrl === "/main/uploadToThirdParty") {
      this.dataService.setNavbarTitle("Send Download Link");
      this.tab.select(1);
      this.isDownloadLink = true;
      this.dataService.removePrevUrl();
    } else {
      switch (this.router.url) {
        case "/main/sharedByThirdParty":
          this.dataService.setNavbarTitle("Send Upload Link");
          this.tab.select(0);
          this.isUploadLink = true;
          break;
        case "/main/sharedToThirdParty":
          this.dataService.setNavbarTitle("Send Download Link");
          this.tab.select(1);
          this.isDownloadLink = true;
          break;
      }
    }
  }

  addEmail(event: MatChipInputEvent) {
    console.log("Add Email", event);
    const input = event.input;
    const value = event.value;
    console.log("UPLOAD LINK :: ", this.isUploadLink);
    console.log("DOWNLOAD LINK :: ", this.isDownloadLink);
    if (value.trim() !== "") {
      if (this.isDownloadLink) {
        this.sendToThirdPartyModalForm.controls["emailsForDownload"].setErrors(
          null
        ); // 1
        const tempEmailsDownload = this.sendToThirdPartyModalForm.controls[
          "emailsForDownload"
        ].value; // 2
        console.log(
          this.sendToThirdPartyModalForm.controls["emailsForDownload"]
        );
        console.log(typeof tempEmailsDownload);
        console.log(tempEmailsDownload);

        console.log("TEMP EMAILS DWLD::", tempEmailsDownload);
        console.log("VALUE ::", value.trim());
        /* if (tempEmailsDownload.indexOf(value.trim()) !== -1) {
          this.toastr.warning("Email id already exists ");
        } else {
          tempEmailsDownload.push(value.trim());
          this.sendToThirdPartyModalForm.controls["emailsForDownload"].setValue(
            tempEmailsDownload
          ); 
        } */

        if (
          tempEmailsDownload
            .map((res) => res.toLowerCase())
            .indexOf(value.trim().toLowerCase()) !== -1
        ) {
          this.toastr.warning("Email id already exists ");
        } else {
          tempEmailsDownload.push(value.trim());
          this.sendToThirdPartyModalForm.controls["emailsForDownload"].setValue(
            tempEmailsDownload
          );
        }

        if (
          this.sendToThirdPartyModalForm.controls["emailsForDownload"].valid
        ) {
          console.log("INSIDE IF"); // 4
          this.sendToThirdPartyModalForm.controls[
            "emailsForDownload"
          ].markAsDirty();
          input.value = ""; // 5
        } else {
          console.log("INSIDE ElSE");
          const index = this.downloadEmails.findIndex(
            (value1) => value1 === value.trim()
          );
          if (index !== -1) {
            console.log("INSIDE ElSE -> IF", this.downloadEmails);
            this.downloadEmails.splice(index, 1); // 6
          }
        }
      } else if (this.isUploadLink) {
        console.log(this.emailFormControl.controls["emailsForUpload"].value);
        this.emailFormControl.controls["emailsForUpload"].setErrors(null); // 1
        const tempEmailsUpload = this.emailFormControl.controls[
          "emailsForUpload"
        ].value; // 2
        console.log("TEMP EMAILS ::", tempEmailsUpload);
        console.log("TYPE OF TEMP EMAILS ::", typeof tempEmailsUpload);
        console.log("VALUE ::", value.trim());
        console.log(
          "is Duplicate",
          tempEmailsUpload.indexOf(value.trim()) !== -1
        );

        console.log(
          "TEMP EMAILS1 ::",
          tempEmailsUpload.map((res) => res.toLowerCase())
        );
        console.log("VALUE1 ::", value.trim().toLowerCase());
        console.log(
          "is Duplicate1",
          tempEmailsUpload
            .map((res) => res.toLowerCase())
            .indexOf(value.trim().toLowerCase()) !== -1
        );

        /*  if (tempEmailsUpload.indexOf(value.trim()) !== -1) {
          this.toastr.warning("Email id already exists ");
        } else {
          tempEmailsUpload.push(value.trim());
          this.emailFormControl.controls["emailsForUpload"].setValue(
            tempEmailsUpload
          ); 
        } */

        if (
          tempEmailsUpload
            .map((res) => res.toLowerCase())
            .indexOf(value.trim().toLowerCase()) !== -1
        ) {
          this.toastr.warning("Email id already exists ");
        } else {
          tempEmailsUpload.push(value.trim());
          this.emailFormControl.controls["emailsForUpload"].setValue(
            tempEmailsUpload
          ); // 3
        }

        if (this.emailFormControl.valid) {
          // 4
          this.emailFormControl.controls["emailsForUpload"].markAsDirty();
          input.value = ""; // 5
        } else {
          const index = this.uploadEmails.findIndex(
            (value1) => value1 === value.trim()
          );
          if (index !== -1) {
            this.uploadEmails.splice(index, 1); // 6
          }
        }
      }
    } else {
      if (this.isDownloadLink) {
        this.sendToThirdPartyModalForm.controls[
          "emailsForDownload"
        ].updateValueAndValidity(); // 7
      } else if (this.isUploadLink) {
        this.emailFormControl.controls[
          "emailsForUpload"
        ].updateValueAndValidity();
      }
    }
  }

  onRemoveEmail(email: any) {
    if (this.isDownloadLink) {
      let controller = this.sendToThirdPartyModalForm.controls[
        "emailsForDownload"
      ];
      let index = this.downloadEmails.indexOf(email, 0);
      if (index > -1) {
        this.downloadEmails.splice(index, 1);
      }
      controller.updateValueAndValidity(); // <---- Here it is
      controller.markAsDirty();
    } else {
      let controller = this.emailFormControl.controls["emailsForUpload"];
      let index = this.uploadEmails.indexOf(email, 0);
      if (index > -1) {
        this.uploadEmails.splice(index, 1);
      }
      controller.updateValueAndValidity(); // <---- Here it is
      controller.markAsDirty();
    }
  }

  onShareToSubmit() {
    this.sendToThirdPartyModalForm.controls[
      "emailsForDownload"
    ].markAsUntouched();
    console.log("FilesArray :: ", this.files);
    console.log("FolderID", this.folderIdTemp);
    console.log(
      "this.sendToThirdPartyModalForm.valid",
      this.sendToThirdPartyModalForm.valid
    );

    if (this.sendToThirdPartyModalForm.valid) {
      console.log(
        "Ready to go: ",
        this.sendToThirdPartyModalForm.controls["emailsForDownload"].value
      );
      console.log("Ready to go: ", this.sendToThirdPartyModalForm);

      let data = {
        files: this.files,
        emails: this.sendToThirdPartyModalForm.value.emailsForDownload,
        folderId: this.folderIdTemp,
        comments: this.sendToThirdPartyModalForm.value.comments,
        days: this.sendToThirdPartyModalForm.value.days,
        userId: this.loggedInUserId,
      };

      console.log("Final Request Data ::", data);
      console.log("this.emails", this.downloadEmails);
      this.sendingProgressBar = true;
      this.service.shareFilesToThirdParty(data).then(async (res) => {
        this.sendingProgressBar = false;

        console.log(res);
        console.log(res.length);

        if (res.length > 0) {
          this.dialog.closeAll();
          this.openFileMergeModal();
        } else {
          this.downloadEmails = [];
          this._valueForThird = 15;
          this.files = [];
          this.folderIdTemp = null;
          this.initDownloadEmailForm();
          this.close();
        }

        //this.resetSendToThirdPartyModalForm();
      });
    }
  }

  fileMerge() {
    console.log("File Merge ...");
    let data = {
      files: this.files,
      emails: this.sendToThirdPartyModalForm.value.emailsForDownload,
      folderId: this.folderIdTemp,
      comments: this.sendToThirdPartyModalForm.value.comments,
      days: this.sendToThirdPartyModalForm.value.days,
      userId: this.loggedInUserId,
    };

    this.service.mergeFiles(data).then(async (res) => {
      console.log(res);
      if (res) {
        this.dialog.closeAll();
        //this.toastr.success("File Merged Successfully ");
        this.downloadEmails = [];
        this._valueForThird = 15;
        this.files = [];
        this.folderIdTemp = null;
        this.initDownloadEmailForm();
        this.close();
      } else {
        this.dialog.closeAll();
        this.toastr.error("Something went wrong");
        this.downloadEmails = [];
        this._valueForThird = 15;
        this.files = [];
        this.folderIdTemp = null;
        this.initDownloadEmailForm();
        this.close();
      }
    });

    console.log("DATA ::", data);
  }

  resetSendToThirdPartyModalForm() {
    console.log("resetSendToThirdPartyModalForm ..");

    this.downloadEmails = [];
    this._valueForThird = 15;
    this.files = [];
    this.folderIdTemp = null;
    this.sendToThirdPartyModalForm.reset({
      emails: this.downloadEmails,
      days: this._valueForThird,
      comments: "",
    });

    this.close();
    this.dialogRef.close();

    // this.chipsInputDownload.nativeElement.value = '';
    // this.chipsInputDownload.nativeElement.focus(); //WORKAROUND to update view
    // this.chipsInputDownload.nativeElement.blur(); //Removes focus from input

    // this.dialogRef.close();
    // this.close();
  }

  downloadModalClose() {
    console.log("DownloadModalClose()");
    this._valueForThird = 15;
    this.files = [];
    this.folderIdTemp = null;
    this.dialog.closeAll();
    this.initDownloadEmailForm();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    console.log("isAllSelected", this.selection);

    //console.log(this.sharedToThirdDataSource[0].files.length)
    // const numSelected = this.selection.selected.length;
    // console.log("numSelected",numSelected);
    // const numRows =this.dataSource1.data[0].files.data.length;
    // console.log("numRows",numRows);
    // // return numSelected === numRows;
    // return true;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    console.log("masterToggle");
    // this.isAllSelected() ?
    //     this.selection.clear() :
    //     this.dataSource1.data[0].files.data.forEach(row => this.selection.select(row));
  }

  /** Selected Items  */
  getSelectedItems() {
    console.log("getSelectedItems");
    this.selection1.selected.forEach((s: any) => {
      console.log(s);
      console.log(s.id);
      console.log(s.folderID);
      this.folderIdTemp = s.folderID;
      this.files.push(s.id);
    });

    if (this.files.length != 0) {
      console.log(this.sendToThirdPartyModalForm.controls["emailsForDownload"]);
      this.ngZone.run(() => {
        this.dialog.open(this.shareToModalTemplate, {
          height: "500px",
          width: "600px",
          disableClose: true,
          data: {
            title: "Share To ",
          },
        });
      });
    } else {
      this.toastr.warning("Please select atleast one file to share");
      //console.log(this.emails)
    }

    this.selection1.clear();
  }

  get emailControl() {
    return this.emailFormControl.controls;
  }

  get thirdPartyFileUploadFormControl() {
    return this.thirdPartyFileUploadForm.controls;
  }

  get linkIdGenFormControl() {
    return this.linkIdGenForm.controls;
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

  openPreviewModal(fileId, fileType) {
    console.log("FileID", fileId);
    console.log("fileType", fileType);
    let mimeTypeValue = this.getValueFromMIME(fileType);
    this.blockUI.start("Please wait , File is loading ...");
    if (mimeTypeValue != "unsupported") {
      this.service.getFilePreview(fileId).then((res: any) => {
        console.log(res);
        this.url = this.b64toBlob(res.fileData, fileType);
        console.log(this.url);
        console.log(this.url.type.includes("image"));
        // this.isImg = this.url.type.includes("image");
        this.blob_url = URL.createObjectURL(this.url);
        console.log(this.blob_url);
        this.tryDoctype = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.blob_url
        );
        if (this.tryDoctype != undefined || this.tryDoctype) {
          console.log(this.tryDoctype);
          this.blockUI.stop();
          this.ngZone.run(() => {
            this.dialog.open(this.template1, {
              height: "600px",
              width: "800px",
              data: {
                title: "previewww",
              },
            });
          });
        }
        console.log("base64", this.tryDoctype);
      });
    } else {
      //this.toastr.warning("Cannot Preview this type of File","Unsupported Format");
      this.downloadfile(fileId);
      this.blockUI.stop();
    }
  }

  close() {
    this.dialog.closeAll();
  }

  // method to send otp
  rotateFront() {
    console.log(this.emailFormControl.controls["emailsForUpload"].value);
    console.log(this.thirdPartyFileUploadForm.value);
    console.log(this.thirdPartyFileUploadForm);
    this.emailName = this.emailFormControl.value;
    console.log(this.emailName);
    this.sharedEmailList = this.emailName.emailsForUpload;

    console.log(
      this.thirdPartyFileUploadForm.valid,
      this.thirdPartyFileUploadForm.value
    );
    if (this.thirdPartyFileUploadForm.valid) {
      this.enableProgressBar = true;
      this.service
        .sendDownloadlink(
          this.emailFormControl.controls["emailsForUpload"].value,
          this.thirdPartyFileUploadForm.value
        )
        .then(
          (data: any) => {
            console.log("data" + JSON.stringify(data));
            console.log("data" + data);
            if (data) {
              this.enableProgressBar = false;
              this.flip = !this.flip;

              // this.uploadEmails=[];
              // console.log(this.emailFormControl.controls['emailsForUpload'].value)
              // this.emailFormControl.reset({emails:this.uploadEmails});
              // console.log(this.emailFormControl.controls['emailsForUpload'].value);
              // this.chipsInput.nativeElement.value = '';
              // this.chipsInput.nativeElement.focus(); //WORKAROUND to update view
              // this.chipsInput.nativeElement.blur(); //Removes focus from input

              this.initUploadEmailForm();

              this.toastr.success("Upload url sent successfully");
            } else {
              console.log("IF ERR 500");
              this.enableProgressBar = false;

              this.uploadEmails = [];
              this.initUploadEmailForm();
              // this.emailFormControl.reset({emails:this.uploadEmails});
              // this.chipsInput.nativeElement.value = '';
              // this.chipsInput.nativeElement.focus(); //WORKAROUND to update view
              // this.chipsInput.nativeElement.blur(); //Removes focus from input

              this.thirdPartyFileUploadForm.reset();
              this._value = 15;
            }
          },
          (error) => {
            console.log(error);
          }
        )
        .catch((err) => {
          console.log(err);
        });
    }
  }

  rotateBack() {
    console.log("this._value", this._value);
    this.flip = !this.flip;
    //this.uploadEmails=[];
    this._value = 15;
    console.log(this.emailFormControl.controls["emailsForUpload"].value);
    this.thirdPartyFileUploadForm.reset({ linkDurationDays: this._value });
  }

  generateLinkId() {
    console.log("GENERATE LINK ID METHOD");
    console.log("generateLinkId", this.linkIdGenForm.value);
    this.blockUI.start("Creating Folder ..");
    this.service
      .generateLinkID(
        this.linkIdGenForm.value.vesselName,
        this.linkIdGenForm.value.description,
        this.linkIdGenForm.value.vesselOfficialNo,
        this.linkIdGenForm.value.vesselImoNo
      )
      .then(
        (resp) => {
          console.log(resp);
          if (resp.status === 500) {
            this.blockUI.stop();
            //this.toastr.warning(resp.error.message)
            this.toastr.warning(
              this.linkIdGenForm.value.vesselName + " folder name already exist"
            );
          } else {
            this.blockUI.stop();
            this.toastr.success("Folder Created sucessfully");
            this.isExpanded = !this.isExpanded;
            this.getFolders();
            this.linkIdGenForm.reset();
          }
        },
        (err) => {
          console.log("ERROR :: ", err);
        }
      );
  }

  upload(data) {
    console.log(data);
    localStorage.setItem("folderId", data.folderId);
    this.router.navigate(["main/uploadToThirdParty"]);
    // this.router.navigate(['main/uploadToThirdParty'],{ state: { uploadProp: data } });
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

  downloadfile(id: string) {
    console.log(environment.api + "download/thirdparty/shared/file/" + id);
    window.open(
      environment.api + "download/thirdparty/shared/file/" + id,
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

  /// Input Increment Stepper

  incrementValue(step: number = 1): void {
    let inputValue = this._value + step;
    this._value = inputValue;
  }

  shouldDisableDecrement(inputValue: number): boolean {
    return inputValue <= this._min;
  }

  shouldDisableIncrement(inputValue: number): boolean {
    return inputValue >= this._max;
  }

  incrementValueForThird(step: number = 1): void {
    let inputValue = this._valueForThird + step;
    this._valueForThird = inputValue;
  }

  shouldDisableDecrementForThird(inputValue: number): boolean {
    return inputValue <= this._minForThird;
  }

  shouldDisableIncrementForThird(inputValue: number): boolean {
    return inputValue >= this._maxForThird;
  }

  ///

  toggleRow(element: Shared) {
    element.files && (element.files as MatTableDataSource<Files>).data.length
      ? (this.expandedElement =
          this.expandedElement === element ? null : element)
      : null;
    this.cd.detectChanges();
  }

  toggleExpansion() {
    console.log("toggleExpansion...");
    console.log(this.isExpanded);
  }

  async toggleRow1(element: any, index, isClose) {
    console.log("dataSourceForFolderClose >>", this.dataSourceForFolderClose);

    /* -------------------------- */
    if (isClose) {
      //this.isExpanded = true ;
      //this.sharedToThirdDataSource=this.dataSourceForFolderClose
      this.getFolders();
      //console.log(this.dataSourceForFolderClose)
    } else {
      console.log("open....");
      console.log(this.isExpanded);
      this.isExpanded = false;
      let filteredData = this.sharedToThirdDataSource.data.filter(
        (res) => res.folderId === element.folderId
      );
      console.log("filteredData>>", filteredData);
      this.sharedToThirdDataSource.data = filteredData;
    }

    /* -------------------------- */
    this.tempIndex = index;
    console.log("Toggle Row ....");
    console.log(this.sharedToThirdDataSource);
    this.selection1.clear();
    this.files = [];

    console.log("this.expandedElement", this.expandedElement);
    console.log(
      "this.expandedElement === element",
      this.expandedElement === element
    );
    console.log("element", element);
    console.log(
      " element.files && (element.files).length ",
      element.files && element.files.length
    );

    console.log(element);
    console.log(index);
    console.log(element.folderId);

    await this.service
      .getUploadedFilesForThisLinkId(element.folderId)
      .then(async (res: any) => {
        console.log(res);
        if (
          res.status === 500 &&
          res.error.message === "No File uploaded yet"
        ) {
          this.getFolders();
          this.isExpanded = !this.isExpanded;
          this.toastr.warning("Please Upload atleast one file to view");
        }
        if (res.status === 404) {
          this.toastr.warning("Please Upload atleast one file to view");
        }
        if (res.uploadedFiles.length === 0) {
          this.getFolders();
          this.isExpanded = !this.isExpanded;
          this.toastr.warning("Please Upload atleast one file to view");
        } else if (res.status != 500 && res.uploadedFiles.length != 0) {
          console.log(this.sharedToThirdDataSource);
          let data = res.uploadedFiles;
          for (let i = 0; i < data.length; i++) {
            console.log(data[i].type, data[i].fileSize, data[i].sharedDate);
            data[i].type = this.getValueFromKey(data[i].type);
            data[i].sharedDate = moment(data[i].sharedDate);
            /* data[i].sharedDate = moment(data[i].sharedDate).format(
              "DD-MMM-YYYY HH:MM"
            ); */
            let sizeAbc = data[i].fileSize + "";
            let lnt = sizeAbc.length;
            if (lnt > 6) {
              data[i].fileSize =
                (Number(sizeAbc) / (1024 * 1024) + "").substring(0, 5) + "MB";
            } else {
              data[i].fileSize =
                (Number(sizeAbc) / 1024 + "").substring(0, 5) + "KB";
            }
            //data[i].sharedDate = new Date(data[i].sharedDate);
            data[i].folderID = element.folderId;
          }
          console.log(data);
          // res={...res,folderID:element.folderId}
          console.log("RES >>", res);
          console.log(this.sharedToThirdDataSource);
          this.sharedToThirdDataSource.data[0].files = data;
          console.log(this.sharedToThirdDataSource);
          console.log(this.sharedToThirdDataSource.data.length);
          this.cd.detectChanges();
        }
      })
      .then((res) => {
        console.log("RESPONSE", res);
        console.log("element", element);
        console.log(
          " element.files && (element.files).length ",
          element.files && element.files.length
        );
        element.files && element.files.length
          ? (this.expandedElement =
              this.expandedElement === element ? null : element)
          : null;
      });
    this.cd.detectChanges();
  }
}
