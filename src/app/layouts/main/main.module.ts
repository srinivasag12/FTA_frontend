import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MainComponent } from "./main.component";
import { DashboardComponent } from "src/app/pages/dashboard/dashboard.component";
import { SharedfilesComponent } from "src/app/pages/sharedfiles/sharedfiles.component";
import { RouterModule } from "@angular/router";
import { FlexLayoutModule } from "@angular/flex-layout";
import { SharedModule } from "src/app/shared/shared.module";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { TabModule } from "@syncfusion/ej2-angular-navigations";
import { ButtonModule } from "@syncfusion/ej2-angular-buttons";

import { MatDividerModule } from "@angular/material/divider";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTableModule } from "@angular/material/table";
import {
  MatDialogModule,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MAT_DIALOG_DEFAULT_OPTIONS,
} from "@angular/material/dialog";
import {
  MatSnackBarModule,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatAutocompleteModule } from "@angular/material/autocomplete";

import { TabAllModule } from "@syncfusion/ej2-angular-navigations";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FlipModule } from "ngx-flip";
import { SharedUploadLinkComponent } from "src/app/pages/shared-upload-link/shared-upload-link.component";
import { FileArchiveComponent } from "src/app/pages/file-archive/file-archive.component";

import { ClipboardModule } from "ngx-clipboard";
import { NgOtpInputModule } from "ng-otp-input";
import { BlockUIModule } from "ng-block-ui";
import { MatPaginatorModule } from "@angular/material/paginator";
import { CookieService } from "ngx-cookie-service";
import { MatSortModule } from "@angular/material/sort";
import { MatChipsModule } from "@angular/material/chips";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { UploadToThirdPartyComponent } from "src/app/pages/upload-to-third-party/upload-to-third-party.component";
import { FileSharedByThirdPartyComponent } from "src/app/pages/file-shared-by-third-party/file-shared-by-third-party.component";
import { FileSharedToThirdPartyComponent } from "src/app/pages/file-shared-to-third-party/file-shared-to-third-party.component";
import { CommonLinkForUploadAndDownloadComponent } from "src/app/pages/common-link-for-upload-and-download/common-link-for-upload-and-download.component";
import { GoogleChartsModule } from "angular-google-charts";
import { MatSelectModule } from "@angular/material/select";
import { HistoryComponent } from "src/app/pages/history/history.component";
import { NgCircleProgressModule } from "ng-circle-progress";
import { MatNativeDateModule } from "@angular/material/core";
import { UserMaintenanceComponent } from "src/app/pages/user-maintenance/user-maintenance.component";
import { AvatarModule } from "ngx-avatar";

@NgModule({
  declarations: [
    MainComponent,
    DashboardComponent,
    SharedfilesComponent,
    SharedUploadLinkComponent,
    FileArchiveComponent,
    UploadToThirdPartyComponent,
    FileSharedByThirdPartyComponent,
    FileSharedToThirdPartyComponent,
    CommonLinkForUploadAndDownloadComponent,
    HistoryComponent,
    UserMaintenanceComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    SharedModule,
    MatSidenavModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule,
    MatButtonToggleModule,

    TabModule,
    TabAllModule,
    FormsModule,
    ReactiveFormsModule,
    FlipModule,
    ClipboardModule,
    NgOtpInputModule,
    NgCircleProgressModule.forRoot(),
    BlockUIModule.forRoot(),
    ButtonModule,
    GoogleChartsModule,
    AvatarModule,
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: { hasBackdrop: false } },
    { provide: MatDialogRef, useValue: {} },
    CookieService,
  ],
})
export class MainModule {}
