import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faRotateLeft,
  faChevronRight,
  faChevronLeft,
  faVolumeUp,
} from '@fortawesome/free-solid-svg-icons';
import { Vocabulary } from '../../../models/vocabulary/vocabulary.model';
import { VocabularyService } from '../../../services/VocabularyService';

@Component({
  selector: 'app-learn-new-word',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './learn-new-word.component.html',
  styleUrl: './learn-new-word.component.scss',
})
export class LearnNewWordComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  faRotateLeft = faRotateLeft;
  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;
  faVolumeUp = faVolumeUp;
  topicTitle = '';
  topic = '';
  words: Vocabulary[] = []; // 👈 dùng trực tiếp Vocabulary
  currentIndex = 0;
  isFlipped = false;
  completedWords: Set<string> = new Set();

  topicTitles: Record<string, string> = {
    'business-english': 'Business English',
    'travel-tourism': 'Travel & Tourism',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vocabService: VocabularyService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.topic = params.get('topic') || '';

      this.vocabService.getVocabulariesByTopicId(this.topic, 0, 20).subscribe({
        next: (res) => {
          this.words = res.vocabularies;
          this.topicTitle = res.name;
          this.currentIndex = 0;
          this.isFlipped = false;
          this.completedWords.clear();
          if (this.currentWord?.id !== null) {
            this.completedWords.add(this.currentWord!.id);
          }
        },
        error: (err) => {},
      });
    });
  }

  get currentWord(): Vocabulary | undefined {
    return this.words[this.currentIndex];
  }

  handleNext() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      this.completedWords.add(this.currentWord!.id);
      this.isFlipped = false;
    }
  }

  handlePrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
    }
  }

  handleFlip() {
    this.isFlipped = !this.isFlipped;
  }

  handlePronunciation(vocab: Vocabulary) {
    if(vocab.audioUrl){
      const audio = new Audio(vocab.audioUrl);
      audio.play();
      return;
    }
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(vocab.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }

  goBack() {
    this.router.navigate(['/learn-words']);
  }
}
