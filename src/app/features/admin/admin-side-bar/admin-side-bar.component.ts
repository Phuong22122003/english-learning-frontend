import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faChevronDown,
  faChevronRight,
  faChevronLeft,
  faBook,
  faVolumeUp,
  faFileAlt,
  faListCheck,
  faUserShield,
  faChartLine,
  faSignOutAlt,
  faUserGraduate,
  faHouse,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../../services/UserService';

interface SidebarItem {
  label: string;
  href?: string;
  children?: SidebarItem[];
  icon?: any;
}

@Component({
  selector: 'app-admin-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './admin-side-bar.component.html',
  styleUrl: './admin-side-bar.component.scss'
})
export class AdminSideBarComponent implements OnInit {
  isCollapsed = false;
  expandedItems: string[] = ['Vocabulary', 'Listening', 'Grammar'];
  @Output() collapseChange = new EventEmitter<boolean>();

  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;
  faUserShield = faUserShield;
  faSignOutAlt = faSignOutAlt;
  faHouse = faHouse;
  faBars = faBars;
  sidebarItems: SidebarItem[] = [
    {
      label: 'Vocabulary',
      icon: faBook,
      children: [
        {
          label: 'Vocabulary Topics',
          href: '/admin/vocabulary/manage',
          icon: faListCheck,
        },
        {
          label: 'Vocabulary Tests',
          href: '/admin/vocabulary/tests',
          icon: faFileAlt,
        },
      ],
    },
    {
      label: 'Listening',
      icon: faVolumeUp,
      children: [
        {
          label: 'Listening Topics',
          href: '/admin/listening/manage',
          icon: faListCheck,
        },
        {
          label: 'Listening Tests',
          href: '/admin/listening/tests',
          icon: faFileAlt,
        },
      ],
    },
    {
      label: 'Grammar',
      icon: faFileAlt,
      children: [
        {
          label: 'Grammar Topics',
          href: '/admin/grammar/manage',
          icon: faListCheck,
        },
        {
          label: 'Grammar Tests',
          href: '/admin/grammar/tests',
          icon: faFileAlt,
        },
      ],
    },
    {
      label: 'TOEIC Test',
      icon: faListCheck,
      href: '/admin/full-test/groups',
    },
    {
      label: 'Statistics',
      icon: faChartLine,
      href: '/admin/statistic',
    },
  ];
  name: string = 'Admin';
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.name = user?.username || 'Admin';
    });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseChange.emit(this.isCollapsed);
  }

  toggleExpanded(label: string) {
    if (this.expandedItems.includes(label)) {
      this.expandedItems = this.expandedItems.filter((i) => i !== label);
    } else {
      this.expandedItems.push(label);
    }
  }

  isExpanded(label: string) {
    return this.expandedItems.includes(label);
  }

  handleLogout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
