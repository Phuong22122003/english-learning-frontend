import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faTimes, faImage, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { VocabTopic } from '../../../models/vocabulary/vocab-topic.model';
import { Level } from '../../../models/level.enum';
import { TopicBase } from '../../../models/topic-base';

export interface VocabTopicFormData {
  name: string;
  description?: string;
  imageFile?: File | null;
  level?: Level;
}

@Component({
  selector: 'app-vocab-topic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './vocab-topic-form.component.html',
})
export class VocabTopicFormComponent implements OnInit {
  @Input() initialData: TopicBase | null = null;
  @Output() save = new EventEmitter<VocabTopic>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  imagePreview: string | null = null;

  faSave = faSave;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faImage = faImage;
  Level = Level; // Expose Level enum to template

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.initialData?.name || '', Validators.required],
      description: [this.initialData?.description || '', Validators.required],
      imageUrl: [null, this.initialData ? null : Validators.required],
      level: [this.initialData?.level || Level.BEGINNER, Validators.required],
    });

    if (this.initialData && (this.initialData as any).imageUrl) {
      this.imagePreview = (this.initialData as any).imageUrl;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.form.patchValue({ imageUrl: file });

      // Hiển thị preview
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
