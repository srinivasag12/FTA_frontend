import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdPartyFileUploadComponent } from './third-party-file-upload.component';

describe('ThirdPartyFileUploadComponent', () => {
  let component: ThirdPartyFileUploadComponent;
  let fixture: ComponentFixture<ThirdPartyFileUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThirdPartyFileUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThirdPartyFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
