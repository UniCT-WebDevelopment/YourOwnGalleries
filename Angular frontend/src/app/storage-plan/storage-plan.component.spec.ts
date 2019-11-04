import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoragePlanComponent } from './storage-plan.component';

describe('StoragePlanComponent', () => {
  let component: StoragePlanComponent;
  let fixture: ComponentFixture<StoragePlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoragePlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoragePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
