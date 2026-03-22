import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlay, faFileAlt } from '@fortawesome/free-solid-svg-icons';

import { ListeningService } from '../../../services/ListeningService';
import { FavoriteService } from '../../../services/FavoriteService';
import { TopicBase } from '../../../models/topic-base';
import { TopicCardComponent } from '../../../shared/topic-card/topic-card.component';
import { ItemTypeEnum } from '../../../models/item-type-enum';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-listening-topics',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, TopicCardComponent],
  templateUrl: './listening-topic.component.html',
})
export class ListeningTopicsComponent implements OnInit {
  faPlay = faPlay;
  faFileAlt = faFileAlt;
  topics: TopicBase[] = [];
  favoriteTopicIds: Map<string, string> = new Map();
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private listeningService: ListeningService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadFavorites();
  }

  loadData() {
    this.isLoading = true;
    this.error = null;
    this.topics = []; // Clear previous data

    this.listeningService.getTopics().subscribe({
      next: (res) => {
        res.content.forEach((topic) => {
          this.topics.push({
            description: topic.description,
            id: topic.id,
            imageUrl: topic.imageUrl,
            name: topic.name,
            progress: 0,
            status: 'Complete',
            favoriteId: topic.favoriteId,
            level: topic.level,
          });
        });
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
    this.favoriteService.getFavoritesByType(ItemTypeEnum.LISTENING).subscribe({
      next: (favorites) => {
        this.favoriteTopicIds = new Map(
          favorites.map((f) => [f.listeningTopic?.id, f.id])
        );
      },
      error: (error) => {},
    });
  }

  goToPractice(topic: TopicBase) {
    this.router.navigate([`/listening/practice/${topic.id}`]);
  }

  goToTest(topic: TopicBase) {
    this.router.navigate([`/listening/topics/tests/${topic.id}`]);
  }

  // Check if topic is favorite
  isFavorite(topic: TopicBase): boolean {
    return this.favoriteTopicIds.has(topic.id);
  }

  // Handle favorite toggle
  onFavorite(topic: TopicBase) {
    this.favoriteService
      .addFavorite(topic.id, ItemTypeEnum.LISTENING)
      .subscribe({
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
