import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SignUpComponent } from "./access/signup/signup.component";
import { SignInComponent } from "./access/signin/signin.component";
import { ForgotComponent } from "./access/forgot/forgot.component";
import { HomeUserComponent } from "./home-user/home-user.component";
import { WhatsNewComponent } from "./whatsnew/whatsnew.component";
import { AccessComponent } from "./access/access.component";
import { AuthGuardService as AuthGuard } from "./auth-guard.service";
import { RoleGuardService as RoleGuard } from "./role-guard.service";
import { GalleriesComponent } from "./galleries/galleries.component";
import { SettingsComponent } from "./settings/settings.component";
import { StoragePlanComponent } from "./storage-plan/storage-plan.component";
import { SettingsGuard } from "./settings.guard";
import { GalleryComponent } from "./galleries/gallery/gallery.component";
import { UploadGuard } from "./upload-guard.guard";

const routes: Routes = [
  {
    path: "access",
    component: AccessComponent,
    children: [
      {
        path: "",
        redirectTo: "signin",
        pathMatch: "full"
      },
      {
        path: "signin",
        component: SignInComponent
      },
      {
        path: "signup",
        component: SignUpComponent
      },
      {
        path: "forgot",
        component: ForgotComponent
      }
    ]
  },
  {
    path: "",
    component: HomeUserComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "home",
        component: WhatsNewComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          expectedRole: "user"
        }
      },
      {
        path: "galleries",
        component: GalleriesComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          expectedRole: "user"
        }
      },
      {
        path: "gallery/:name",
        component: GalleryComponent,
        canDeactivate: [UploadGuard]
      },
      {
        path: "settings",
        component: SettingsComponent,
        canActivate: [AuthGuard, RoleGuard, SettingsGuard],
        data: {
          expectedRole: "user"
        }
      },
      {
        path: "storage",
        component: StoragePlanComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          expectedRole: "user"
        }
      },
      {
        path: "user",
        redirectTo: "home",
        pathMatch: "full"
      },
      {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
      }
    ]
  },
  /*
  {
    path: "admin",
    component: MainComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      expectedRole: "admin"
    },
    children: [
      {
        path: "home",
        component: *** TheComponent ***,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          expectedRole: "admin"
        }
      }
    ]
  },*/
  { path: "**", redirectTo: "" } // Or a dedicated "NOT FOUND"
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
