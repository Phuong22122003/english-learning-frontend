import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faBell,
  faSearch,
  faSignOutAlt,
  faUser,
  faUserGraduate,
} from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../services/UserService';
import { Router, RouterModule } from '@angular/router';
import { TopicType } from '../../models/topic-type.enum';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @ViewChild('dropdownContainer', { static: false })
  dropdownContainer!: ElementRef;

  faBell: IconProp = faBell;
  faUser: IconProp = faUser;
  faSearch: IconProp = faSearch;
  faSignOutAlt = faSignOutAlt;
  faUserGraduate = faUserGraduate;
  avatarUrl: string = '';
  isDropdownOpen = false;
  isLoggedIn = false;
  // Search properties
  searchQuery: string = '';
  selectedTopicType: string = TopicType.VOCABULARY.toString();
  topicTypes = [
    { value: TopicType.VOCABULARY.toString(), label: 'Vocabulary' },
    { value: TopicType.GRAMMAR.toString(), label: 'Ngữ pháp' },
    { value: TopicType.LISTENING.toString(), label: 'Nghe' },
  ];

  constructor(private userService: UserService, private router: Router) {}

  toggleDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isDropdownOpen && this.dropdownContainer) {
      const clickedInside = this.dropdownContainer.nativeElement.contains(
        event.target as Node
      );
      if (!clickedInside) {
        this.isDropdownOpen = false;
      }
    }
  }

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      if (user) {
        this.avatarUrl = user.avatarUrl || '';
        this.isLoggedIn = true;
      }
    });
  }
  handleLogout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) return;

    // Navigate to search page with query params
    const queryParams: any = {
      q: this.searchQuery.trim(),
      type: this.selectedTopicType,
    };
    this.router.navigate(['/search'], { queryParams });
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  isAdmin() {
    return this.userService.hasScope('ROLE_ADMIN');
  }
}
