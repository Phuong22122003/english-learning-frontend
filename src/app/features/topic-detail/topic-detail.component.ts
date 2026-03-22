import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBook,
  faClipboardCheck,
  faArrowLeft,
  faGraduationCap,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { VocabularyService } from '../../services/VocabularyService';
import { GrammarService } from '../../services/GrammarService';
import { ListeningService } from '../../services/ListeningService';
import { TopicType } from '../../models/topic-type.enum';
import { TopicBase } from '../../models/topic-base';
import { environment } from '../../../environments/environment';

interface TestInfo {
  id: string;
  name: string;
  duration: number;
  createdAt?: string;
}
@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './topic-detail.component.html',
  styleUrl: './topic-detail.component.scss',
})
export class TopicDetailComponent implements OnInit {
  topic: TopicBase | null = null;
  topicType: TopicType | null = null;
  isLoading: boolean = false;
  isLoadingTests: boolean = false;
  error: string | null = null;
  tests: TestInfo[] = [];
  totalTests: number = 0;
  readonly PAGE_SIZE = environment.PAGE_SIZE;
  TopicType = TopicType;
  // Icons
  faBook = faBook;
  faClipboardCheck = faClipboardCheck;
  faArrowLeft = faArrowLeft;
  faGraduationCap = faGraduationCap;
  faFileAlt = faFileAlt;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vocabularyService: VocabularyService,
    private grammarService: GrammarService,
    private listeningService: ListeningService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const type = params['type'];
      const id = params['topicId'];

      if (!type || !id) {
        this.error = 'Invalid topic parameters';
        return;
      }

