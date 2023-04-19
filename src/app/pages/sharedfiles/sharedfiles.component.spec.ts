import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedfilesComponent } from './sharedfiles.component';

describe('SharedfilesComponent', () => {
  let component: SharedfilesComponent;
  let fixture: ComponentFixture<SharedfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
