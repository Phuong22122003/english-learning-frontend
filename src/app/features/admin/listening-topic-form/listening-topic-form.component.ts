import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faTimes, faFile, faImage, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { ListeningTopic } from '../../../models/listening/listening-topic.model';
import { Level } from '../../../models/level.enum';
import { TopicBase } from '../../../models/topic-base';

@Component({
  selector: 'app-listening-topic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './listening-topic-form.component.html',
  styleUrl: './listening-topic-form.component.scss',
})
export class ListeningTopicFormComponent implements OnInit {
  @Output() submit = new EventEmitter<ListeningTopic>();
  @Output() cancel = new EventEmitter<void>();
  @Input() initialData!: TopicBase;
  Level = Level; // Expose Level enum to template
  faSave = faSave;
  faTimes = faTimes;
  faFile = faFile;
  faImage = faImage;
  faChevronDown = faChevronDown;
  topic: Partial<ListeningTopic> = {
    name: '',
    description: '',
    imageUrl: '',
    level: Level.BEGINNER,
  };

  imageFile: File | null = null;
  imagePreview: string | null = null;

  ngOnInit(): void {
    if (this.initialData) {
      this.topic.name = this.initialData.name;
      this.topic.description = this.initialData.description;
      this.topic.imageUrl = this.initialData.imageUrl;
      this.topic.level = this.initialData.level;
      this.imagePreview = this.initialData.imageUrl;
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      this.topic.imageUrl = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.topic.name && this.topic.description && this.topic.imageUrl) {
      this.submit.emit(this.topic as ListeningTopic);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
