import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanDeactivate
} from "@angular/router";
import { Observable } from "rxjs";
import { GalleryComponent } from "./galleries/gallery/gallery.component";
import { GalleriesComponent } from "./galleries/galleries.component";

@Injectable({
  providedIn: "root"
})
export class UploadGuard implements CanDeactivate<GalleryComponent> {
  canDeactivate(
    component: GalleryComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): boolean {
    return !component.isUploading;
  }
}
