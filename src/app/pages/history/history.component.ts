import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from 'src/app/shared/services/data.service';
import { HistoryService } from './history.service';
import { MatTableDataSource } from '@angular/material/table';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TabComponent, SelectEventArgs } from '@syncfusion/ej2-angular-navigations';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import * as moment from 'moment';

export const PICK_FORMATS = {
  parse: {dateInput: {month: 'short', year: 'numeric', day: 'numeric'}},
  display: {
      dateInput: 'input',
      monthYearLabel: {year: 'numeric', month: 'short'},
      dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
      monthYearA11yLabel: {year: 'numeric', month: 'long'}
  }
};

class PickDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
      if (displayFormat === 'input') {
          return formatDate(date,'dd-MMM-yyyy',this.locale);;
      } else {
          return date.toDateString();
      }
  }
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: PickDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS}
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HistoryComponent implements OnInit {

  @ViewChild('historyTab') historyTab: TabComponent;
  @BlockUI() blockUI: NgBlockUI;

  columnsToDisplay = ['vesselName', 'desc','imoNo','officialNo','expand'];
  columnsToDisplayLinkDetails = ['link','email','createdDate','expiryDate']
  historyDataSource:MatTableDataSource<any>;
  historyLinkDetailsDataSource:MatTableDataSource<any>;
  expandedElement: any | null;
  public headerText: Object = [{ 'text': 'Upload Links' }, { 'text': 'Download Links' }];
  uploadDownloadFlag: string;
  descriptionData: any=[];
  tempObjForDownload: { vessel: any; descId: any; };

  filterDateForm = new FormGroup({
    fromDate: new FormControl(),
    toDate: new FormControl(),
  });
  filterHistoryLinkDetailsDS: MatTableDataSource<any>;
  noDataFound: boolean;

  get fromDate() { return new Date(this.filterDateForm.get('fromDate').value); }
  get toDate() { return new Date(this.filterDateForm.get('toDate').value); }

  applyDateFilter(value) {
    console.log("applyDateFilter",value);
    console.log(this.historyLinkDetailsDataSource.data);
    console.log(this.filterHistoryLinkDetailsDS)
    //this.historyLinkDetailsDataSource.filter = ''+Math.random();
    if(value.fromDate != null && value.toDate != null){
      console.log("this.uploadDownloadFlag",this.uploadDownloadFlag)
      let a=[]
      this.historyLinkDetailsDataSource.data = this.filterHistoryLinkDetailsDS.data.filter(e => 
        {
          console.log(e);
         

          if(this.uploadDownloadFlag === "U"){
            console.log(new Date(e.submittedOn) > value.submittedOn);
            console.log(value.toDate)

            if( (moment(e.submittedOn) > value.fromDate && moment(e.submittedOn) < value.toDate.setHours(23)) ){
              console.log("Expiry Greater Than From Date ..",e);
              a.push(e);
              console.log(a);
              console.log(JSON.stringify(a));
              return a;
              this.cd.detectChanges();
            }
          }
          else if(this.uploadDownloadFlag === "D"){
            console.log(new Date(e.createdDate) > value.createdDate);
            console.log(value.toDate)

            if( (moment(e.createdDate) > value.fromDate && moment(e.createdDate) < value.toDate.setHours(23)) ){
              console.log("Expiry Greater Than From Date ..",e);
              a.push(e);
              console.log(a);
              console.log(JSON.stringify(a));
              return a;
              this.cd.detectChanges();
            }
          }
         
         
          console.log("All itreration done ...")
          console.log(this.historyLinkDetailsDataSource)             
        }
        
        ) ;
    }
    else{
      this.toastr.warning("Please select from and to date and then try")
    }
    

      console.log(this.historyLinkDetailsDataSource);
      this.cd.detectChanges();
      //this.filterDateForm.reset();
    /* const fromDate = value.fromDate;
    const toDate = value.toDate;
    this.historyLinkDetailsDataSource.data = this.historyLinkDetailsDataSource.data.filter(e=>e.expiryDate > fromDate && e.expiryDate < toDate ).sort((a, b) => a.expiryDate - b.expiryDate) ;
    console.log(fromDate, toDate);
    console.log(this.historyLinkDetailsDataSource) */
    
  }

  applySearchFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.historyDataSource.filter = filterValue.trim().toLowerCase();

    if(this.historyDataSource.filteredData.length === 0){
      this.noDataFound = true;
    }
    else{
      this.noDataFound = false;
    }
  }

   constructor(private dataService: DataService,
    private historyService:HistoryService,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService,
    private dateAdapter: DateAdapter<Date>) { 
    this.dataService.setNavbarTitle("History");
    this.uploadDownloadFlag="U";

    


    // this.historyService.getHistory().then((res:any) => {
    //   console.log("HISTORY RESP ::",res);
    //   this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
    //   this.historyDataSource=new MatTableDataSource(res);
    //   console.log("historyDataSource ::",this.historyDataSource);
     
    // });
    
  }

  getHistoryData(){
    this.dataService.getUserRole().then((res:any) => {
      console.log(res);

      if(res != '2'){
        this.historyService.getHistoryForManager().then((res:any) => {
          console.log("HISTORY RESP ::",res);
          if(res.length === 0){
            this.noDataFound = true;
          }
          else{
            this.noDataFound = false;
          }
          
          this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
          this.historyDataSource=new MatTableDataSource(res);
          console.log("historyDataSource ::",this.historyDataSource);
         
        });
      }
      else{
        this.dataService.getLoggedInUserId().then(res => {

          this.historyService.getHistory(res).then((res:any) => {
            console.log("HISTORY RESP ::",res);
            if(res.length === 0){
              this.noDataFound = true;
            }
            else{
              this.noDataFound = false;
            }
            this.dateAdapter.setLocale('en-GB'); //dd/MM/yyyy
            this.historyDataSource=new MatTableDataSource(res);
            console.log("historyDataSource ::",this.historyDataSource);
           
          });
        })
        
      }
    })  
  }

  formatSubtitle = (percent: number) : string => {
    if(percent >= 100){
      return "All Files Reviewed !"
    }else if(percent >= 50){
      return "Partially Reviewed !"
    }else {
      return "Not yet Reviewed"
    }
  }

  toggleRow(element: any,index) {
    console.log("toggleRow" , element);
    console.log(this.descriptionData);
    console.log(this.expandedElement);
    this.filterDateForm.reset();
    if(element.uploadCount > 0){
      this.uploadDownloadFlag="U";
    }
    else if(element.downloadCount > 0){
      this.uploadDownloadFlag="D";
    }
    else if(element.uploadCount > 0 && element.downloadCount > 0){
      this.uploadDownloadFlag="U";
    }
    
    this.expandedElement = this.expandedElement === element ? null : element;
    console.log(this.expandedElement)
    let descId=this.descriptionData.filter(res => res.desc === element.desc);
    console.log(descId[0].id);
    this.tempObjForDownload={
      "vessel":element.vessel,
      "descId":descId[0].id,
    }

    if(this.expandedElement!=null){
      this.getHistoryLinkDetails(this.uploadDownloadFlag,element.vessel,descId[0].id);
    }
    
    // this.historyLinkDetailsDataSource.filterPredicate = (data, filter) =>{
    //   console.log("Inside Filter")
    //   if (this.fromDate && this.toDate) {
    //     console.log(this.fromDate)
    //     console.log(typeof this.fromDate)
    //     return new Date(data.expiryDate) >= this.fromDate && new Date(data.expiryDate) <= this.toDate;
    //   }
    //   return true;
    // }


       // element.files && (element.files as MatTableDataSource<Files>).data.length ? (this.expandedElement = this.expandedElement === element ? null : element) : null;
    this.cd.detectChanges();
  }

  getHistoryLinkDetails(uploadDownloadFlag,vessel,descId){
    console.log("UploadDownloadFlag",uploadDownloadFlag);
    console.log("Vessel",vessel);
    console.log("descId",descId);
    this.blockUI.start("Loading Data ...")
    this.historyService.getHistoryLinkDetails(uploadDownloadFlag,vessel,descId).then((res:any) => {
      console.log("HstryLnkDtls ::",res);
      if(res.status!=500){
        res.forEach(element => {
          console.log(element)
          element.createdDate=moment(element.createdDate).format("DD-MMM-YYYY HH:MM");
          element.expiryDate=moment(element.expiryDate).format("DD-MMM-YYYY HH:MM");
          element.submittedOn=moment(element.submittedOn).format("DD-MMM-YYYY HH:MM");
        });
        this.historyLinkDetailsDataSource=new MatTableDataSource(res);
        this.filterHistoryLinkDetailsDS = new MatTableDataSource(res)
       console.log(this.historyLinkDetailsDataSource)
        this.blockUI.stop()
      }
      else{       
        this.historyLinkDetailsDataSource=res;
        this.blockUI.stop()
      }
      
    })
  }

  public tabSelected(e: SelectEventArgs): void {
    console.log("ON TABS SELECTED METHOD");
    this.filterDateForm.reset();
    console.log(e)
    if (e.isSwiped) {
        e.cancel = true;
    }
    switch(e.selectedIndex){
      case 0:
        console.log("ON TABS 0 SELECTED METHOD");
        this.uploadDownloadFlag="U";
        console.log(this.tempObjForDownload);
        this.getHistoryLinkDetails(this.uploadDownloadFlag,this.tempObjForDownload.vessel,this.tempObjForDownload.descId);
        //this.historyService.getHistoryLinkDetails(this.uploadDownloadFlag,this.tempObjForDownload.vessel,this.tempObjForDownload.descId)
        break;
      case 1:
        console.log("ON TABS 1 SELECTED METHOD");
        this.uploadDownloadFlag="D";
        console.log(this.tempObjForDownload);
        this.getHistoryLinkDetails(this.uploadDownloadFlag,this.tempObjForDownload.vessel,this.tempObjForDownload.descId);
        //this.historyService.getHistoryLinkDetails(this.uploadDownloadFlag,this.tempObjForDownload.vessel,this.tempObjForDownload.descId)
        break;
    }
  }

  public oncreated (tab) {
    console.log("ON CREATE TABS METHOD");
    this.uploadDownloadFlag="U";
    //modify the tab data here.
        //tab.select(2)
  }

  async ngOnInit() {

    this.historyService.getDescriptionData().then(res => {
      console.log('Description ::',res);
      this.descriptionData=res;
    });

    await this.getHistoryData();

    
  }

}
