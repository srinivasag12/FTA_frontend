import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { DataService } from "src/app/shared/services/data.service";
import { DashboardService } from "./dashboard.service";
import { ChartType, Column, GoogleChartComponent } from "angular-google-charts";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { PageEvent } from "@angular/material/paginator";
import * as moment from "moment";

interface Days {
  value: number;
  viewValue: string;
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  userId: number;
  thirdPartyPageNo: number = 0;
  urlStatusPageNo: number = 0;
  urlStatusNext: boolean;
  thirdPartyNext: boolean;
  horizontalPosition: MatSnackBarHorizontalPosition = "end";
  verticalPosition: MatSnackBarVerticalPosition = "bottom";

  days: Days[] = [
    { value: 15, viewValue: "15 Days" },
    { value: 30, viewValue: "30 Days" },
    { value: 45, viewValue: "45 Days" },
    { value: 60, viewValue: "60 Days" },
  ];

  public charts: {
    title: string;
    type: ChartType;
    data: any[][];
    columns?: Column[];
    options?: {};
  }[] = [];

  @ViewChild("chart", { static: true })
  public chart: GoogleChartComponent;

  //chartjs
  @ViewChild("pieChart", { static: false }) pieChart;
  pie: any;
  @ViewChild("pieChart1", { static: false }) pieChart1;
  pie1: any;

  @ViewChild("passwordExpiryNotification")
  passwordExpiryNotificationTemplate: TemplateRef<HTMLElement>;

  last_login: Date;
  last_logout: Date;
  previousUrl: any;
  piechartData: any = [];
  barchartData: any = [];

  pageEvent: any;

  isAdmin: boolean;

  day: number = 15;
  pageNo: number = 0;
  pageSize: number = 5;
  folderNotViewedDS: any;
  noDataFoundFoldersNotViewed: boolean;
  displayFolderNotViewedColumns: string[];

  dayForFileArchive: number = 15;
  pageNoForFileArchive: number = 0;
  pageSizeForFileArchive: number = 5;
  filesGoingToDeleteDS: any;
  noDataFoundForFilesGoingToDelete: boolean;
  displayFilesGoingToDeleteColumns: any;

  displayReassignColumns: any;
  reassignDS: any;
  noDataFoundForRecentReassign: boolean;
  pageNoForReAssign: number = 0;
  pageSizeForReAssign: number = 5;
  UploadOrDownload: any = "U";
  chartEmpty: any;
  foldersNotViewedTitle: string;
  filesGoingToDeleteTitle: string;

