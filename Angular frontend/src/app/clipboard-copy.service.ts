import { Injectable } from "@angular/core";
import { ClipboardService } from "ngx-clipboard";
import { SnackbarService } from "./snackbar.service";

@Injectable({
  providedIn: "root"
})
export class ClipboardCopyService {
  constructor(
    private clipboardService: ClipboardService,
    private snackbarService: SnackbarService
  ) {}

  copyToClipboard(link: string): void {
    if (!link) {
      return;
    }
    if (this.clipboardService.copyFromContent(link)) {
      this.snackbarService.showSnackbar("Link copied to clipboard.", 3000);
    } else {
      this.snackbarService.showSnackbar(link, 7000);
    }
  }
}