      // Map type string to TopicType enum
      switch (type.toLowerCase()) {
        case 'vocabulary':
          this.topicType = TopicType.VOCABULARY;
          this.loadVocabularyTopic(id);
          break;
        case 'grammar':
          this.topicType = TopicType.GRAMMAR;
          this.loadGrammarTopic(id);
          break;
        case 'listening':
          this.topicType = TopicType.LISTENING;
          this.loadListeningTopic(id);
          break;
        default:
          this.error = 'Unknown topic type';
      }
    });
  }

  loadVocabularyTopic(id: string): void {
    this.isLoading = true;
    // Assuming we need to get topic from list first or there's a getById method
    // For now, using getTopics and filtering
    this.vocabularyService.getTopics(0, this.PAGE_SIZE).subscribe({
      next: (page) => {
        const foundTopic = page.content.find((t: any) => t.id === id);
        if (foundTopic) {
          this.topic = this.mapToTopicBase(foundTopic);
          this.loadVocabularyTests(id);
        } else {
          this.error = 'Topic not found';
        }
        this.isLoading = false;
      },
      error: (err) => {this.error = 'Failed to load topic';
        this.isLoading = false;
      },
    });
  }

  loadVocabularyTests(topicId: string): void {
    this.isLoadingTests = true;
    this.vocabularyService
      .getTestsByTopicId(topicId, 0, this.PAGE_SIZE)
      .subscribe({
        next: (response) => {
          this.tests = (response.vocabularyTests?.content || []).map(
            (test: any) => ({
              id: test.id || test.testId || '',
              name: test.name || '',
              duration: test.duration || 0,
              createdAt: test.createdAt,
            })
          );
          this.totalTests = response.vocabularyTests?.totalElements || 0;
          this.isLoadingTests = false;
        },
        error: (err) => {this.isLoadingTests = false;
          // Don't set error, just log it
        },
      });
  }

  loadGrammarTopic(id: string): void {
    this.isLoading = true;
    this.grammarService.getAllTopics(0, this.PAGE_SIZE).subscribe({
      next: (page) => {
        const foundTopic = page.content.find((t: any) => t.id === id);
        if (foundTopic) {
          this.topic = this.mapToTopicBase(foundTopic);
          this.loadGrammarTests(id);
        } else {
          this.error = 'Topic not found';
        }
        this.isLoading = false;
      },
      error: (err) => {this.error = 'Failed to load topic';
        this.isLoading = false;
      },
    });
  }

  loadGrammarTests(topicId: string): void {
    this.isLoadingTests = true;
    this.grammarService.getTestsByTopicId(topicId).subscribe({
      next: (response) => {
        this.tests = (response.tests?.content || []).map((test: any) => ({
          id: test.id || '',
          name: test.name || '',
          duration: test.duration || 0,
          createdAt: test.createdAt,
        }));
        this.totalTests = response.tests?.totalElements || 0;
        this.isLoadingTests = false;
      },
      error: (err) => {this.isLoadingTests = false;
      },
    });
  }

  loadListeningTopic(id: string): void {
    this.isLoading = true;
    this.listeningService.getTopics(0, this.PAGE_SIZE).subscribe({
      next: (page) => {
        const foundTopic = page.content.find((t: any) => t.id === id);
        if (foundTopic) {
          this.topic = this.mapToTopicBase(foundTopic);
          this.loadListeningTests(id);
        } else {
          this.error = 'Topic not found';
        }
        this.isLoading = false;
      },
      error: (err) => {this.error = 'Failed to load topic';
        this.isLoading = false;
      },
    });
  }

  loadListeningTests(topicId: string): void {
    this.isLoadingTests = true;
    this.listeningService
      .getTestsByTopicId(topicId, 0, this.PAGE_SIZE)
      .subscribe({
        next: (response) => {
          this.tests = (response.tests?.content || []).map((test: any) => ({
            id: test.id || '',
            name: test.name || '',
            duration: test.duration || 0,
            createdAt: test.createdAt,
          }));
          this.totalTests = response.tests?.totalElements || 0;
          this.isLoadingTests = false;
        },
        error: (err) => {this.isLoadingTests = false;
        },
      });
  }

  mapToTopicBase(item: any): TopicBase {
    return {
      id: item.id || '',
      name: item.name || '',
      description: item.description || '',
      imageUrl: item.imageUrl || item.image || '/assets/default-topic.png',
      status: item.status,
      progress: item.progress,
      favoriteId: item.favoriteId,
    };
  }

  getTopicTypeLabel(): string {
    switch (this.topicType) {
      case TopicType.VOCABULARY:
        return 'Vocabulary';
      case TopicType.GRAMMAR:
        return 'Grammar';
      case TopicType.LISTENING:
        return 'Listening';
      default:
        return '';
    }
  }

  onLearn(): void {
    if (!this.topic) return;

    const type = this.getTopicTypeRoute();
    switch (type) {
      case 'vocabulary':
        this.router.navigate(['/vocabulary/learn', this.topic.id]);
        break;
      case 'grammar':
        this.router.navigate(['/grammar/topics', this.topic.id]);
        break;
      case 'listening':
        this.router.navigate(['/listening/practice', this.topic.id]);
        break;
    }
  }

  onTest(): void {
    if (!this.topic) return;

    const type = this.getTopicTypeRoute();

    this.router.navigate([
      `/${this.mapTopicTypeToRoute(this.topicType)}/topics/tests/${
        this.topic.id
      }`,
    ]);
  }

  onTestClick(testId: string): void {
    if (!this.topic) return;

    switch (this.topicType) {
      case TopicType.VOCABULARY:
        this.router.navigate(['/vocabulary/tests', this.topic.id, testId]);
        break;
      case TopicType.GRAMMAR:
        this.router.navigate(['/grammar/tests', this.topic.id, testId]);
        break;
      case TopicType.LISTENING:
        this.router.navigate(['/listening/tests', testId]);
        break;
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
  }

  getTopicTypeRoute(): string {
    switch (this.topicType) {
      case TopicType.VOCABULARY:
        return 'vocabulary';
      case TopicType.GRAMMAR:
        return 'grammar';
      case TopicType.LISTENING:
        return 'listening';
      default:
        return '';
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  mapTopicTypeToRoute(topicType: TopicType | null): string {
    switch (topicType) {
      case TopicType.VOCABULARY:
        return 'vocabulary';
      case TopicType.GRAMMAR:
        return 'grammar';
      case TopicType.LISTENING:
        return 'listening';
      default:
        return '';
    }
  }
}
