import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-by-file',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-by-file.component.html',
  styleUrl: './upload-by-file.component.scss',
})
export class UploadByFileComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() isContainsImage: boolean = false;
  @Input() isContainsAudio: boolean = false;
  @Input() excelTemplate: string = '';

  @Output() uploadFile = new EventEmitter<{
    excelFile: File;
    imageFiles: File[];
    audioFiles: File[];
  }>();
  // Selected files
  excelFile: File = new File([], '');
  imageFiles: File[] = [];
  audioFiles: File[] = [];

  // Preview URLs
  imagePreviewUrls: string[] = [];

  onExcelFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.excelFile = input.files[0];
    }
  }

  onImageFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.imageFiles = [...this.imageFiles, ...files];

      // Create preview URLs
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            this.imagePreviewUrls.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input để có thể chọn lại file giống nhau
    input.value = '';
  }

  onAudioFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.audioFiles = [...this.audioFiles, ...files];
    }
    // Reset input để có thể chọn lại file giống nhau
    input.value = '';
  }

  removeExcelFile(): void {
    this.excelFile = new File([], '');
  }

  removeImageFile(index: number): void {
    this.imageFiles.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  removeAudioFile(index: number): void {
    this.audioFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  onUploadFile(): void {
    if (!this.excelFile) {return;
    }

    this.uploadFile.emit({
      excelFile: this.excelFile,
      imageFiles: this.imageFiles,
      audioFiles: this.audioFiles,
    });
  }

  resetFiles(): void {
    this.excelFile = new File([], '');
    this.imageFiles = [];
    this.audioFiles = [];
    this.imagePreviewUrls = [];
  }

  downloadTemplate() {
    const url = `assets/templates/${this.excelTemplate}`;

    const a = document.createElement('a');
    a.href = url;
    a.download = this.excelTemplate;
    a.click();
  }
}
