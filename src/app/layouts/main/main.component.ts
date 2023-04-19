import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  isSidebarOpened=true;
  screenWidth: number;
  
  constructor() { 
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      // set screenWidth on screen size change
      this.screenWidth = window.innerWidth;
    };
  }

  ngOnInit() {
  }

  sidebarToggler(){
    
    this.isSidebarOpened=!this.isSidebarOpened;
    console.log("sidebarToggler",this.isSidebarOpened)
  }

}
