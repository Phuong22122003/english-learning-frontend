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

import { VocabularyTest } from '../../../models/vocabulary/vocabulary-test.model';
import { Page } from '../../../models/page.model';
import { VocabularyService } from '../../../services/VocabularyService';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vocab-topic-tests',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, PaginationComponent],
  templateUrl: './vocab-topic-tests.component.html',
})
export class VocabTopicTestsComponent implements OnInit {
  // FontAwesome icons
  faArrowLeft = faArrowLeft;
  faClock = faClock;
  faFileAlt = faFileAlt;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  topicId = '';
  topicTitle = '';
  tests: VocabularyTest[] = [];
  currentPage = 1;
  totalPages = 1;
  readonly TESTS_PER_PAGE = environment.PAGE_SIZE;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vocabService: VocabularyService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.topicId = params.get('topicId') || '';

      this.loadTests(this.currentPage - 1);
    });
  }

  loadTests(page: number) {
    this.vocabService
      .getTestsByTopicId(this.topicId, page, this.TESTS_PER_PAGE)
      .subscribe({
        next: (res: {
          name: string;
          id: string;
          tests: Page<VocabularyTest>;
        }) => {
          this.topicTitle = res.name;
          this.tests = res.tests.content;
          this.totalPages = res.tests.totalPages;
          this.currentPage = res.tests.number + 1;
        },
        error: (err) => {},
      });
  }

  handleTestClick(testId: string) {
    this.router.navigate(['/vocabulary/tests', this.topicId, testId]);
  }

  handlePageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTests(page - 1);
    }
  }

  goBack() {
    this.router.navigate(['/vocabulary/topics']);
  }
}
