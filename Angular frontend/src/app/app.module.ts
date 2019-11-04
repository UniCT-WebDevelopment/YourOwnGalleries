import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { DeviceDetectorModule } from "ngx-device-detector";
import { ClipboardModule } from "ngx-clipboard";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { DragToSelectModule } from "ngx-drag-to-select";
import { PinchZoomModule } from "ngx-pinch-zoom";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AccessComponent } from "./access/access.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HomeUserComponent } from "./home-user/home-user.component";

import { AuthInterceptor } from "./auth.interceptor";
import { SignUpComponent } from "./access/signup/signup.component";
import { SignInComponent } from "./access/signin/signin.component";
import { ForgotComponent } from "./access/forgot/forgot.component";
import { WhatsNewComponent } from "./whatsnew/whatsnew.component";
import { ItemComponent } from "./galleries/item/item.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { GalleriesComponent } from "./galleries/galleries.component";
import { SettingsComponent } from "./settings/settings.component";
import { LogoutDialogComponent } from "./logout-dialog/logout-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import { InputDialogComponent } from "./input-dialog/input-dialog.component";
import { ActiveEllipsisDirectiveDirective } from "./active-ellipsis-directive.directive";
import { DragDropDirective } from "./drag-drop-directive.directive";
import { GalleriesBottomSheetComponent } from "./galleries/galleries-bottom-sheet/galleries-bottom-sheet.component";
import { ItemModalComponent } from "./item-modal/item-modal.component";
import { TopbarComponent } from "./topbar/topbar.component";
import { SnackbarComponent } from "./snackbar/snackbar.component";
import { SecurePipe } from "./secure.pipe";
import { StoragePlanComponent } from "./storage-plan/storage-plan.component";
import { PassCheckDialogComponent } from "./pass-check-dialog/pass-check-dialog.component";
import { GalleryComponent } from "./galleries/gallery/gallery.component";
import { MouseDragScrollDirective } from "./mouse-drag-scroll.directive";
import { ItemsContainerComponent } from "./galleries/items-container/items-container.component";
import { DownloadsComponent } from "./downloads/downloads.component";
import { DownloadsDirective } from "./downloads.directive";
import { SingleDownloadComponent } from "./single-download/single-download.component";

@NgModule({
  declarations: [
    WhatsNewComponent,
    AppComponent,
    AccessComponent,
    ForgotComponent,
    HomeUserComponent,
    SignInComponent,
    SignUpComponent,
    ItemComponent,
    NavbarComponent,
    GalleriesComponent,
    SettingsComponent,
    LogoutDialogComponent,
    InputDialogComponent,
    ActiveEllipsisDirectiveDirective,
    DragDropDirective,
    GalleriesBottomSheetComponent,
    ItemModalComponent,
    TopbarComponent,
    SnackbarComponent,
    SecurePipe,
    StoragePlanComponent,
    PassCheckDialogComponent,
    GalleryComponent,
    MouseDragScrollDirective,
    ItemsContainerComponent,
    DownloadsComponent,
    DownloadsDirective,
    SingleDownloadComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    HttpClientModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatBottomSheetModule,
    MatListModule,
    MatSelectModule,
    DeviceDetectorModule.forRoot(),
    ClipboardModule,
    MatSnackBarModule,
    MatGridListModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    InfiniteScrollModule,
    DragToSelectModule.forRoot({
      selectedClass: "my-selected-item"
    }),
    PinchZoomModule,
    MatCheckboxModule,
    MatIconModule
  ],
  exports: [ActiveEllipsisDirectiveDirective],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  entryComponents: [
    LogoutDialogComponent,
    InputDialogComponent,
    GalleriesBottomSheetComponent,
    ItemModalComponent,
    SnackbarComponent,
    PassCheckDialogComponent,
    SingleDownloadComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
