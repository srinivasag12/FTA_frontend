import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  Inject,
  HostListener,
  Directive,
} from "@angular/core";
import {
  SharedLinkData,
  SharedLinkData1,
  LinkStatusType,
} from "./shared-upload-link.model";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MAT_SNACK_BAR_DATA,
} from "@angular/material/snack-bar";
import { ClipboardService } from "ngx-clipboard";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { MatDialogRef } from "@angular/material/dialog";
import { SharedfilesService } from "../sharedfiles/sharedfiles.service";
import { SharedUploadLinkService } from "../shared-upload-link/shared-upload-link.service";
import { DataService } from "src/app/shared/services/data.service";
import { Router } from "@angular/router";
import { NgBlockUI, BlockUI } from "ng-block-ui";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { FormGroup, FormBuilder, FormArray, FormControl } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { Clipboard } from "@angular/cdk/clipboard";

export interface DialogData {
  link: string;
}

@Component({
  selector: "app-shared-upload-link",
  templateUrl: "./shared-upload-link.component.html",
  styleUrls: ["./shared-upload-link.component.scss"],
})
export class SharedUploadLinkComponent implements OnInit {
  filterForm: FormGroup;
  horizontalPosition: MatSnackBarHorizontalPosition = "end";
  verticalPosition: MatSnackBarVerticalPosition = "top";
  _value: number = 0;
  _step: number = 1;
  _min: number = 1;
  _max: number = 30;
  pageNo: number = 0;

  displayedColumns: string[] = [
    "email",
    "genDateTime",
    "link",
    "code",
    "totalDays",
    "pendingDays",
    "extendedDays",
    "status",
    "cancelRequest",
    "loginStatus",
  ];

  linkStatusFilter: LinkStatusType[] = [
    { id: 1, linkName: "ACTIVE", isChecked: false },
    { id: 2, linkName: "CANCELLED", isChecked: false },
    // { id: 3, linkName: 'EXTENDED' },
    { id: 5, linkName: "EXPIRED", isChecked: false },
  ];

  //dataSource:SharedLinkData1[]=[];
  dataSource: MatTableDataSource<SharedLinkData1>;

  @ViewChild("link") template: TemplateRef<HTMLElement>;
  @ViewChild("cancelModal") template1: TemplateRef<HTMLElement>;
  @ViewChild("extendedModal") template2: TemplateRef<HTMLElement>;
  @ViewChild("filterLinkStatus") template3: TemplateRef<HTMLElement>;
  @ViewChild("pwd") template4: TemplateRef<HTMLElement>;

  @ViewChild(MatSort) sort: MatSort;

  showBtnPass: boolean = true;
  showPass: boolean = false;
  @BlockUI() blockUI: NgBlockUI;
  disableNext: boolean;
  filtersArr: any = [];
  checked: boolean = true;
  filterOpt: string;
  isDownloadLink: boolean = false;
  isUploadLink: boolean = false;
  noDataFound: boolean;
  third_party_url = environment.third_party_url;
  passcode: any;
  iosDevice: boolean = false;
  iosDeviceArr = ["iPhone", "iPod", "iPad"];

  constructor(
    private _snackBar: MatSnackBar,
    private router: Router,
    private _clipboardService: ClipboardService,
    private _clipboardService1: ClipboardService,
    private clipboard: Clipboard,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private dataService: DataService,
    private service: SharedfilesService,
    private sharedUploadService: SharedUploadLinkService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    console.log(this.router);
    if (this.router.url === "/main/sharedDownloadLinks") {
      this.dataService.setNavbarTitle("Links Shared to Download");
      this.isDownloadLink = true;
    } else if (this.router.url === "/main/sharedUploadLinks") {
      this.dataService.setNavbarTitle("Links Shared to Upload");
      this.isUploadLink = true;
    }

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
    // console.log(this.dataService.getEmailAndFileOwner())
    //this.dataSource=[];
  }

