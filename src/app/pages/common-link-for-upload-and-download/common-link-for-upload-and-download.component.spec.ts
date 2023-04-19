import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonLinkForUploadAndDownloadComponent } from './common-link-for-upload-and-download.component';

describe('CommonLinkForUploadAndDownloadComponent', () => {
  let component: CommonLinkForUploadAndDownloadComponent;
  let fixture: ComponentFixture<CommonLinkForUploadAndDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonLinkForUploadAndDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonLinkForUploadAndDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
