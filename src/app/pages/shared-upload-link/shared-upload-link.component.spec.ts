import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedUploadLinkComponent } from './shared-upload-link.component';

describe('SharedUploadLinkComponent', () => {
  let component: SharedUploadLinkComponent;
  let fixture: ComponentFixture<SharedUploadLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedUploadLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedUploadLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