  onChangeEventFunc(name: string, isChecked: any, index) {
    console.log("index", index);
    console.log("onchange event", isChecked);
    console.log("onchange event", isChecked.checked);
    console.log("filtersArr", this.filtersArr);
    this.filtersArr = this.filterForm.controls.name as FormArray;

    if (isChecked.checked) {
      this.filtersArr.push(new FormControl(name));
      console.log("Checked ::: ", this.filterOpt);
      /* switch(index){
        case 1:
          if(this.filterOpt != ''){
            this.filterOpt = this.filterOpt+",1,3";
          }
          else{
            this.filterOpt = this.filterOpt+"1,3";
          }          
          break;
        case 2:
          if(this.filterOpt != ''){
            this.filterOpt = this.filterOpt+",2";
            this.linkStatusFilter[2].isChecked = true;
          }
          else{
            this.filterOpt = this.filterOpt+"2";
            this.linkStatusFilter[2].isChecked = true;
          }   
          break;
        case 5:
          if(this.filterOpt != ''){
            this.filterOpt = this.filterOpt+",4,5";
            this.linkStatusFilter[5].isChecked = true;
          }
          else{
            this.filterOpt = this.filterOpt+"4,5";
            this.linkStatusFilter[5].isChecked = true;
          }   
          break;  
          

      } */
    } else if (!isChecked.checked) {
      console.log("UNChecked ::: ", this.filterOpt);
      this.filtersArr.removeAt(index - 1);
      // switch(index){
      //   case 1:

      //       this.filterOpt = this.filterOpt.replace(",1,3",'');

      //     break;
      //   case 2:

      //       this.filterOpt = this.filterOpt.replace(",2",'');

      //     break;
      //   case 5:

      //       this.filterOpt = this.filterOpt.replace(",4,5",'');

      //     break;

      // }
    }
  }

  submit() {
    console.log("this.filterOpt", this.filterOpt);
    console.log(this.filterForm);
    console.log(this.filterForm.value.name.toString());
    if (this.filterForm.value.name.length != 0) {
      this.filterOpt = this.filterForm.value.name.toString();
    }

    console.log("this.filterOpt", this.filterOpt);

    /* console.log("STR FIRST",this.filterOpt.charAt(0)===',');
    console.log("STR LAST",this.filterOpt.charAt(this.filterOpt.length-1)===',');

    if(this.filterOpt.charAt(0)===','){
      this.filterOpt=this.filterOpt.substr(1);
    }
 */
    if (this.isUploadLink) {
      if (!this.filterOpt.includes("1")) {
        if (this.filterOpt.includes("5")) {
          this.filterOpt = this.filterOpt + ",4";
          this.getUploadedFileDetails(0, this.filterOpt).then((res: any) => {
            if (res.length != 0) {
              this.noDataFound = false;
            }
            this.pageNo = 0;
            this.filtersArr.controls = [];
          });
        } else {
          this.getUploadedFileDetails(0, this.filterOpt).then((res: any) => {
            console.log(res);
            if (res.length != 0) {
              this.noDataFound = false;
            }
            this.pageNo = 0;
            this.filtersArr.controls = [];
          });
        }
      } else {
        if (this.filterOpt.includes("5")) {
          this.filterOpt = this.filterOpt + ",3,4";
          this.getUploadedFileDetails(0, this.filterOpt).then((res: any) => {
            if (res.length != 0) {
              this.noDataFound = false;
            }
            this.pageNo = 0;
            this.filtersArr.controls = [];
          });
        } else {
          if (!this.filterOpt.includes("3")) {
            this.filterOpt = this.filterOpt + ",3";
          }

          //this.linkStatusFilter[0].isChecked = true;

          this.getUploadedFileDetails(0, this.filterOpt).then((res: any) => {
            if (res.length != 0) {
              this.noDataFound = false;
            }
            this.filterOpt = "1,3";
            this.pageNo = 0;
            this.filtersArr.controls = [];
          });
        }
      }
    } else if (this.isDownloadLink) {
      if (!this.filterOpt.includes("1")) {
        if (this.filterOpt.includes("5")) {
          this.filterOpt = this.filterOpt + ",4";
          this.getDownloadLinkDetails(0, this.filterOpt).then((res: any) => {
            if (res.length != 0) {
              this.noDataFound = false;
            }
            this.pageNo = 0;
            this.filtersArr.controls = [];
          });
        } else {
          this.getDownloadLinkDetails(0, this.filterOpt).then((res: any) => {
            if (res.length != 0) {
              this.noDataFound = false;
            }
            this.pageNo = 0;
            this.filtersArr.controls = [];
          });
        }
      } else {
        if (this.filterOpt.includes("5")) {
          this.filterOpt = this.filterOpt + ",3,4";
          this.getDownloadLinkDetails(0, this.filterOpt).then((res: any) => {
            if (res.length != 0) {
              this.noDataFound = false;
            }
            this.pageNo = 0;
            this.filtersArr.controls = [];
          });
        } else {
          this.filterOpt = this.filterOpt + ",3";
          this.getDownloadLinkDetails(0, this.filterOpt).then((res: any) => {
            if (res.length != 0) {
              this.noDataFound = false;
            }
            this.filterOpt = "1,3";
            this.pageNo = 0;
            this.filtersArr.controls = [];
          });
        }
      }
    }

    this.dialog.closeAll();
  }

