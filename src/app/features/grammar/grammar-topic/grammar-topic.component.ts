import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faBookOpen,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { GrammarTopic } from '../../../models/grammar/grammar-topic.model';
import { GrammarService } from '../../../services/GrammarService';
import { FavoriteService } from '../../../services/FavoriteService';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { environment } from '../../../../environments/environment';
import { TopicCardComponent } from '../../../shared/topic-card/topic-card.component';
import { TopicBase } from '../../../models/topic-base';
import { ItemTypeEnum } from '../../../models/item-type-enum';

@Component({
  selector: 'app-grammar-topic',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    PaginationComponent,
    TopicCardComponent,
  ],
  templateUrl: './grammar-topic.component.html',
})
export class GrammarTopicComponent implements OnInit {
  faBookOpen = faBookOpen;
  faFileAlt = faFileAlt;
  faArrowLeft = faArrowLeft;
  grammarTopics: GrammarTopic[] = [];
  topics: TopicBase[] = [];
  currentPage = 1;
  totalPages = 1;
  readonly TOPICS_PER_PAGE = environment.PAGE_SIZE;
  favoriteTopicIds: Map<string, string> = new Map();
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private grammarService: GrammarService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadFavorites();
  }

  onLearn(topic: TopicBase) {
    this.router.navigate(['/grammar/topics', topic.id.toString()]);
  }

  badgeClass(status: GrammarTopic['status']) {
    if (status === 'Completed') return 'bg-primary text-primary-foreground';
    if (status === 'In Progress') return 'bg-muted text-foreground';
    return 'border border-primary text-primary';
  }

  loadData() {
    this.isLoading = true;
    this.error = null;
    this.topics = []; // Clear previous data

    this.grammarService
      .getAllTopics(this.currentPage - 1, this.TOPICS_PER_PAGE)
      .subscribe({
        next: (data) => {
          data.content.forEach((topic) => {
            this.topics.push({
              description: topic.description,
              id: topic.id,
              imageUrl: topic.imageUrl,
              name: topic.name,
              progress: 0,
              status: 'Complete',
              level: topic.level,
            });
          });
          this.totalPages = data.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          this.error =
            'Lỗi tải danh sách chủ đề: Hệ thống đang gặp sự cố. Vui lòng thử lại sau.';
          this.isLoading = false;
        },
      });
  }

  loadFavorites() {
    this.favoriteService.getFavoritesByType(ItemTypeEnum.GRAMMAR).subscribe({
      next: (favorites) => {
        this.favoriteTopicIds = new Map(
          favorites.map((f) => [f.grammarTopic?.id, f.id])
        );
      },
      error: (error) => {},
    });
  }

  handlePageChange(newPage: number) {
    this.currentPage = newPage;
    this.loadData();
  }

  // Check if topic is favorite
  isFavorite(topic: TopicBase): boolean {
    return this.favoriteTopicIds.has(topic.id);
  }

  // Handle favorite toggle
  onFavorite(topic: TopicBase) {
    this.favoriteService.addFavorite(topic.id, ItemTypeEnum.GRAMMAR).subscribe({
      next: (response) => {
        this.favoriteTopicIds.set(topic.id, response.id);
        topic.favoriteId = response.id;
      },
      error: (error) => {},
    });
  }

  onUnfavorite(topic: TopicBase) {
    const favoriteId = this.favoriteTopicIds.get(topic.id);
    if (favoriteId) {
      this.favoriteService.deleteFavorite(favoriteId).subscribe({
        next: () => {
          this.favoriteTopicIds.delete(topic.id);
          topic.favoriteId = undefined;
        },
        error: (error) => {},
      });
    }
  }
}