  constructor(
    private dataService: DataService,
    public dashboardService: DashboardService,
    private toastr: ToastrService,
    public datepipe: DatePipe,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    this.dataService.setNavbarTitle("Dashboard");
    this.charts.push(
      {
        title: "NO. OF FILES IN VESSEL (UPLOAD)",
        type: ChartType.ColumnChart,
        columns: ["status", "Files"],
        data: this.piechartData,
        options: {
          animation: {
            duration: 250,
            easing: "ease-in-out",
            startup: true,
          },
          isStacked: true,
          explorer: { axis: "vertical" },
          hAxis: {
            textPosition: "none",
            viewWindowMode: "maximized",
          },

          legend: { position: "bottom" },
          // explorer: {axis: 'horizontal', keepInBounds: false}
        },
      },

      {
        title: "NO. OF VESSELS BASED ON INSPECTION TYPE (UPLOAD)",
        type: ChartType.PieChart,
        columns: ["No of Vessel", "Inspection Type"],
        data: this.barchartData,
        options: {
          animation: {
            duration: 250,
            easing: "ease-in-out",
            startup: true,
          },
          isStacked: false,
          is3D: true,
          legend: { position: "right", alignment: "start" },
        },
      }
    );

    console.log("this.router", this.router);
    console.log(
      "NAVIGATION EXTRAS ::",
      this.router.getCurrentNavigation().extras.state
    );
    if (this.router.getCurrentNavigation().extras.state) {
      this.previousUrl = this.router.getCurrentNavigation().extras.state.prevUrl;
    }

    this.dataService.getUserRole().then((res: any) => {
      if (res === "2") {
        this.isAdmin = false;
        this.displayFolderNotViewedColumns = [
          "email",
          "vesselname",
          "description",
          "imo",
          "vslofficialno",
          "completedon",
        ];

        this.displayFilesGoingToDeleteColumns = [
          "sharedby",
          "filename",
          "archievedon",
          "willbedeletedon",
        ];

        this.filesGoingToDelete(
          this.dayForFileArchive,
          this.pageNoForFileArchive,
          this.pageSizeForFileArchive
        );
      } else {
        this.isAdmin = true;
        this.displayFolderNotViewedColumns = [
          "email",
          "vesselname",
          "description",
          "imo",
          "vslofficialno",
          "completedon",
          //"owner"
        ];

        this.displayReassignColumns = [
          "reassignedto",
          "vesselname",
          "description",
          "vslimo",
          "vslofficialno",
          // "submittedby",
          // "completedon",

          "reassignedon",
        ];

        this.recentReassign(this.pageNoForReAssign, this.pageSizeForReAssign);
      }
    });

    this.foldersNotViewedTitle = "FOLDERS NOT VIEWED (IN 15 DAYS) - UPLOAD";
    this.foldersNotViewed(this.day, this.pageNo, this.pageSize);

    this.filesGoingToDeleteTitle =
      "FILES GOING TO DELETE (IN 15 DAYS) - UPLOAD";

    this.initChart();
  }

  async initChart() {
    console.log("initChart....");
    this.dashboardService.getPieChartData("U").then((res: any) => {
      console.log("BAR CHART DATA >>>", res);
      let a = [];
      res.forEach((element) => {
        if (element.value != 0) a.push([element.key, element.value]);
      });
      console.log(a);
      this.charts[0].data = a;
    });

    this.dashboardService.getBarChartData("U").then((res: any) => {
      console.log("PIE CHART DATA >>>", res);

      console.log(res.map((res) => res.value).some((i) => i > 0));
      this.chartEmpty = res.map((res) => res.value).some((i) => i > 0);
      console.log(res.map((res) => res.value).every((e) => console.log(e)));

      let a = [];
      res.forEach((element) => {
        console.log(element);
        if (element.value != 0) a.push([element.key, parseInt(element.value)]);
      });
      console.log(a);
      this.charts[1].data = a;
      console.log(this.charts[1].data.every((e) => console.log(e)));
    });
  }