  async ngOnInit() {
    this.filterOpt = "1,3";
    //this.linkStatusFilter[0].isChecked = true;
    if (this.isUploadLink) {
      await this.getUploadedFileDetails(this.pageNo, this.filterOpt);
    } else if (this.isDownloadLink) {
      await this.getDownloadLinkDetails(this.pageNo, this.filterOpt);
    }

    this.filterForm = this.fb.group({
      name: this.fb.array([]),
    });
    //this.dataSource.sort=this.sort;
  }

  async getUploadedFileDetails(pageNumber, filterOpt) {
    return new Promise((resolve) => {
      this.service
        .getUploadedFileDetails(pageNumber, filterOpt)
        .then((data: any[]) => {
          console.log(JSON.stringify(data));

          for (let index = 0; index < data.length; index++) {
            console.log("Index :: ", index);
            // console.log(new Date(data[index].expiryDate.getTime()-data[index].genDateTime.getTime()+(15*24*60*60*1000)));
            // console.log( new Date(data[index].genDateTime.getTime()+(0*24*60*60*1000)+(15*24*60*60*1000)) )

            /* data[index].genDateTime = new Date(data[index].genDateTime);
        data[index].expiryDate = new Date(data[index].expiryDate);
        
        let b:any=new Date(data[index].genDateTime.getTime()+(0*24*60*60*1000)+(15*24*60*60*1000));
        let todayDate:any=new Date();
        let expiryDate:any=new Date(data[index].expiryDate.getTime());
        let genDate:any=new Date(data[index].genDateTime.getTime());
      
        data[index].totalDays=(Math.round(( expiryDate-genDate) / (1000 * 60 * 60 * 24))).toString();
        let extendedDays=( expiryDate-genDate) / (1000 * 60 * 60 * 24);
        let pending_days = ( expiryDate- todayDate) / (1000 * 60 * 60 * 24);
        
        data[index].pendingDays=(Math.round(pending_days))
        data[index].extendedDays=data[index].extendedDays;
        console.log(Math.round(pending_days)+parseInt(data[index].extendedDays)); */
            /* */

            let expiryDate = moment(data[index].expiryDate);
            let genDate = moment(data[index].genDateTime);
            let todayDate = moment();
            console.log("TODAY DATE >>>>", todayDate);
            console.log("New Date ", new Date());

            //data[index].totalDays = expiryDate.diff(genDate, "days", false);
            data[index].totalDays = Math.ceil(
              moment.duration(expiryDate.diff(genDate)).asDays()
            );

            console.log("TOTAL DAYS >>>>", data[index].totalDays);
            console.log(
              "TOTAL DAYS >>>>",
              Math.ceil(moment.duration(expiryDate.diff(genDate)).asDays())
            );

            //data[index].pendingDays = expiryDate.diff(todayDate, "days", false);
            data[index].pendingDays = Math.round(
              moment.duration(expiryDate.diff(todayDate)).asDays()
            );

            console.log("EXPIRY DATE", expiryDate);
            console.log("TODAY DATE", todayDate);
            console.log("PENDING DAYS >>>>", data[index].pendingDays);
            console.log(
              "PENDING DAYS >>>>",
              moment.duration(expiryDate.diff(todayDate)).asDays()
            );
            console.log(
              "PENDING DAYS >>>>",
              Math.round(moment.duration(expiryDate.diff(todayDate)).asDays())
            );
            data[index].genDateTime = moment(data[index].genDateTime).format(
              "DD-MMM-YYYY HH:MM"
            );
            data[index].extendedDays = data[index].extendedDays;

            //data[index].pendingDays=(Math.round(pending_days)+parseInt(data[index].extendedDays)).toString();
            console.log("LINK STATUS >>>>", data[index].linkStatus);
            if (data[index].pendingDays > 0) {
              console.log("Link Not Expired");
              console.log(parseInt(data[index].pendingDays));

              console.log(typeof parseInt(data[index].pendingDays));
              switch (data[index].linkStatus) {
                case 1:
                  data[index].linkStatus = "ACTIVE";
                  break;

                case 2:
                  data[index].linkStatus = "CANCELLED";
                  break;

                case 3:
                  data[index].linkStatus = "ACTIVE";
                  break;

                case 4:
                  data[index].linkStatus = "EXPIRED";
                  break;

                case 5:
                  data[index].linkStatus = "EXPIRED";
                  break;
              }
            } else if (data[index].pendingDays <= 0) {
              console.log("Link  Expired");
              data[index].linkStatus = "EXPIRED";
              this.sharedUploadService
                .updateLinkStatus(data[index].link, 5)
                .then((res) => {
                  console.log(res);
                });
              data[index].pendingDays = "0";
            }

            switch (data[index].loggedInStatus) {
              case 1:
                data[index].loginStatus = "NOT YET";
                break;

              case 2:
                data[index].loginStatus = "LOGGED IN";
                break;

              case 3:
                data[index].loginStatus = "SUBMITTED";
                break;
            }
            data[index].cancelRequest = "";
            data[index].code = "";
          }

          data.sort(this.sortByOrderBy("linkStatus"));

          data = [...data];
          this.dataSource = new MatTableDataSource<SharedLinkData1>(data);
          this.dataSource.sort = this.sort;

          console.log(this.sort);
          console.log(this.dataSource);
          if (this.dataSource.data.length < 10) {
            console.log(
              "this.dataSource.data.length < 10 :: ",
              this.dataSource.data.length < 10
            );
            this.disableNext = true;
            this.noDataFound = false;
          } else {
            this.disableNext = false;
          }

          if (this.dataSource.data.length === 0) {
            this.noDataFound = true;
          }
          resolve(data);
        });
    });
  }

