export interface SharedLinkData {
    email: string;
    requestTime: string;
    link: string;
    generatedPasscode: string;
    totalDays: string;
    pendingDays: string;
    extendedDays: string;
    linkStatus: string;
    cancelRequest: string;
    loginStatus:string;
  }


  export interface SharedLinkData1 {
    email: string;
    genDateTime: string;
   // expiDate:string;
    link: string;
    code: string;
    status: number;
    totalDays: string;
    pendingDays: string;
    extendedDays: string;
    cancelRequest: string;
    loginStatus:string;
  }


  export interface LinkStatusType {
    id: number;
    linkName: string;
    isChecked:boolean;
  }