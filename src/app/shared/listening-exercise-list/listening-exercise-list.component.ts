import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';

export interface ListeningExercise {
  id: string;
  name: string | null;
  audioUrl: string;
  imageUrl: string;
  transcript: string;
  question: string;
  options: { [key: string]: string };
  correctAnswer: string;
  createdAt: string;
  explaination?: string;
}

@Component({
  selector: 'app-listening-exercise-list',
  standalone: true,
  imports: [CommonModule, AudioPlayerComponent],
  templateUrl: './listening-exercise-list.component.html',
  styleUrl: './listening-exercise-list.component.scss',
})
export class ListeningExerciseListComponent implements OnInit {
  @Input() listenings: ListeningExercise[] = [];
  @Input() showEmptyState: boolean = true;
  @Input() emptyStateTitle: string = 'No listening exercises found';
  @Input() emptyStateMessage: string =
    'Start by adding your first listening exercise to this topic.';
  @Input() emptyStateButtonText: string = 'Add First Exercise';

  @Output() viewListening = new EventEmitter<ListeningExercise>();
  @Output() editListening = new EventEmitter<ListeningExercise>();
  @Output() deleteListening = new EventEmitter<ListeningExercise>();
  @Output() addFirstExercise = new EventEmitter<void>();

  onViewListening(listening: ListeningExercise) {
    this.viewListening.emit(listening);
  }

  onEditListening(listening: ListeningExercise) {
    this.editListening.emit(listening);
  }

  onDeleteListening(listening: ListeningExercise) {
    this.deleteListening.emit(listening);
  }

  onAddFirstExercise() {
    this.addFirstExercise.emit();
  }

  ngOnInit(): void {
  }
}
