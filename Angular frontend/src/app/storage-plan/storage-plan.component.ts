import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Subscription } from "rxjs";
import {
  StorageService,
  IStoragePlan,
  IActualStoragePlan
} from "../storage.service";
import { SnackbarService } from "../snackbar.service";
import { DeviceDetectorService } from "ngx-device-detector";

const COLORS = ["green", "blue", "yellow", "red"];

@Component({
  selector: "app-storage-plan",
  templateUrl: "./storage-plan.component.html",
  styleUrls: ["./storage-plan.component.css"]
})
export class StoragePlanComponent implements OnInit {
  innerMinDimension: number;
  actualPlan: IActualStoragePlan;
  plansSub: Subscription;
  plans: IStoragePlan[];
  usedSpace: number;
  availableSpace: number;
  breakpoint: number;
  mobile: boolean;
  @ViewChild("gridContainer", { static: false }) gridContainer: ElementRef;

  constructor(
    private storageService: StorageService,
    private snackbarService: SnackbarService,
    private deviceService: DeviceDetectorService
  ) {}

  ngOnInit() {
    this.breakpoint = this.deviceService.isMobile() ? 1 : 2;
    this.onResize();
    // Unify calls
    this.storageService.getActualPlan().subscribe(
      plan => {
        this.actualPlan = plan;
      },
      error => this.snackbarService.showSnackbar(error.error, 3000)
    );
    this.plansSub = this.storageService.getPlans().subscribe(
      plans => {
        this.plans = plans;
      },
      error => this.snackbarService.showSnackbar(error.error, 3000)
    );
  }

  changePlan(plan: IStoragePlan) {
    this.storageService.changePlan(plan.id).subscribe(
      newPlan => {
        this.snackbarService.showSnackbar(
          "Upgraded to " + plan.name.toUpperCase() + ", enjoy!",
          3000
        );
        this.actualPlan = newPlan;
      },
      error => this.snackbarService.showSnackbar(error.error.message, 3000)
    );
  }

  isLowerOrEqualPlan(id: number): boolean {
    return id <= this.actualPlan.id;
  }

  getColor(index: number): string {
    return COLORS[index - 1];
  }

  toGB(size: string): string {
    const result = Number(size);
    return String((result / 1024 / 1024 / 1024).toFixed(2)) + " GB";
  }

  onResize(): void {
    if ((this.gridContainer.nativeElement as HTMLElement).offsetWidth <= 500) {
      this.breakpoint = 1;
    } else {
      this.breakpoint = 2;
    }
    const width =
      (this.gridContainer.nativeElement as HTMLElement).offsetWidth /
      this.breakpoint;
    const height =
      ((this.gridContainer.nativeElement as HTMLElement).offsetHeight *
        this.breakpoint) /
      2;
    this.innerMinDimension = width < height ? width : height;
  }
}
