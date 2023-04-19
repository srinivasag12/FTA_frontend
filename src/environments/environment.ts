// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   production: false,
//   api: "https://fileuploadingtesting.bsolsystems.com:8181/iri_file_upload-0.1/api/",
//   token_api: "https://fileuploadingtesting.bsolsystems.com:8181/iri_file_upload-0.1/",
//   third_party_url:"https://fileuploadingtesting.bsolsystems.com/full/login/",
//   IRI_CLIENT:"b$0l!riClient",
//   IRI_SECRET:"b$0l!riSecret"
// };


export const environment = {
  production: false,
  api: "http://localhost:1000/api/",
  token_api: "http://localhost:1000/",
  third_party_url:"http://localhost:4200/full/login/",
  IRI_CLIENT:"b$0l!riClient",
  IRI_SECRET:"b$0l!riSecret"
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
