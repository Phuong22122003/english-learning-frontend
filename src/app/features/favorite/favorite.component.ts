import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoriteService } from '../../services/FavoriteService';
import { FavoriteResponse } from '../../models/response/favorite-response.model';
import { ItemTypeEnum } from '../../models/item-type-enum';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTrash,
  faHeart,
  faBook,
  faHeadphones,
  faLanguage,
  faClipboardCheck,
  faQuestion,
  faBookOpen,
  faFileAlt,
  faCalendarPlus,
  faSpinner,
  faExclamationTriangle,
  faTimes,
  faHeartBroken,
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ConfirmDialogComponent,
  ],
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss',
})
export class FavoriteComponent implements OnInit {
  favorites: FavoriteResponse[] = [];
  filteredFavorites: FavoriteResponse[] = [];
  selectedFilter: ItemTypeEnum | 'ALL' = 'ALL';
  isLoading = false;
  error: string | null = null;

  // Confirm dialog state
  showConfirmDialog = false;
  favoriteToDelete: string | null = null;

  // Icons
  faTrash = faTrash;
  faHeart = faHeart;
  faBook = faBook;
  faHeadphones = faHeadphones;
  faLanguage = faLanguage;
  faClipboardCheck = faClipboardCheck;
  faQuestion = faQuestion;
  faBookOpen = faBookOpen;
  faFileAlt = faFileAlt;
  faCalendarPlus = faCalendarPlus;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faTimes = faTimes;
  faHeartBroken = faHeartBroken;

  // Filter options
  filterOptions = [
    { value: 'ALL', label: 'Tất cả' },
    { value: ItemTypeEnum.GRAMMAR, label: 'Ngữ pháp' },
    { value: ItemTypeEnum.LISTENING, label: 'Nghe' },
    { value: ItemTypeEnum.VOCABULARY, label: 'Từ vựng' },
  ];

  constructor(
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavorites(this.selectedFilter as ItemTypeEnum);
  }

