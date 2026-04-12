import { Component, Output, EventEmitter, Input, SimpleChanges, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faChevronDown,
  faChevronRight,
  faChevronLeft,
  faHome,
  faNewspaper,
  faBookOpen,
  faVolumeUp,
  faFileAlt,
  faUser,
  faHeart,
  faDatabase,
  faBars,
  faPerson,
  faHistory,
  faCalendarAlt,
  faChartLine,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../services/UserService';

interface SidebarItem {
  label: string;
  href?: string;
  children?: SidebarItem[];
  icon?: any;
  visible?: boolean;
}

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent implements OnInit{
  isCollapsed = false;
  expandedItems: string[] = [];
  @Output() collapseChange = new EventEmitter<boolean>();
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;
  faBars = faBars;
  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth < 1024) {
      this.isCollapsed = true;
    }
  }
  sidebarItems: SidebarItem[] = [
    { 
      visible: true,
      label: 'Home', 
      href: '/home', 
      icon: faHome 
    },
    {
      visible: true,
      label: 'Learning',
      icon: faBookOpen,
      children: [
        {
          label: 'Word',
          icon: faFileAlt,
          href: '/vocabulary/topics',
        },
        {
          label: 'Listening',
          icon: faVolumeUp,
          href: '/listening/topics',
        },
        {
          label: 'Grammar',
          icon: faFileAlt,
          href: '/grammar/topics',
        },
        {
          label: 'Pronunciation',
          icon: faVolumeUp,
          href: '/pronunciation',
        },
        {
          label: 'TOEIC Test',
          icon: faListCheck,
          href: '/full-test/groups',
        },
      ],
    },
    { label: 'Planning',visible:true, icon: faCalendarAlt, href: '/planning'},

    {
      label: 'You',
      visible: false,
      icon: faUser,
      children: [
        { label: 'Profile', href: '/profile', icon: faPerson },
        { label: 'My Favorites', href: '/favorite', icon: faHeart },
        { label: 'History', icon: faHistory, href: '/history'},
        { label: 'Statistics', icon: faChartLine, href: '/statistic'},
      ]
    },
  ];

    constructor(private userService: UserService){}

  ngOnInit(): void {
    if (window.innerWidth < 1024) {
      this.isCollapsed = true;
    }
    this.userService.user$.subscribe((user) => {
      if (user) {
       this.setVisible(true);
      }
    });
  }
  setVisible(visible: boolean) {
    const youMenu = this.sidebarItems.find(item => item.label === 'You');
    if (youMenu) {
      youMenu.visible = visible;
    }
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
}
