import { Component, OnInit, Output, EventEmitter, Inject } from "@angular/core";
import { Router } from '@angular/router';
import { RouterLinkActive } from '@angular/router';
import { DataService } from '../services/data.service';

export interface SideMenuItems {
  name: string;
  icon: string;
  path: string;
  isNested: boolean;
  toggleId:boolean
}

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  expandToggle=false;
  fileUploadToggle=false;
  fileShareViaToggle=false;
  workflowsToggle=false;
  
  
  sidemenus: SideMenuItems[] ;
  subSideMenu: {}[];
  selectedMenuName: any;
  userRole: any;
  selectedIndex: any;

  constructor(private dataService: DataService,
    private router: Router,
   ) {
    this.dataService.getUserRole().then(res =>{
      console.log(typeof res);
      let role=res;
      this.userRole=res;

      switch(role as any){
        case '2':
            this.sidemenus=[
              {
                name: "Dashboard",
                icon: "fas fa-chart-line",
                path: "/main/dash",
                isNested:false,
                toggleId:false
              },
              {
                name: "File Upload",
                icon: "fas fa-upload",
                path: "/main/sharedfiles",
                isNested:true,
                toggleId:this.fileUploadToggle
              },
             
              {
                name: "Archived Files ",
                icon: "fas fa-archive",
                path: "/main/fileArchieve",
                isNested:false,
                toggleId:false
              },
               {
                name: "Master list of Links",
                icon: "fas fa-share-alt-square",
                path: "/main/sharedUploadLinks",
                isNested:true,
                toggleId:this.workflowsToggle
              },
              {
                name: "History",
                icon: "fas fa-history",
                path: "/main/history",
                isNested:false,
                toggleId:this.workflowsToggle
              }
            ];
            break;
        
        case '1':
            this.sidemenus=[
            {
              name: "Dashboard",
              icon: "fas fa-chart-line",
              path: "/main/dash",
              isNested:false,
              toggleId:false
            },
            {
              name: "File Upload",
              icon: "fas fa-upload",
              path: "/main/sharedfiles",
              isNested:true,
              toggleId:this.fileUploadToggle
            },
           
            {
              name: "History",
              icon: "fas fa-history",
              path: "/main/history",
              isNested:false,
              toggleId:this.workflowsToggle
            },
            {
              name: "User Maintenance",
              icon: "fas fa-user-plus",
              path: "/main/userMaintenance",
              isNested:false,
              toggleId:this.workflowsToggle
            }
          ]; 
          break;   
      }
    })
  }

  ngOnInit(): void {}


  // isActive(instruction: any): boolean {
  //   console.log(this.router.isActive(instruction,true));
  //   // return this.router.isRouteActive(this.router.generate(instruction));
    
  // }


  expandView(menuName,index){
    console.log(menuName,index)
    this.selectedMenuName=menuName;
    this.selectedIndex=index;

    switch(menuName){
      case "File Upload":
      this.sidemenus[index].toggleId=!this.sidemenus[index].toggleId;
      console.log("File Upload",this.sidemenus[index].toggleId)
        
      switch(this.userRole){
          case '2':
            this.subSideMenu=[
              {
                name: "Send Upload Link",
                path: "/main/sharedByThirdParty"
              },
              {
                name: "Send Download Link",
                path: "/main/sharedToThirdParty"
              },
              {
                name: "Files Shared By Third Party",
                path: "/main/fileSharedByThirdParty"
              },
              {
                name: "Files Shared To Third Party",
                path: "/main/filesSharedToThirdParty"
              },        
    
            ];
            break;
            case '1':
              this.subSideMenu=[
               
                {
                  name: "Files Shared By Third Party",
                  path: "/main/fileSharedByThirdParty"
                },
                {
                  name: "Files Shared To Third Party",
                  path: "/main/filesSharedToThirdParty"
                },        
      
              ];
              break;  
      }
        

        this.fileUploadToggle=!this.fileUploadToggle;
      break;

      case "File Share Via":
        this.sidemenus[index].toggleId=!this.sidemenus[index].toggleId;
        console.log("File Share Via",this.sidemenus[index].toggleId)

        this.subSideMenu=[
          {
          name:"WhatsApp",
          path:"/#"
          },
          {
          name:"Dropbox",
          path:"/#"
          },
          {
            name:"Email",
            path:"/#"
          },
          {
            name:"Google Drive",
            path:"/#"
          }
        ]
      break;

      case "Master list of Links":
        this.sidemenus[index].toggleId=!this.sidemenus[index].toggleId;
        console.log("Shared",this.sidemenus[index].toggleId)
        this.subSideMenu=[
          {
          name:"Links Shared to Upload",
          path:"/main/sharedUploadLinks"
          },
          {
          name:"Links Shared to Download",
          path:"/main/sharedDownloadLinks"
          }
        ]
      break;

      case "Workflows":
        this.sidemenus[index].toggleId=!this.sidemenus[index].toggleId;
        console.log("Workflows",this.sidemenus[index].toggleId)
        this.subSideMenu=[
          {
          name:"Review files shared by Third Party",
          path:"/#"
          },
          {
          name:"Review files Shared",
          path:"/#"
          }
        ]
      break;
    }

    // this.expandToggle=!this.expandToggle;
  }
  showInfo(link) {
    console.log(link);
  }
}
