import { MatTableDataSource } from '@angular/material/table';

export interface SharingData {
  icon: string;
  name: string;
  uploadedDate: string;
  uploadedBy: string;
  fileSize: string;
}

export interface SharedData {
  f_ID: number;
  email:string;
  file_NAME: string;
  file_TYPE: string;
  file_SIZE: string;
  uploadedat: any;
  reviewStatus:number;
  uploadedby:string;
  vessel_NAME:string;
  description:string;
  vsl_IMO_NO:string;
  vsl_OFFICIAL_NO:string;
  lid:number;
  isfolder:number;
  isviewed:number;
}

export interface SharedToThirdPartyData {
  vessel_NAME:string;
  email:string;
  description:string;
  vsl_IMO_NO:string;
  vsl_OFFICIAL_NO:string;
  download_LINK_ID:string;
  f_ID: number;
  created_ON:Date;
  file_SIZE: string;
  folder_ID:string;
  expired_ON:string;
  file_NAME: string;
  file_TYPE:string;  
  isviewed:number;
}

export interface SharedDataSource {
  lid: number;
  vessel_NAME: string;
  link_DESC: string;
  files?: MatTableDataSource<Files>;
}

export interface Shared {
  lid: number;
  vessel_NAME: string;
  link_DESC: string;
  files?: Files[] | MatTableDataSource<Files>;
}

export interface Files {
  file_NAME: string,
  file_TYPE: string,
  f_ID: number,
  file_SIZE: string,
  isfolder: Number,
  isviewed:number,
  email: string,
  uploadedby: string,
  uploadedat: string
}

export interface SharedToThird {
  type:string,
  linkId:number,
  vesselName:string,
  desc:string,
  files?:SharedToThirdFiles[] | MatTableDataSource<SharedToThirdFiles>;
}

export interface SharedToThirdFiles{
  id:number,
  email:string,
  type:string,
  sharedDate:string,
  fileSize:string,
  name:string
}

export interface Description{
  id:number,
  desc:string
}

export const keyvalue: { type: string; value: string }[] = [
  { type: "pdf", value: "picture_as_pdf" },
  { type: "jpg", value: "insert_photo" },
  { type: "jpeg", value: "insert_photo" },
  { type: "folder", value: "folder" },
  { type: "pdarchivef", value: "archive" },
  { type: "docx", value: "description" },
  { type: "zip", value: "archive" },
  { type: "png", value: "wallpaper" },
  { type: "txt", value: "text_snippet" },
  { type: "mp4", value: "movie" },
  { type: "mp3", value: "library_music"}
];

export const mimeType: { type: string; value: string }[] = [
  { type: "picture_as_pdf", value: "application/pdf" },
  { type: "insert_photo", value: "image/jpeg" },
  { type: "text_snippet", value: "text/plain" },
  { type: "wallpaper", value: "image/png" },
  { type: "movie", value: "video/mp4" },
  { type: "library_music", value: "audio/mpeg"},
  
];
