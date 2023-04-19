import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSharedToThirdPartyComponent } from './file-shared-to-third-party.component';

describe('FileSharedToThirdPartyComponent', () => {
  let component: FileSharedToThirdPartyComponent;
  let fixture: ComponentFixture<FileSharedToThirdPartyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileSharedToThirdPartyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSharedToThirdPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
