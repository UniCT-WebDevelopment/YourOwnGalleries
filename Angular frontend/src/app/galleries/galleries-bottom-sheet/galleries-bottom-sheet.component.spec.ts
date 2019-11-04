import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleriesBottomSheetComponent } from './galleries-bottom-sheet.component';

describe('GalleriesBottomSheetComponent', () => {
  let component: GalleriesBottomSheetComponent;
  let fixture: ComponentFixture<GalleriesBottomSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleriesBottomSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleriesBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
