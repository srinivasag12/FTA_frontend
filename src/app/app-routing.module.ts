import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { MainComponent } from "./layouts/main/main.component";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { FullscreenComponent } from "./layouts/fullscreen/fullscreen.component";
import { SharedfilesComponent } from "./pages/sharedfiles/sharedfiles.component";
import { ThirdPartyFileUploadComponent } from "./pages/third-party-file-upload/third-party-file-upload.component";
import { AuthGuardService as AuthGuard } from "../app/shared/services/AuthGuardService ";
import { ThirdPartyAuthGuardService as ThirdAuth } from "../app/shared/services/ThirdPartyAuthGuardService";
import { SharedUploadLinkComponent } from './pages/shared-upload-link/shared-upload-link.component';
import { FileArchiveComponent } from './pages/file-archive/file-archive.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { UploadToThirdPartyComponent } from './pages/upload-to-third-party/upload-to-third-party.component';
import { FileSharedByThirdPartyComponent } from './pages/file-shared-by-third-party/file-shared-by-third-party.component';
import { FileSharedToThirdPartyComponent } from './pages/file-shared-to-third-party/file-shared-to-third-party.component';
import { CommonLinkForUploadAndDownloadComponent } from './pages/common-link-for-upload-and-download/common-link-for-upload-and-download.component';
import { HistoryComponent } from './pages/history/history.component';
import { UserMaintenanceComponent } from './pages/user-maintenance/user-maintenance.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { VerifyForgotPasswordUserComponent } from './pages/verify-forgot-password-user/verify-forgot-password-user.component';
const routes: Routes = [
  {
    path: "main",
    component: MainComponent,
    canActivateChild:[AuthGuard],
    children: [
      {
        path: "dash",
        component: DashboardComponent,
        data: {
          role: ''
        }  
       
      },
      {
        path: "sharedfiles",
        component: SharedfilesComponent,
        data: {
          role: '1'
        }  
        
      },
      {
        path: "sharedByThirdParty",
        component: SharedfilesComponent,
        data: {
          role: '2'
        }  
        
      },
      {
        path: "sharedToThirdParty",
        component: SharedfilesComponent,
        data: {
          role: '2'
        }  
        
      },
      {
        path: "sendUploadLink",
        component: SharedfilesComponent,
        data: {
          role: '2'
        }  
        
      },
      {
        path: "sendDownloadLink",
        component: SharedfilesComponent,
        data: {
          role: '2'
        }  
        
      },
      {
        path: "sharedToMe",
        component: SharedfilesComponent,
        data: {
          role: ''
        }  
        
      },
      {
        path: "sharedByMe",
        component: SharedfilesComponent,
        data: {
          role: ''
        }  
        
      },
      {
        path: "sharedUploadLinks",
        component: SharedUploadLinkComponent,
        data: {
          role: '2'
        }  
        
      },
      {
        path: "sharedDownloadLinks",
        component: SharedUploadLinkComponent,
        data: {
          role: '2'
        }  
        
      },
      {
        path: "fileArchieve",
        component: FileArchiveComponent,
        data: {
          role: ''
        }  
        
      },
      {
        path: "uploadToThirdParty",
        component: UploadToThirdPartyComponent,
        data: {
          role: '2'
        }  
        
      },
      {
        path: "fileSharedByThirdParty",
        component: FileSharedByThirdPartyComponent,
        data: {
          role: ''
        }  
        
      },
      {
        path: "filesSharedToThirdParty",
        component: FileSharedToThirdPartyComponent,
        data: {
          role: ''
        }  
        
      },
      {
        path: "uploadDownloadLink",
        component: CommonLinkForUploadAndDownloadComponent,
        data: {
          role: ''
        }  
        
      },
      {
        path: "history",
        component: HistoryComponent,
        data: {
          role: ''
        }          
      },
      {
        path: "userMaintenance",
        component: UserMaintenanceComponent,
        data: {
          role: '1'
        }        
      },
     
    ],
  },
  {
    path: "full",
    component: FullscreenComponent,
    children: [
      {
        path: "login/:id",
        component: LoginComponent,
      },
      {
        path: "thirdPartyFileUpload",
        component: ThirdPartyFileUploadComponent,
        canActivate: [ThirdAuth],
      },
      {
        path: "invalid",
        component:ErrorPageComponent,
      },
      {
        path: "changePassword",
        component: ChangePasswordComponent,        
      },
      {
        path: "forgotPassword",
        component: VerifyForgotPasswordUserComponent,        
      }
      
    ],
  },
  {
    path: "",
    component: FullscreenComponent,
    children: [
      {
        path: "",
        component: LoginComponent,
      }]
  },
  {
    path: '**', 
    redirectTo: 'full/invalid'
  },
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
