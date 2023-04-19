import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { ToastrService } from "ngx-toastr";
import { DataService } from "src/app/shared/services/data.service";
import { UserMaintenanceService } from "./user-maintenance.service";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

export interface Status {
  value: number;
  viewValue: string;
}

export interface Roles {
  id: number;
  desc: string;
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: "app-user-maintenance",
  templateUrl: "./user-maintenance.component.html",
  styleUrls: ["./user-maintenance.component.scss"],
})
export class UserMaintenanceComponent implements OnInit {
  displayedColumns: string[] = [
    "firstName",
    "lastName",
    "email",
    "role",
    "status",
    "update",
    "Unlock",
    "reset"
    
  ];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("createUserModal")
  createUserModalTemplate: TemplateRef<HTMLElement>;
  @ViewChild("resetDefaultPasswordModal")
  resetDefaultPasswordModalTemplate: TemplateRef<HTMLElement>;


  @ViewChild("unlockUserModal")
  unlockUserModalTemplate: TemplateRef<HTMLElement>;


  @BlockUI() blockUI: NgBlockUI;
  createUserForm: FormGroup;
  status: Status[] = [
    { value: 0, viewValue: "INACTIVE" },
    { value: 1, viewValue: "ACTIVE" },
    // { value: 3, viewValue: "LOCKED" },
  ];
  roles: Roles[];
  disableBtn = false;
  sendingProgressBar: boolean = false;
  isCreateUserModal: boolean;
  isUpdateUserModal: boolean;
  tempUserIdForUpdate: any;
  noDataFound: boolean;

  constructor(
    private toastr: ToastrService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private userMaintenanceService: UserMaintenanceService
  ) {
    this.dataService.setNavbarTitle("User Maintenance");
    this.initCreateUserForm();
    this.userMaintenanceService.getAllRoles().then((res) => {
      console.log("ALL ROLES LIST ::", res);
      this.roles = res;
    });
    this.getAllUsers();
  }

  ngAfterViewInit() {
    //this.dataSource.sort = this.sort;
  }

  matcher = new MyErrorStateMatcher();

  ngOnInit(): void {}

  getAllUsers() {

    this.userMaintenanceService.getAllUsers().then((res) => {
      let data = res;
      for (let i = 0; i < data.length; i++) {
        if (data[i].status === 1) {
          data[i].statusDesc = "ACTIVE";
        } else if (data[i].status === 0) {
          data[i].statusDesc = "INACTIVE";
        } else {
          data[i].statusDesc = "LOCKED";
        }
      }
      for (let i = 0; i < data.length; i++) {
        switch (data[i].roleId) {
          case 1:
            data[i].roleIdDesc = "Manager";
            break;
          case 2:
            data[i].roleIdDesc = "Inspector";
            break;
        }
      }

      data.sort(this.sortByOrderBy("firstname"));
      this.dataSource = new MatTableDataSource(data);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.filteredData.length === 0) {
      this.noDataFound = true;
    } else {
      this.noDataFound = false;
    }
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data;

    if (!sort.active || sort.direction === "") {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "firstName":
          return this.compare(a.firstname, b.firstname, isAsc);
        case "lastName":
          return this.compare(a.lastName, b.lastName, isAsc);
        case "email":
          return this.compare(a.email, b.email, isAsc);
        case "status":
          return this.compare(a.status, b.status, isAsc);
        case "role":
          return this.compare(a.roleIdDesc, b.roleIdDesc, isAsc);
        default:
          return 0;
      }
    });
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

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  createUserModalDialog() {
    this.isCreateUserModal = true;
    this.isUpdateUserModal = false;
    this.dialog.open(this.createUserModalTemplate, {
      height: "500px",
      width: "600px",
      disableClose: false,
      data: {
        title: "Create User ",
      },
    });
  }

  updateUserModalDialog(user) {
    this.isCreateUserModal = false;
    this.isUpdateUserModal = true;
    this.tempUserIdForUpdate = user.userId;
    this.createUserForm.patchValue({
      email: user.email,
      roleId: user.roleId,
      firstname: user.firstname,
      lastName: user.lastName,
      status: user.status,
    });
    this.dialog.open(this.createUserModalTemplate, {
      height: "500px",
      width: "600px",
      disableClose: false,
      data: {
        title: "Update User",
      },
    });
  }

  openResetDefaultPwdModal(email) {
    this.dialog.open(this.resetDefaultPasswordModalTemplate, {
      height: "150px",
      width: "600px",
      disableClose: false,
      data: {
        email,
      },
    });
  }

  close() {
    this.dialog.closeAll();
    this.createUserForm.reset();
  }

  initCreateUserForm() {
    // let emailRegex = '^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$';
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    this.createUserForm = this.formBuilder.group(
      {
        firstname: ["", Validators.required],
        lastName: ["", Validators.required],
        email: ["", [Validators.required, Validators.pattern(emailRegex)]],
        status: ["", Validators.required],
        roleId: ["", Validators.required],
      },
      { updateOn: "submit" }
    );
  }

  createUserFormSubmit() {
    let isValid = this.createUserForm.valid;
    if (this.isCreateUserModal) {
      let data = this.createUserForm.value;
      data["pwd"] = "Welcome@123";
      if (isValid) {
        this.sendingProgressBar = true;
        this.userMaintenanceService.createUser(data).then((res) => {
          if (typeof res === "number") {
            this.sendingProgressBar = false;
            this.dialog.closeAll();
            this.getAllUsers();
            this.createUserForm.reset();
            this.toastr.success("User Created successfully");
            this.cd.detectChanges();
          } else if (res.status === 500) {
            this.toastr.warning("User with given email is already exists");
            this.sendingProgressBar = false;
            this.dialog.closeAll();
            this.createUserForm.reset();
          }
        });
      }
    } else {
      let reqData = {
        userId: this.tempUserIdForUpdate,
        roleId: this.createUserForm.value.roleId,
        status: this.createUserForm.value.status,
      };
      if (isValid) {
        this.sendingProgressBar = true;
        this.userMaintenanceService.updateUser(reqData).then((res) => {
          this.sendingProgressBar = false;
          this.dialog.closeAll();
          this.getAllUsers();
          this.createUserForm.reset();
          this.toastr.success("User Update successfully");
          this.cd.detectChanges();
        });
      }
    }
  }

  resetDefaultPassword(email) {
    this.blockUI.start();
    let reqData = {
      email: email,
    };
    this.userMaintenanceService.resetPasswordDefault(reqData).then((res) => {
      if (res) {
        this.toastr.success("Password reset to default");
        this.dialog.closeAll();
        this.getAllUsers();
        this.blockUI.stop();
      } else {
        this.dialog.closeAll();
      }
    });
  }



  unlockUserModalDialog(user) {
    
    this.dialog.open(this.unlockUserModalTemplate, {
      height: "150px",
      width: "600px",
      disableClose: false,
      data: {
        email:user.email,
        userId:user.userId
      },
    });
  }

  unlockUser(userDate){

    this.blockUI.start();
    let reqData = {
      email:userDate.email,
      userId:userDate.userId
    };
    this.userMaintenanceService.unlockUser(reqData).then((res) => {
      if (res) {
        this.toastr.success("User Unlocked Successfully");
        this.dialog.closeAll();
        this.getAllUsers();
        this.blockUI.stop();
      } else {
        this.dialog.closeAll();
        this.toastr.error("Unable to Unlock user");
      }
    });
 
  }
}
