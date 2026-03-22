import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faClock,
  faFileAlt,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

import { ListeningTest } from '../../../models/listening/listening-test.model';
import { Page } from '../../../models/page.model';
import { ListeningService } from '../../../services/ListeningService';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-listening-topic-tests',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, PaginationComponent],
  templateUrl: './listening-topic-tests.component.html',
})
export class ListeningTopicTestsComponent implements OnInit {
  // FontAwesome icons
  faArrowLeft = faArrowLeft;
  faClock = faClock;
  faFileAlt = faFileAlt;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  topicId = '';
  topicTitle = '';
  tests: ListeningTest[] = [];
  currentPage = 1;
  totalPages = 1;
  readonly TESTS_PER_PAGE = environment.PAGE_SIZE;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listeningService: ListeningService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.topicId = params.get('topicId') || '';

      this.loadTests(this.currentPage - 1);
    });
  }

  loadTests(page: number) {

    this.listeningService
      .getTestsByTopicId(this.topicId, page, this.TESTS_PER_PAGE)
      .subscribe({
        next: (res) => {
          this.topicTitle = res.topicName;
          this.tests = res.tests.content;
          this.totalPages = res.tests.totalPages;
          this.currentPage = res.tests.number + 1;
        },
        error: (err) => {
        },
      });
  }

  handleTestClick(testId: string) {
    this.router.navigate(['/listening/tests', testId]);
  }

  handlePageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTests(page - 1);
    }
  }

  goBack() {
    this.router.navigate(['/listening/topics']);
  }
}
