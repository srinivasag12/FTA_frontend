import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileArchiveComponent } from './file-archive.component';

describe('FileArchiveComponent', () => {
  let component: FileArchiveComponent;
  let fixture: ComponentFixture<FileArchiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileArchiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