  async getDownloadLinkDetails(pageNumber, filterOpt) {
    return new Promise((resolve) => {
      this.service
        .getDownloadLinkDetails(pageNumber, filterOpt)
        .then((data: any[]) => {
          console.log(JSON.stringify(data));

          for (let index = 0; index < data.length; index++) {
            console.log("Index :: ", index);
            // console.log(new Date(data[index].expiryDate.getTime()-data[index].genDateTime.getTime()+(15*24*60*60*1000)));
            // console.log( new Date(data[index].genDateTime.getTime()+(0*24*60*60*1000)+(15*24*60*60*1000)) )

            /* data[index].genDateTime = new Date(data[index].genDateTime);
        data[index].expiryDate = new Date(data[index].expiryDate);
        
        let b:any=new Date(data[index].genDateTime.getTime()+(0*24*60*60*1000)+(15*24*60*60*1000));
        let todayDate:any=new Date();
        let expiryDate:any=new Date(data[index].expiryDate.getTime());
        let genDate:any=new Date(data[index].genDateTime.getTime());
      
        data[index].totalDays=(Math.round(( expiryDate-genDate) / (1000 * 60 * 60 * 24))).toString();
        let extendedDays=( expiryDate-genDate) / (1000 * 60 * 60 * 24);
        let pending_days = ( expiryDate- todayDate) / (1000 * 60 * 60 * 24);
        
        data[index].pendingDays=(Math.round(pending_days))
        data[index].extendedDays=data[index].extendedDays;
        */

            let expiryDate = moment(data[index].expiryDate);
            let genDate = moment(data[index].genDateTime);
            let todayDate = moment();
            console.log("TODAY DATE >>>>", todayDate);
            data[index].totalDays = Math.ceil(
              moment.duration(expiryDate.diff(genDate)).asDays()
            );
            console.log("TOTAL DAYS >>>>", data[index].totalDays);
            data[index].pendingDays = Math.round(
              moment.duration(expiryDate.diff(todayDate)).asDays()
            );

            console.log("PENDING DAYS >>>>", data[index].pendingDays);
            data[index].genDateTime = moment(data[index].genDateTime).format(
              "DD-MMM-YYYY HH:MM"
            );

            //data[index].pendingDays=(Math.round(pending_days)+parseInt(data[index].extendedDays)).toString();
            console.log("LINK STATUS >>>>", data[index].linkStatus);
            if (data[index].pendingDays > 0) {
              console.log("Link Not Expired");
              console.log(parseInt(data[index].pendingDays));

              console.log(typeof parseInt(data[index].pendingDays));
              switch (data[index].linkStatus) {
                case 1:
                  data[index].linkStatus = "ACTIVE";
                  break;

                case 2:
                  data[index].linkStatus = "CANCELLED";
                  break;
                // Extended but set to Active
                case 3:
                  data[index].linkStatus = "ACTIVE";
                  break;

                case 4:
                  data[index].linkStatus = "COMPLETED";
                  break;

                case 5:
                  data[index].linkStatus = "EXPIRED";
                  break;
              }
            } else if (data[index].pendingDays <= 0) {
              console.log("Link  Expired");
              data[index].linkStatus = "EXPIRED";
              this.sharedUploadService
                .updateDownloadLinkStatus(data[index].link, 5)
                .then((res) => {
                  console.log(res);
                });
              data[index].pendingDays = "0";
            }

            switch (data[index].loggedInStatus) {
              case 1:
                data[index].loginStatus = "NOT YET";
                break;

              case 2:
                data[index].loginStatus = "LOGGED IN";
                break;

              case 3:
                data[index].loginStatus = "SUBMITTED";
                break;
            }
            data[index].cancelRequest = "";
            data[index].code = "";
          }

          data.sort(this.sortByOrderBy("linkStatus"));

          data = [...data];
          this.dataSource = new MatTableDataSource<SharedLinkData1>(data);
          this.dataSource.sort = this.sort;
          if (this.dataSource.data.length < 10) {
            this.disableNext = true;
            this.noDataFound = false;
          } else {
            this.disableNext = false;
          }

          if (this.dataSource.data.length === 0) {
            this.noDataFound = true;
          }
          console.log(this.sort);
          console.log(this.dataSource);
          resolve(data);
        });
    });
  }

