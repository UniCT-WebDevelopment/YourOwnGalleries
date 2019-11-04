import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleDownloadComponent } from './single-download.component';

describe('SingleDownloadComponent', () => {
  let component: SingleDownloadComponent;
  let fixture: ComponentFixture<SingleDownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleDownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