  loadFavorites(itemType?: ItemTypeEnum): void {
    this.isLoading = true;
    this.error = null;

    this.favoriteService.getFavoritesByType(itemType).subscribe({
      next: (favorites: FavoriteResponse[]) => {
        this.favorites = favorites;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        this.error =
          'Lỗi tải danh sách yêu thích: Hệ thống đang gặp sự cố. Vui lòng thử lại sau.';
        this.isLoading = false;
      },
    });
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedFilter === 'ALL') {
      this.filteredFavorites = this.favorites;
    } else {
      this.filteredFavorites = this.favorites.filter(
        (favorite) => favorite.itemType === this.selectedFilter
      );
    }
  }

  deleteFavorite(favoriteId: string): void {
    this.favoriteToDelete = favoriteId;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.favoriteToDelete) {
      this.favoriteService.deleteFavorite(this.favoriteToDelete).subscribe({
        next: () => {
          // Remove from local arrays
          this.favorites = this.favorites.filter(
            (f) => f.id !== this.favoriteToDelete
          );
          this.filteredFavorites = this.filteredFavorites.filter(
            (f) => f.id !== this.favoriteToDelete
          );
          this.showConfirmDialog = false;
          this.favoriteToDelete = null;
        },
        error: (error) => {
          this.error =
            'Lỗi xóa yêu thích: ' + (error.message || 'Không xác định');
          this.showConfirmDialog = false;
          this.favoriteToDelete = null;
        },
      });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.favoriteToDelete = null;
  }

  getItemTitle(favorite: FavoriteResponse): string {
    switch (favorite.itemType) {
      case ItemTypeEnum.GRAMMAR:
        return favorite.grammarTopic?.name || 'Không có tiêu đề';
      case ItemTypeEnum.LISTENING:
        return favorite.listeningTopic?.name || 'Không có tiêu đề';
      case ItemTypeEnum.VOCABULARY:
        return favorite.vocabTopic?.name || 'Không có tiêu đề';
      case ItemTypeEnum.FULL_TEST:
        return 'Bài kiểm tra';
      default:
        return 'Không xác định';
    }
  }

  getItemDescription(favorite: FavoriteResponse): string {
    switch (favorite.itemType) {
      case ItemTypeEnum.GRAMMAR:
        return favorite.grammarTopic?.description || 'Không có mô tả';
      case ItemTypeEnum.LISTENING:
        return favorite.listeningTopic?.description || 'Không có mô tả';
      case ItemTypeEnum.VOCABULARY:
        return favorite.vocabTopic?.description || 'Không có mô tả';
      case ItemTypeEnum.FULL_TEST:
        return 'Bài kiểm tra tổng hợp';
      default:
        return 'Không có mô tả';
    }
  }

  getItemImage(favorite: FavoriteResponse): string {
    switch (favorite.itemType) {
      case ItemTypeEnum.GRAMMAR:
        return (
          favorite.grammarTopic?.imageUrl ||
          this.getDefaultImage(ItemTypeEnum.GRAMMAR)
        );
      case ItemTypeEnum.LISTENING:
        return (
          favorite.listeningTopic?.imageUrl ||
          this.getDefaultImage(ItemTypeEnum.LISTENING)
        );
      case ItemTypeEnum.VOCABULARY:
        return (
          favorite.vocabTopic?.imageUrl ||
          this.getDefaultImage(ItemTypeEnum.VOCABULARY)
        );
      default:
        return this.getDefaultImage(ItemTypeEnum.GRAMMAR);
    }
  }

  getDefaultImage(itemType: ItemTypeEnum): string {
    switch (itemType) {
      case ItemTypeEnum.GRAMMAR:
        return '/assets/images/grammar-default.jpg';
      case ItemTypeEnum.LISTENING:
        return '/assets/images/listening-default.jpg';
      case ItemTypeEnum.VOCABULARY:
        return '/assets/images/vocabulary-default.jpg';
      default:
        return '/assets/images/default-topic.jpg';
    }
  }

  onImageError(event: any): void {
    // Set a fallback image when the original image fails to load
    event.target.src = '/assets/images/default-topic.jpg';
  }

  getItemTypeLabel(itemType: ItemTypeEnum): string {
    const option = this.filterOptions.find((opt) => opt.value === itemType);
    return option?.label || itemType;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  getTypeIcon(itemType: ItemTypeEnum): any {
    switch (itemType) {
      case ItemTypeEnum.GRAMMAR:
        return faBook;
      case ItemTypeEnum.LISTENING:
        return faHeadphones;
      case ItemTypeEnum.VOCABULARY:
        return faLanguage;
      case ItemTypeEnum.FULL_TEST:
        return faClipboardCheck;
      default:
        return faQuestion;
    }
  }

  learnItem(favorite: FavoriteResponse): void {
    switch (favorite.itemType) {
      case ItemTypeEnum.GRAMMAR:
        this.router.navigate(['/grammar/topics', favorite.grammarTopic?.id]);
        break;
      case ItemTypeEnum.LISTENING:
        this.router.navigate([
          '/listening/practice',
          favorite.listeningTopic?.id,
        ]);
        break;
      case ItemTypeEnum.VOCABULARY:
        this.router.navigate(['/vocabulary/learn', favorite.vocabTopic?.id]);
        break;
    }
  }

  takeTest(favorite: FavoriteResponse): void {
    switch (favorite.itemType) {
      case ItemTypeEnum.GRAMMAR:
        this.router.navigate([
          '/grammar/topics/tests',
          favorite.grammarTopic?.id,
        ]);
        break;
      case ItemTypeEnum.LISTENING:
        this.router.navigate([
          '/listening/topics/tests',
          favorite.listeningTopic?.id,
        ]);
        break;
      case ItemTypeEnum.VOCABULARY:
        this.router.navigate([
          '/vocabulary/topics/tests',
          favorite.vocabTopic?.id,
        ]);
        break;
    }
  }
}