  sortData(sort: Sort) {
    console.log("sort", sort);
    let data = this.dataSource;
    if (!sort.active || sort.direction === "") {
      this.dataSource = data;
      return;
    }

    /* this.dataSource = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a.name, b.name, isAsc);
        default: return 0;
      }
    }); */
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortByOrderBy(prop) {
    return function (a, b) {
      if (a[prop] > b[prop]) {
        return 1;
      } else if (a[prop] < b[prop]) {
        return -1;
      }
      return 0;
    };
  }

  async prevBtn() {
    this.pageNo--;
    if (this.isUploadLink) {
      this.getUploadedFileDetails(this.pageNo, this.filterOpt).then((res) => {
        console.log(res);
        if (!(JSON.stringify(res) === "[]")) {
          console.log("yes1");
          this.disableNext = false;
          this.noDataFound = false;
        }
      });
    } else if (this.isDownloadLink) {
      this.getDownloadLinkDetails(this.pageNo, this.filterOpt).then((res) => {
        console.log(res);
        if (!(JSON.stringify(res) === "[]")) {
          console.log("yes1");
          this.disableNext = false;
          this.noDataFound = false;
        }
      });
    }
  }

  async nextBtn() {
    this.pageNo++;
    if (this.isUploadLink) {
      this.getUploadedFileDetails(this.pageNo, this.filterOpt).then(
        (res) => {
          console.log(res);
          if (JSON.stringify(res) === "[]") {
            console.log("yes");
            this.disableNext = true;
          }
        },
        (err) => {
          console.log(err);
        }
      );
    } else if (this.isDownloadLink) {
      this.getDownloadLinkDetails(this.pageNo, this.filterOpt).then(
        (res) => {
          console.log(res);
          if (JSON.stringify(res) === "[]") {
            console.log("yes");
            this.disableNext = true;
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit", this.sort);
    //this.dataSource.sort = this.sort;
  }

  close() {
    this.dialog.closeAll();
    this._value = 0;
  }

  cancelLink(data) {
    console.log("cancelLink....", data);
    console.log(this.dataSource.data[data.index].link);
    if (this.isUploadLink) {
      this.sharedUploadService
        .updateLinkStatus(this.dataSource.data[data.index].link, 2)
        .then(async (resp) => {
          console.log("Resp :: ", resp);
          if (resp) {
            this.toastr.success("Link cancelled successfully");
            this.dialog.closeAll();
            await this.getUploadedFileDetails(this.pageNo, this.filterOpt);
          } else {
            this.toastr.error("something went wrong");
          }
        });
    } else if (this.isDownloadLink) {
      this.sharedUploadService
        .updateDownloadLinkStatus(this.dataSource.data[data.index].link, 2)
        .then(async (resp) => {
          console.log("Resp :: ", resp);
          if (resp) {
            this.toastr.success("Link cancelled successfully");
            this.dialog.closeAll();
            await this.getDownloadLinkDetails(this.pageNo, this.filterOpt);
          } else {
            this.toastr.error("something went wrong");
          }
        });
    }
  }

  extend(data) {
    console.log(data.obj);
    console.log(this._value);
    console.log(this.dataSource.data[data.index].link);
    console.log(this.dataSource);
    console.log(data.index);

    if (this.isUploadLink) {
      console.log("_max ::", this._max);
      this.sharedUploadService
        .extendLinkValidity(this.dataSource.data[data.index].link, this._value)
        .then((resp) => {
          console.log("Resp :: ", resp);
          if (resp) {
            this.toastr.success("Link extended successfully");
            this._value = 0;
            this.ngOnInit();
          } else {
            this.toastr.error("something went wrong");
          }

          //this.dialog.closeAll();
        });
    } else if (this.isDownloadLink) {
      this.sharedUploadService
        .extendDownloadLinkValidity(
          this.dataSource.data[data.index].link,
          this._value
        )
        .then((resp) => {
          console.log("Resp :: ", resp);
          if (resp) {
            this.toastr.success("Link extended successfully");
            this._value = 0;
            this.ngOnInit();
          } else {
            this.toastr.error("something went wrong");
          }
        });
    }

    // console.log( new Date(data.obj.genDateTime.getTime()+(this._value*24*60*60*1000)+(15*24*60*60*1000)) );
    // let b:any=new Date(data.obj.genDateTime.getTime()+(this._value*24*60*60*1000)+(15*24*60*60*1000));
    // let a:any=new Date();
    // console.log(a,b)
    // let total_days = ( b- a) / (1000 * 60 * 60 * 24);

    // console.log(Math.round(total_days));

    // this.dataSource[data.index].extendedDays=this._value.toString()
    // this.dataSource[data.index].pendingDays=Math.round(total_days).toString();

    this.dialog.closeAll();
  }

  openSnackBar(link) {
    console.log("*********openLinkSnackBar***********");
    console.log("Link :: ", link);
    console.log("Link :: ", typeof link);
    console.log("Complete Link :: ", this.third_party_url + link);
    console.log("Complete Link :: ", typeof (this.third_party_url + link));

    this._clipboardService.copyFromContent(this.third_party_url + link);

    this._snackBar.openFromTemplate(this.template, {
      duration: 5 * 1000,
      data: { link: link },
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  openGenPwdSnackBar(pwd) {
    console.log("*********openGenPwdSnackBar***********");
    console.log("Pwd :: ", pwd);
    console.log("Pwd :: ", typeof pwd);

    this._clipboardService.copyFromContent(pwd);

    this._snackBar.openFromTemplate(this.template4, {
      duration: 15 * 1000,
      data: { pwd: pwd },
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

  dismiss() {
    this._snackBar.dismiss();
  }

  ngOnDestroy() {
    console.log("ngOnDestroy..");
    this.dismiss();
  }

  openCancelModal(index) {
    this.dialog.open(this.template1, {
      data: { index: index },
    });
  }

  openLinkStatusFilterModal() {
    this.dialog.open(this.template3, { disableClose: false });
  }

  openExtendedModal(sharedLink, index) {
    console.log(sharedLink);
    console.log(this._max + " - " + sharedLink.extendedDays);

    if (sharedLink.linkStatus === "ACTIVE") {
      this._max = 30 - sharedLink.extendedDays;

      console.log("MAX :: ", this._max);
      if (this._max === 0) {
        this.toastr.warning("You have reached Extension Limit");
      } else {
        this.dialog.open(this.template2, {
          data: { obj: sharedLink, index: index },
        });
      }
    } else {
      this.toastr.warning("Link either Cancelled or Expired ", "Cannot Extend");
    }
  }

  generateOTP(index, urn) {
    console.log("urn ::", urn);
    console.log("index ::", index);

    this.blockUI.start("Generating Passcode ...");

    this.sharedUploadService.generateNewPasscode(urn).then((res: any) => {
      console.log(res);

      console.log(this.dataSource);
      console.log(this.dataSource.data[index]);
      console.log(this.dataSource.data[index].code);

      if (res) {
        console.log(res);
        let passcode = res + "";
        console.log(passcode);
        this.openGenPwdSnackBar(passcode);
        //this.dataSource.data[index].code=passcode;

        this.blockUI.stop();

        // this.showBtnPass=false;
        // this.showPass=true;
        // let id="showPass_"+index;
        // let id1="showBtnPass_"+index;
        // document.getElementById(id).style.display="block";

        // document.getElementById(id1).style.display="none";
      } else {
        this.blockUI.stop();
      }
    });
  }

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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.filteredData.length === 0) {
      this.noDataFound = true;
    } else {
      if (this.dataSource.filteredData.length < 10) {
        this.disableNext = true;
        this.noDataFound = false;
      } else {
        this.disableNext = false;
      }
    }
  }
}