  onValChange(UploadOrDownload) {
    this.UploadOrDownload = UploadOrDownload;
    console.log("this.UploadOrDownload ::", this.UploadOrDownload);

    if (UploadOrDownload === "U") {
      this.charts[1].title = "NO. OF VESSELS BASED ON INSPECTION TYPE (UPLOAD)";
      this.charts[0].title = "NO. OF FILES IN VESSEL (UPLOAD)";
      this.foldersNotViewedTitle = "FOLDERS NOT VIEWED (IN 15 DAYS) - UPLOAD";
      this.filesGoingToDeleteTitle =
        "FILES GOING TO DELETE (IN 15 DAYS) - UPLOAD";

      this.foldersNotViewed(this.day, this.pageNo, this.pageSize);
      if (!this.isAdmin) {
        this.filesGoingToDelete(
          this.dayForFileArchive,
          this.pageNoForFileArchive,
          this.pageSizeForFileArchive
        );
      }
    } else {
      this.charts[1].title =
        "NO. OF VESSELS BASED ON INSPECTION TYPE (DOWNLOAD)";
      this.charts[0].title = "NO. OF FILES IN VESSEL (DOWNLOAD)";
      this.foldersNotViewedTitle = "FOLDERS NOT VIEWED (IN 15 DAYS) - DOWNLOAD";
      this.filesGoingToDeleteTitle =
        "FILES GOING TO DELETE (IN 15 DAYS) - DOWNLOAD";

      this.foldersNotViewedForDownload(this.day, this.pageNo, this.pageSize);
      if (!this.isAdmin) {
        this.filesGoingToDeleteForDownload(
          this.dayForFileArchive,
          this.pageNoForFileArchive,
          this.pageSizeForFileArchive
        );
      }
    }

    this.dashboardService
      .getPieChartData(UploadOrDownload)
      .then(async (res: any) => {
        console.log("BAR CHART DATA >>>", res);
        let a = [];
        res.forEach((element) => {
          if (element.value != 0) a.push([element.key, element.value]);
        });
        console.log(a);
        this.charts[0].data = await a;
      });

    this.dashboardService
      .getBarChartData(this.UploadOrDownload)
      .then(async (res: any) => {
        console.log("PIE CHART DATA >>>", res);
        this.chartEmpty = res.map((res) => res.value).some((i) => i > 0);
        let a = [];
        res.forEach((element) => {
          if (element.value != 0) a.push([element.key, element.value]);
        });
        console.log(a);
        this.charts[1].data = await a;
      });
  }

  /* FOLDERS NOT VIEWED - UPLOAD / DOWNLOAD  */

  foldersNotViewed(days, pageNo, pageSize) {
    this.dashboardService
      .getFoldersNotViewedData(days, pageNo, pageSize)
      .then((res: any) => {
        console.log("FOLDER NOT VIEWED ::", res);
        if (res.length === 0) {
          this.noDataFoundFoldersNotViewed = true;
          this.folderNotViewedDS = [];
        } else {
          res.forEach((element) => {
            console.log(element);
            element.completedon = moment(element.completedon).format(
              "DD-MMM-YYYY HH:MM"
            );
          });
          this.noDataFoundFoldersNotViewed = false;
          this.folderNotViewedDS = res;
        }
      });
  }

  foldersNotViewedForDownload(days, pageNo, pageSize) {
    this.dashboardService
      .getFoldersNotViewedDataForDownload(days, pageNo, pageSize)
      .then((res: any) => {
        console.log("FOLDER NOT VIEWED ::", res);
        if (res.length === 0) {
          this.noDataFoundFoldersNotViewed = true;
          this.folderNotViewedDS = [];
        } else {
          res.forEach((element) => {
            console.log(element);
            element.completedon = moment(element.completedon).format(
              "DD-MMM-YYYY HH:MM"
            );
          });
          this.noDataFoundFoldersNotViewed = false;
          this.folderNotViewedDS = res;
        }
      });
  }

  /* ----------- FOLDERS NOT VIEWED - UPLOAD / DOWNLOAD  */

  filesGoingToDelete(days, pageNo, pageSize) {
    this.dashboardService
      .getFileGoingToDelete(days, pageNo, pageSize)
      .then((res: any) => {
        console.log("FILE GOING TO DELETE ::", res);
        if (res.length === 0) {
          this.noDataFoundForFilesGoingToDelete = true;
          this.filesGoingToDeleteDS = [];
        } else {
          console.log(res);
          res.forEach((element) => {
            console.log(element);
            element.archievedon = moment(element.archievedon).format(
              "DD-MMM-YYYY HH:MM"
            );
            element.willbedeletedon = moment(element.willbedeletedon).format(
              "DD-MMM-YYYY HH:MM"
            );
          });
          this.noDataFoundForFilesGoingToDelete = false;

          this.filesGoingToDeleteDS = res;
        }
      });
  }

