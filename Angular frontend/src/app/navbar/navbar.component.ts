import { Component, OnInit, OnDestroy, ViewEncapsulation } from "@angular/core";
import {
  faImage,
  faDatabase,
  faHome,
  faList,
  faCogs,
  faInfo,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";

interface NavItem {
  name: string;
  icon: IconDefinition;
}

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {
  navItems: NavItem[];
  previousItem: NavItem;
  selectedItem: NavItem;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    switch (this.authService.getUserRole()) {
      /*
      case "admin":
        this.navItems = [
          { name: "log", icon: faInfo },
          { name: "lists", icon: faList }, For admin
          { name: "settings", icon: faCogs }
        ];
        break;
      */
      case "user":
        this.navItems = [
          { name: "home", icon: faHome },
          { name: "galleries", icon: faImage },
          { name: "storage", icon: faDatabase },
          { name: "settings", icon: faCogs }
        ];
        break;
      default:
        this.navItems = [];
    }
  }
}
