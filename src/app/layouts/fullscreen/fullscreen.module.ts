import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullscreenComponent } from './fullscreen.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from 'src/app/shared/shared.module';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { ErrorPageComponent } from 'src/app/pages/error-page/error-page.component';
import { ThirdPartyFileUploadComponent } from 'src/app/pages/third-party-file-upload/third-party-file-upload.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule } from '@angular/material/divider';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule } from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTableModule} from '@angular/material/table';
import {MatToolbarModule } from '@angular/material/toolbar';
import { HttpClientModule } from '@angular/common/http';
import { FlipModule } from 'ngx-flip';
import { NgOtpInputModule } from 'ng-otp-input';
import { BlockUIModule } from 'ng-block-ui';
import { MatDialogModule } from '@angular/material/dialog';
import { CountdownModule } from 'ngx-countdown';
import { ChangePasswordComponent } from 'src/app/pages/change-password/change-password.component';
import { AvatarModule } from 'ngx-avatar';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { VerifyForgotPasswordUserComponent } from 'src/app/pages/verify-forgot-password-user/verify-forgot-password-user.component';


@NgModule({
  declarations: [
    FullscreenComponent,
    LoginComponent,
    ErrorPageComponent,
    ThirdPartyFileUploadComponent,
    ChangePasswordComponent,
    VerifyForgotPasswordUserComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatListModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatTableModule,
    MatToolbarModule,
    HttpClientModule,
    FlipModule,
    NgOtpInputModule,
    BlockUIModule.forRoot(),
    CountdownModule,
    AvatarModule 
  ]
})
export class FullscreenModule { }
