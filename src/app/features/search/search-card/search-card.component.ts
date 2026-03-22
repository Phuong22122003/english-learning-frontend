import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopicBase } from '../../../models/topic-base';

@Component({
  selector: 'app-search-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search-card.component.html',
  styleUrl: './search-card.component.scss',
})
export class SearchCardComponent {
  @Input() topic: TopicBase | null = null;
  @Input() topicType?: string; // To determine route (vocabulary, grammar, listening)

  getTopicRoute(): string[] {
    if (!this.topicType || !this.topic?.id) return ['/'];
    const typeLower = this.topicType.toLowerCase();
    return [`/topic-detail/${typeLower}/${this.topic?.id || ''}`];
  }
}
