import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassCheckDialogComponent } from './pass-check-dialog.component';

describe('PassCheckDialogComponent', () => {
  let component: PassCheckDialogComponent;
  let fixture: ComponentFixture<PassCheckDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassCheckDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassCheckDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
