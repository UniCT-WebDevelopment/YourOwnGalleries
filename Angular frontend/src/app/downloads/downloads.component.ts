import {
  Component,
  OnInit,
  ViewChild,
  ComponentFactoryResolver,
  OnDestroy,
  ComponentRef
} from "@angular/core";
import { DownloadService } from "../download.service";
import { Subscription } from "rxjs";
import { DownloadsDirective } from "../downloads.directive";
import { SingleDownloadComponent } from "../single-download/single-download.component";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-downloads",
  templateUrl: "./downloads.component.html",
  styleUrls: ["./downloads.component.css"]
})
export class DownloadsComponent implements OnInit {
  faTimes = faTimes;
  refs: ComponentRef<SingleDownloadComponent>[];
  @ViewChild(DownloadsDirective, { static: true })
  downloadsHost: DownloadsDirective;
  constructor(
    private downloadService: DownloadService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit() {
    this.refs = [];
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      SingleDownloadComponent
    );
    const viewContainerRef = this.downloadsHost.viewContainerRef;
    viewContainerRef.clear();

    this.downloadService.downloads.subscribe(download => {
      this.downloadService.enableBadge();
      const componentRef = viewContainerRef.createComponent(
        componentFactory,
        0
      );
      componentRef.instance.download = download;
      componentRef.instance.ref = componentRef;
      this.refs.push(componentRef);
    });
  }

  closeDownloads(): void {
    this.downloadService.toggleDownloadsCard();
  }

  cleanDownloads(): void {
    this.refs = this.refs.filter(ref => {
      if (ref.instance.completed) {
        ref.destroy();
        return false;
      }
      return true;
    });
  }

  abortAllDownloads(): void {
    this.refs.map(ref => ref.instance.abortDownload());
  }
}
