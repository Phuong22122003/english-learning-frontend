import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchCardComponent } from './search-card/search-card.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { VocabularyService } from '../../services/VocabularyService';
import { GrammarService } from '../../services/GrammarService';
import { ListeningService } from '../../services/ListeningService';
import { TopicBase } from '../../models/topic-base';
import { TopicType } from '../../models/topic-type.enum';
import { Page } from '../../models/page.model';
import { catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchCardComponent,
    PaginationComponent,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  // Search properties
  searchQuery: string = '';
  selectedFilter: TopicType = TopicType.VOCABULARY;
  currentPage: number = 0; // 0-based for API
  pageSize: number = environment.PAGE_SIZE;

  // Results
  topics: TopicBase[] = [];
  totalResults: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;
  error: string | null = null;

  // Filters
  filters = [
    { value: TopicType.VOCABULARY, label: 'Vocab' },
    { value: TopicType.GRAMMAR, label: 'Grammar' },
    { value: TopicType.LISTENING, label: 'Listening' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vocabularyService: VocabularyService,
    private grammarService: GrammarService,
    private listeningService: ListeningService
  ) {}

  ngOnInit(): void {
    // Get query params from route
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['q'] || '';
      const typeParam = params['type'];

      if (typeParam !== undefined) {
        this.selectedFilter = parseInt(typeParam);
      } else {
        this.selectedFilter = TopicType.VOCABULARY;
      }

      this.currentPage = 0;
      this.performSearch();
    });
  }

  performSearch(): void {
    if (!this.searchQuery.trim()) {
      this.topics = [];
      this.totalResults = 0;
      this.totalPages = 0;
      return;
    }

    this.isLoading = true;
    this.error = null;

    if (this.selectedFilter == TopicType.VOCABULARY) {
      this.searchVocabulary();
    } else if (this.selectedFilter == TopicType.GRAMMAR) {
      this.searchGrammar();
    } else if (this.selectedFilter == TopicType.LISTENING) {
      this.searchListening();
    }
  }

  searchVocabulary(): void {
    this.vocabularyService
      .searchVocabularies(this.searchQuery, this.currentPage, this.pageSize)
      .pipe(
        map((page: Page<any>) => {
          const topics = this.mapToTopicBase(page.content, 'VOCABULARY');
          return {
            topics: topics,
            totalPages: page.totalPages,
            totalElements: page.totalElements,
          };
        }),
        catchError((error) => {this.error = 'Không thể tìm kiếm từ vựng. Vui lòng thử lại.';
          return of({ topics: [], totalPages: 0, totalElements: 0 });
        })
      )
      .subscribe({
        next: (result: any) => {
          this.topics = result.topics;
          this.totalPages = result.totalPages;
          this.totalResults = result.totalElements;
          this.isLoading = false;
        },
        error: (error) => {this.isLoading = false;
          this.error = 'Đã xảy ra lỗi. Vui lòng thử lại.';
        },
      });
  }

  searchGrammar(): void {
    this.grammarService
      .searchGrammars(this.searchQuery, this.currentPage, this.pageSize)
      .pipe(
        map((page: Page<any>) => {
          const topics = this.mapToTopicBase(page.content, 'GRAMMAR');
          return {
            topics: topics,
            totalPages: page.totalPages,
            totalElements: page.totalElements,
          };
        }),
        catchError((error) => {this.error = 'Không thể tìm kiếm ngữ pháp. Vui lòng thử lại.';
          return of({ topics: [], totalPages: 0, totalElements: 0 });
        })
      )
      .subscribe({
        next: (result: any) => {
          this.topics = result.topics;
          this.totalPages = result.totalPages;
          this.totalResults = result.totalElements;
          this.isLoading = false;
        },
        error: (error) => {this.isLoading = false;
          this.error = 'Đã xảy ra lỗi. Vui lòng thử lại.';
        },
      });
  }

  searchListening(): void {
    this.listeningService
      .searchListenings(this.searchQuery, this.currentPage, this.pageSize)
      .pipe(
        map((page: Page<any>) => {
          const topics = this.mapToTopicBase(page.content, 'LISTENING');
          return {
            topics: topics,
            totalPages: page.totalPages,
            totalElements: page.totalElements,
          };
        }),
        catchError((error) => {this.error = 'Không thể tìm kiếm nghe. Vui lòng thử lại.';
          return of({ topics: [], totalPages: 0, totalElements: 0 });
        })
      )
      .subscribe({
        next: (result: any) => {
          this.topics = result.topics;
          this.totalPages = result.totalPages;
          this.totalResults = result.totalElements;
          this.isLoading = false;
        },
        error: (error) => {this.isLoading = false;
          this.error = 'Đã xảy ra lỗi. Vui lòng thử lại.';
        },
      });
  }

  searchAll(): void {
    const vocabSearch = this.vocabularyService
      .searchVocabularies(this.searchQuery, this.currentPage, this.pageSize)
      .pipe(
        map((page: Page<any>) =>
          this.mapToTopicBase(page.content, 'VOCABULARY')
        ),
        catchError(() => of([]))
      );

    const grammarSearch = this.grammarService
      .getAllTopics(this.currentPage, this.pageSize)
      .pipe(
        map((page: Page<any>) => this.mapToTopicBase(page.content, 'GRAMMAR')),
        catchError(() => of([]))
      );

    const listeningSearch = this.listeningService
      .getTopics(this.currentPage, this.pageSize)
      .pipe(
        map((page: Page<any>) =>
          this.mapToTopicBase(page.content, 'LISTENING')
        ),
        catchError(() => of([]))
      );

    forkJoin({
      vocab: vocabSearch,
      grammar: grammarSearch,
      listening: listeningSearch,
    }).subscribe({
      next: (results) => {
        const allTopics = [
          ...results.vocab,
          ...results.grammar,
          ...results.listening,
        ];
        this.topics = this.filterTopics(allTopics);
        this.totalResults = this.topics.length;
        this.totalPages = Math.ceil(this.totalResults / this.pageSize);
        this.isLoading = false;
      },
      error: (error) => {this.isLoading = false;
        this.error = 'Đã xảy ra lỗi. Vui lòng thử lại.';
      },
    });
  }

  mapToTopicBase(items: any[], topicType: string): TopicBase[] {
    return items.map((item) => ({
      id: item.id || '',
      name: item.name || item.title || '',
      description: item.description || '',
      imageUrl: item.imageUrl || item.image || '/assets/default-topic.png',
      status: item.status,
      progress: item.progress,
      favoriteId: item.favoriteId,
    }));
  }

  filterTopics(topics: TopicBase[]): TopicBase[] {
    if (!this.searchQuery.trim()) return topics;

    const query = this.searchQuery.toLowerCase().trim();
    return topics.filter(
      (topic) =>
        topic.name.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query)
    );
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.updateUrl();
    this.performSearch();
  }

  onPageChange(page: number): void {
    // Pagination component uses 1-based, API uses 0-based
    this.currentPage = page - 1;
    this.updateUrl();
    this.performSearch();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateUrl(): void {
    const queryParams: any = { q: this.searchQuery };
    if (this.selectedFilter !== TopicType.VOCABULARY) {
      queryParams.type = this.selectedFilter;
    }
    if (this.currentPage > 0) {
      queryParams.page = this.currentPage + 1;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  getTopicTypeLabel(): string {
    switch (this.selectedFilter) {
      case TopicType.VOCABULARY:
        return 'vocabulary';
      case TopicType.GRAMMAR:
        return 'grammar';
      case TopicType.LISTENING:
        return 'listening';
      default:
        return 'vocabulary';
    }
  }

  getResultLabel(): string {
    switch (this.selectedFilter) {
      case TopicType.VOCABULARY:
        return 'topics';
      case TopicType.GRAMMAR:
        return 'topics';
      case TopicType.LISTENING:
        return 'topics';
      default:
        return 'results';
    }
  }
}
