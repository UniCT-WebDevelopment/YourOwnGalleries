import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WhatsNewComponent } from "./whatsnew.component";

describe("HomeUserComponent", () => {
  let component: WhatsNewComponent;
  let fixture: ComponentFixture<WhatsNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WhatsNewComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatsNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
