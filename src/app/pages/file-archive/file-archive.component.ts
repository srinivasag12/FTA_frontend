import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DataService } from 'src/app/shared/services/data.service';
import { FileArchiveService } from './file-archive.service';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { keyvalue } from '../sharedfiles/sharedfiles.model';
import * as moment from 'moment';

@Component({
  selector: 'app-file-archive',
  templateUrl: './file-archive.component.html',
  styleUrls: ['./file-archive.component.scss']
})
export class FileArchiveComponent implements OnInit {

  archivedFilesDataSource:MatTableDataSource<any>;
  columnsToDisplayArchivedFiles=['fileType','fileName','vesselName','desc','archivedOn','expiredOn','restore'];
  @BlockUI() blockUI: NgBlockUI;
  typeOfFile:any;
  noDataFound: boolean;

  constructor(private dataService: DataService,
              private fileArchiveService:FileArchiveService,
              private cd: ChangeDetectorRef,
              private tostr: ToastrService,) {

    this.dataService.setNavbarTitle('Archived Files');
    
  }

  async ngOnInit() {
     this.getArchivedFilesList();
  }

  async  getArchivedFilesList(){
   
      await this.fileArchiveService.getAllArchivedFiles().then((data:any) =>{
        console.log(data);
        // this.archivedFilesDataSource=new MatTableDataSource(data.archiveLinkList);

        if(data.archiveFolderList.length === 0 && data.archiveLinkList.length === 0 && data.arfile.length === 0){

          this.archivedFilesDataSource=new MatTableDataSource([]);
            this.noDataFound =true;

        }
        else{
          this.noDataFound =false;
          let archiveLinkData = data.archiveLinkList;

          console.log("archiveLinkData >>>",archiveLinkData)
  
          let groupedData = archiveLinkData.reduce(
            (acc, next) => {
              console.log(acc);
              console.log(next);
  
              let nextFile = {
                vesselName: next.vesselName,
                desc: next.desc,
                imo: next.imo,
                vslOfficialNo: next.vslOfficialNo,
                linkId: next.linkId,
                archieveDate: next.archieveDate,
                expiredOn: next.expiredOn              
              }
  
              // let linkIds = {
              //   linkId: next.linkId
              // }
  
              let linkIds = next.linkId
  
              let exist = acc.find(v => v.vesselName === next.vesselName && v.desc === next.desc && v.imo === next.imo && v.vslOfficialNo === next.vslOfficialNo);
  
              if (exist) {
                exist.linkId.push(linkIds);
              } else {
    
                acc.push({
                  vesselName: next.vesselName,
                  desc: next.desc,
                  imo: next.imo,
                  vslOfficialNo: next.vslOfficialNo,
                  linkId: [linkIds],
                  archieveDate: moment(next.archieveDate).format("DD-MMM-YYYY HH:MM"),
                  expiredOn: moment(next.expiredOn).format("DD-MMM-YYYY HH:MM") 
                })
              }
              return acc
            },[]);
  
            console.log("archiveListData..",groupedData);
  
            let archiveLinkData1 = groupedData;
            
  
          let archiveFolderList = data.archiveFolderList;
          let arFiles = data.arfile;

          archiveFolderList.forEach(element => {
            element.archieveDate = moment( element.archieveDate).format("DD-MMM-YYYY HH:MM");
            element.expiredOn = moment( element.expiredOn).format("DD-MMM-YYYY HH:MM");            
          });

          arFiles.forEach(element => {
            element.archieveDate = moment( element.archieveDate).format("DD-MMM-YYYY HH:MM");
            element.expiredOn = moment( element.expiredOn).format("DD-MMM-YYYY HH:MM");            
          });


  
          let finalArchiveDataList =[...archiveLinkData1,...archiveFolderList,...arFiles];
  
          console.log("finalArchiveDataList ::",finalArchiveDataList)
          console.log(this.archivedFilesDataSource);
  
          for(let i=0;i<finalArchiveDataList.length;i++){
            if(!finalArchiveDataList[i].fileName){
              finalArchiveDataList[i].fileName="---"
            }
            else{
              finalArchiveDataList[i].fileType=this.getValueFromKey(finalArchiveDataList[i].fileType);
            }
          }
  
          finalArchiveDataList.sort(function (a, b) {
            console.log(a,b)
            return new Date(b.archieveDate).getTime() - new Date(a.archieveDate).getTime();
          });
  
          console.log(finalArchiveDataList)
  
          this.archivedFilesDataSource=new MatTableDataSource(finalArchiveDataList);
          console.log(this.archivedFilesDataSource);
        }

     
      })

   
  }

  getValueFromKey(key: string): string {
    for (let index = 0; index < keyvalue.length; index++) {
      if (key == keyvalue[index].type) {
        return keyvalue[index].value;
      }
    }
    return "extension";
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.archivedFilesDataSource.filter = filterValue.trim().toLowerCase();
    console.log(this.archivedFilesDataSource.filteredData.length);
    if(this.archivedFilesDataSource.filteredData.length === 0){
      this.noDataFound = true;
    }
    else{
      this.noDataFound = false;
    }
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

  restore(file){
    console.log(file);

    if(file.linkId){
      this.blockUI.start("Restoring Link");
      console.log("--------LINK ID-------------");
      this.fileArchiveService.linkUnArchive(file.linkId).then(res=>{
      console.log(res);
      this.getArchivedFilesList();
      this.cd.detectChanges();
      this.blockUI.stop();
      this.tostr.success("Folder Restored sucessfully","Restored")
      })
    }
    else if(file.folderId){
      console.log("---------FOLDER ID------------");
        this.blockUI.start("Restoring Folder");
        this.fileArchiveService.folderUnArchive(file.folderId).then(res=>{
        console.log(res);
        this.getArchivedFilesList();
        this.cd.detectChanges();
        this.blockUI.stop();
        this.tostr.success("Folder Restored sucessfully","Restored")
        })
    }
    else if(file.fileId){
      console.log("------------FILE ID------------");
        this.blockUI.start("Restoring File");
        this.fileArchiveService.restoreFile(file.fileId).then(res=>{
        console.log(res);
        this.getArchivedFilesList();
        this.cd.detectChanges();
        this.blockUI.stop();
        this.tostr.success("File Restored sucessfully","Restored")
        })

    }
   

   
    
  }

}
