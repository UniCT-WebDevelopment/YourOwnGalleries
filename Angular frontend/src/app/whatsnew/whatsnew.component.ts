import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { ItemModalService } from "../item-modal.service";
import { ItemService, IItem } from "../item.service";
import { SnackbarService } from "../snackbar.service";

@Component({
  selector: "app-whatsnew",
  templateUrl: "./whatsnew.component.html",
  styleUrls: ["./whatsnew.component.css"]
})
export class WhatsNewComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  items: IItem[];
  limit: number;
  offset: number;
  bottomSpinner: boolean;
  constructor(
    private itemModalService: ItemModalService,
    private itemService: ItemService,
    private snackbarService: SnackbarService
  ) {}

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.limit = this.offset = 0;
    this.items = [];
    this.getNews();
  }

  getNews(): void {
    this.bottomSpinner = true;
    this.itemService.getNews(this.limit, this.offset).subscribe(
      data => {
        this.items = this.items.concat(data);
        this.offset = this.items.length;
        if (this.limit === 0) {
          this.limit = data.length;
        }
      },
      error => {
        console.log(error);
        this.snackbarService.showSnackbar("Error while fetching news", 3000);
      },
      () => (this.bottomSpinner = false)
    );
  }

  openItemModal(actualIndex: number): void {
    this.itemModalService.openModal({ items: [...this.items], actualIndex });
  }

  onDeletedItems(items: IItem[]) {
    this.limit = this.items.length - items.length;
    this.offset -= this.limit;
    this.items = items;
    this.getNews();
  }
}
