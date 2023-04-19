import { BrowserModule } from "@angular/platform-browser";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MainModule } from "./layouts/main/main.module";
import { FullscreenModule } from "./layouts/fullscreen/fullscreen.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatSliderModule } from "@angular/material/slider";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { TabModule } from "@syncfusion/ej2-angular-navigations";
import { ButtonModule  } from '@syncfusion/ej2-angular-buttons';

import { ToastrModule } from "ngx-toastr";
import { NgOtpInputModule } from 'ng-otp-input';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './shared/services/token.interceptor';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { AvatarModule } from 'ngx-avatar';
import { DatePipe } from '@angular/common';


@NgModule({
  declarations: [AppComponent, ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSliderModule,
    NgOtpInputModule ,
    NgCircleProgressModule.forRoot({     
      lazy: false
    }),
    MainModule,
    FullscreenModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    TabModule,
    ToastrModule.forRoot(),
    ButtonModule ,
    AvatarModule
    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    DatePipe
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