  filesGoingToDeleteForDownload(days, pageNo, pageSize) {
    this.dashboardService
      .getFileGoingToDeleteForDownload(days, pageNo, pageSize)
      .then((res: any) => {
        console.log("FILE GOING TO DELETE ::", res);
        if (res.length === 0) {
          this.noDataFoundForFilesGoingToDelete = true;
          this.filesGoingToDeleteDS = [];
        } else {
          console.log(res);
          res.forEach((element) => {
            console.log(element);
            element.archievedon = moment(element.archievedon).format(
              "DD-MMM-YYYY HH:MM"
            );
            element.willbedeletedon = moment(element.willbedeletedon).format(
              "DD-MMM-YYYY HH:MM"
            );
          });
          this.noDataFoundForFilesGoingToDelete = false;

          this.filesGoingToDeleteDS = res;
        }
      });
  }

  recentReassign(pageNo, pageSize) {
    this.dashboardService
      .getRecentReassign(pageNo, pageSize)
      .then((res: any) => {
        console.log("RECENT RE-ASSIGN ::", res);
        if (res.length === 0) {
          this.noDataFoundForRecentReassign = true;
          this.reassignDS = [];
        } else {
          res.forEach((element) => {
            console.log(element);
            element.completedon = moment(element.completedon).format(
              "DD-MMM-YYYY HH:MM"
            );
            element.reassignedon = moment(element.reassignedon).format(
              "DD-MMM-YYYY HH:MM"
            );
          });
          this.noDataFoundForRecentReassign = false;
          this.reassignDS = res;
        }
      });
  }

  onDaysChange(event, fname) {
    console.log(event.value);

    switch (fname) {
      case "FOLDER NOT VIEWED":
        this.day = event.value;
        this.foldersNotViewed(event.value, this.pageNo, this.pageSize);
        break;

      case "FILES GOING TO DELETE":
        this.day = event.value;
        this.filesGoingToDelete(event.value, this.pageNo, this.pageSize);
        break;
    }
  }

  public handlePage(e: any, fname) {
    console.log(e);
    switch (fname) {
      case "FOLDER NOT VIEWED":
        this.foldersNotViewed(this.day, e.pageIndex, e.pageSize);
        break;

      case "FILES GOING TO DELETE":
        this.filesGoingToDelete(this.day, e.pageIndex, e.pageSize);
        break;

      case "REASSIGN":
        this.recentReassign(e.pageIndex, e.pageSize);
        break;
    }
  }

  async ngOnInit() {
    this.dataService.getLastLogin().then(async (res) => {
      console.log("LAST LOGIN >>> ", res);
      this.last_login = new Date(res);
      if (this.previousUrl === "login" && this.last_login != null)
        await this.toastr.info(
          "Last Login  :  " +
            this.datepipe.transform(this.last_login, "dd-MMM-yyy  HH:mm")
        );
    });
    this.dataService.getLastLogout().then(async (res) => {
      console.log("LAST LOGOUT >>> ", res);
      this.last_logout = new Date(res);
      if (this.previousUrl === "login" && this.last_login != null)
        await this.toastr.info(
          "Last Logout  :  " +
            this.datepipe.transform(this.last_logout, "dd-MMM-yyy  HH:mm")
        );
    });

    this.dataService.getLastLoginAndLogout().then(async (res: any) => {
      console.log("LAST LOGIN AND LOGOUT >>> ", res);
    });

    this.dataService.getPasswordExpiryNotification().then((res: any) => {
      if (
        res != null &&
        this.previousUrl === "login" &&
        this.last_login != null
      ) {
        this._snackBar.openFromTemplate(
          this.passwordExpiryNotificationTemplate,
          {
            duration: 15 * 1000,
            data: { notification: res },
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
          }
        );
      }
    });
  }

  toNewLineString(input: string) {
    var lines = input.split(",");
    console.log(lines);
    var output = "";
    lines.forEach((element) => {
      output += element + "\n";
    });
    console.log(output);
    return output;
  }

  ngOnDestroy() {
    this.dataService.removePasswordExpiryNotification();
  }
}
