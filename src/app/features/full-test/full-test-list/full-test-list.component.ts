import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faFileAlt,
  faUsers,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import { ToeicTestResponse } from '../../../models/response/toeict-test-response.model';
import { ToeicTestGroupResponse } from '../../../models/response/toeic-test-group-response.model';
import { Page } from '../../../models/page.model';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { environment } from '../../../../environments/environment';
import { ToeicTestService } from '../../../services/ToeicTestService';
import { CommonUtils } from '../../../shared/utils/common';

@Component({
  selector: 'app-full-test-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    PaginationComponent,
    DatePipe,
  ],
  templateUrl: './full-test-list.component.html',
  styleUrl: './full-test-list.component.scss',
})
export class FullTestListComponent implements OnInit {
  commonUtils = CommonUtils;
  groupId: string = '';
  group: ToeicTestGroupResponse | null = null;
  tests: ToeicTestResponse[] = [];
  currentPage = 1;
  totalPages = 1;
  totalElements = 0;
  isLoading = false;
  error: string | null = null;
  readonly TESTS_PER_PAGE = environment.PAGE_SIZE || 12;

  // Color schemes for tests - each test gets a consistent color
  private readonly COLOR_SCHEMES = [
    {
      gradient: 'from-blue-500 to-blue-600',
      solid: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      gradient: 'from-green-500 to-green-600',
      solid: 'bg-green-500 hover:bg-green-600',
    },
    {
      gradient: 'from-purple-500 to-purple-600',
      solid: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      gradient: 'from-pink-500 to-pink-600',
      solid: 'bg-pink-500 hover:bg-pink-600',
    },
    {
      gradient: 'from-orange-500 to-orange-600',
      solid: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      gradient: 'from-indigo-500 to-indigo-600',
      solid: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      gradient: 'from-red-500 to-red-600',
      solid: 'bg-red-500 hover:bg-red-600',
    },
    {
      gradient: 'from-teal-500 to-teal-600',
      solid: 'bg-teal-500 hover:bg-teal-600',
    },
    {
      gradient: 'from-cyan-500 to-cyan-600',
      solid: 'bg-cyan-500 hover:bg-cyan-600',
    },
    {
      gradient: 'from-amber-500 to-amber-600',
      solid: 'bg-amber-500 hover:bg-amber-600',
    },
  ];

  // FontAwesome icons
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faFileAlt = faFileAlt;
  faUsers = faUsers;
  faCalendarAlt = faCalendarAlt;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toeicTestService: ToeicTestService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.groupId = params['groupId'];
      if (this.groupId) {
        this.loadTests(this.currentPage - 1);
      }
    });
  }

  loadGroup(): void {
    // TODO: Implement API call to get group by ID
    // For now, using mock data
    this.group = {
      id: this.groupId,
      name: 'TEST ĐẦU VÀO (1)',
      releaseDate: '2025-01-01',
      createdAt: '2025-01-01',
      tests: [],
    };
  }

  loadTests(page: number): void {
    this.isLoading = true;
    this.error = null;

    this.toeicTestService.getGroupById(this.groupId).subscribe({
      next: (group) => {
        this.group = group;
        this.tests = group.tests;
        this.isLoading = false;
        this.totalElements = group.tests.length;
      },
    });
  }

  handlePageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTests(page - 1);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  handleTestClick(testId: string): void {
    this.router.navigate(['/full-test/groups', this.groupId, testId]);
  }

  goBack(): void {
    this.router.navigate(['/full-test/groups']);
  }

  formatNumber(num: number): string {
    return num.toLocaleString('vi-VN');
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getColorClassForTest(testId: string, index: number): string {
    // Use testId hash or index to get consistent color
    let hash = 0;
    if (testId) {
      for (let i = 0; i < testId.length; i++) {
        hash = testId.charCodeAt(i) + ((hash << 5) - hash);
      }
    } else {
      hash = index;
    }
    const colorIndex = Math.abs(hash) % this.COLOR_SCHEMES.length;
    return this.COLOR_SCHEMES[colorIndex].gradient;
  }

  getButtonColorClassForTest(testId: string, index: number): string {
    // Use testId hash or index to get consistent color (same as header)
    let hash = 0;
    if (testId) {
      for (let i = 0; i < testId.length; i++) {
        hash = testId.charCodeAt(i) + ((hash << 5) - hash);
      }
    } else {
      hash = index;
    }
    const colorIndex = Math.abs(hash) % this.COLOR_SCHEMES.length;
    return this.COLOR_SCHEMES[colorIndex].solid;
  }
}
