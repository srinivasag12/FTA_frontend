import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSharedByThirdPartyComponent } from './file-shared-by-third-party.component';

describe('FileSharedByThirdPartyComponent', () => {
  let component: FileSharedByThirdPartyComponent;
  let fixture: ComponentFixture<FileSharedByThirdPartyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileSharedByThirdPartyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSharedByThirdPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
