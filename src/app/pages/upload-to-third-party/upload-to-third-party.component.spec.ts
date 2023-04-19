import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadToThirdPartyComponent } from './upload-to-third-party.component';

describe('UploadToThirdPartyComponent', () => {
  let component: UploadToThirdPartyComponent;
  let fixture: ComponentFixture<UploadToThirdPartyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadToThirdPartyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadToThirdPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
