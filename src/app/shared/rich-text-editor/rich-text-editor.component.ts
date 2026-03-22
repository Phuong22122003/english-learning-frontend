import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileService } from '../../services/FileService';
import { FileResponse } from '../../models/response/file-response.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Import Quill
import Quill from 'quill';

// Import Quill styles
import 'quill/dist/quill.snow.css';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
})
export class RichTextEditorComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  constructor(
    private fileService: FileService,
    private sanitizer: DomSanitizer
  ) {}
  @ViewChild('editor', { static: false }) editorRef!: ElementRef;
  @ViewChild('preview', { static: false }) previewRef!: ElementRef;

  @Input() content: string = '';
  @Input() placeholder: string = 'Nhập nội dung...';
  @Input() height: string = '1200px';
  @Input() uploadEndpoint: string = '/api/upload';
  @Input() maxFileSize: number = 5 * 1024 * 1024; // 5MB
  @Input() allowedImageTypes: string[] = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  @Output() contentChange = new EventEmitter<string>();
  @Output() imageUpload = new EventEmitter<File>();

  // Component state
  isEditMode = true;
  isSplitMode = false;
  quill: Quill | null = null;
  isLoading = false;
  error: string | null = null;
  selectedImageIndex: number | null = null;
  uploadedImages: Map<string, string> = new Map(); // Map<publicId, url>
  private savedRange: any = null;
  private previousDelta: any = null;
  // Editor configuration
  private editorConfig = {
    theme: 'snow',
    placeholder: this.placeholder,
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
      ],
    },
  };

  ngOnInit(): void {
    // Initialize component
  }

  ngAfterViewInit(): void {
    this.initializeEditor();
  }

  ngOnDestroy(): void {
    if (this.quill) {
      this.quill = null;
    }
  }

  initializeEditor(): void {
    if (!this.editorRef?.nativeElement) return;

    try {
      this.quill = new Quill(this.editorRef.nativeElement, this.editorConfig);

      this.previousDelta = this.quill.getContents();

      this.quill.on('text-change', (delta, oldDelta, source) => {
        if (source !== 'user') return;

        this.detectDeletedImages(oldDelta, delta);

        this.previousDelta = delta;
      });

      // Set initial content
      if (this.content) {
        this.quill.root.innerHTML = this.content;
      }

      // Listen for content changes
      this.quill.on('text-change', () => {
        const content = this.quill?.root.innerHTML || '';
        this.content = content;
        this.contentChange.emit(content);
      });

      // Handle image button click
      const toolbar = this.quill.getModule('toolbar') as any;
      if (toolbar && toolbar.addHandler) {
        toolbar.addHandler('image', this.selectLocalImage.bind(this));
      }

      // Handle image selection for deletion
      this.quill.on('selection-change', (range) => {
        if (range && range.length > 0) {
          const contents = this.quill?.getContents(range.index, range.length);
          if (
            contents &&
            contents.ops &&
            contents.ops[0] &&
            contents.ops[0].insert &&
            typeof contents.ops[0].insert === 'object' &&
            contents.ops[0].insert &&
            'image' in contents.ops[0].insert
          ) {
            this.selectedImageIndex = range.index;
          } else {
            this.selectedImageIndex = null;
          }
        } else {
          this.selectedImageIndex = null;
        }
      });
    } catch (error) {this.error = 'Không thể khởi tạo trình soạn thảo';
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.isSplitMode = false;
  }

  turnEditMode(): void {
    this.isEditMode = true;
    this.isSplitMode = false;
  }

  turnSplitMode(): void {
    this.isSplitMode = true;
    this.isEditMode = true;
  }

  turnViewMode(): void {
    this.isEditMode = false;
    this.isSplitMode = false;
  }

  getContent(): string {
    return this.quill?.root.innerHTML || '';
  }

  setContent(content: string): void {
    if (this.quill) {
      this.quill.root.innerHTML = content;
      this.content = content;
    }
  }

  clearContent(): void {
    if (this.quill) {
      this.quill.setText('');
      this.content = '';
      this.contentChange.emit('');
    }
  }

  async uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Validate file
      if (!this.validateFile(file)) {
        reject(new Error('File không hợp lệ'));
        return;
      }

      this.isLoading = true;
      this.error = null;

      // Emit upload event for parent component to handle
      this.imageUpload.emit(file);

      // Call FileService to upload image
      this.fileService.uploadImage(file).subscribe({
        next: (response: FileResponse) => {
          this.isLoading = false;
          // Store the uploaded image info
          this.uploadedImages.set(response.publicId, response.url);
          resolve(response.url);
        },
        error: (error) => {
          this.isLoading = false;
          this.error = 'Lỗi upload ảnh: ' + (error.message || 'Không xác định');
          reject(error);
        },
      });
    });
  }

  private validateFile(file: File): boolean {
    // Check file size
    if (file.size > this.maxFileSize) {
      this.error = `File quá lớn. Kích thước tối đa: ${
        this.maxFileSize / (1024 * 1024)
      }MB`;
      return false;
    }

    // Check file type
    if (!this.allowedImageTypes.includes(file.type)) {
      this.error = `Loại file không được hỗ trợ. Chỉ chấp nhận: ${this.allowedImageTypes.join(
        ', '
      )}`;
      return false;
    }

    return true;
  }

  selectLocalImage(): void {
    if (!this.quill) return;
    this.savedRange = this.quill.getSelection();
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        this.uploadImage(file)
          .then((imageUrl) => {
            this.insertImage(imageUrl);
          })
          .catch((error) => {});
      }
    };
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadImage(file)
        .then((imageUrl) => {
          this.insertImage(imageUrl);
        })
        .catch((error) => {});
    }
  }

  insertImage(url: string): void {
    if (!this.quill) return;

    const range = this.savedRange || this.quill.getSelection(true);

    const index = range ? range.index : this.quill.getLength();

    this.quill.insertEmbed(index, 'image', url, 'user');
    this.quill.setSelection(index + 1, 0);
  }

  deleteSelectedImage(): void {
    if (this.quill && this.selectedImageIndex !== null) {
      // Get the image URL from the content
      const content = this.quill.getContents(this.selectedImageIndex, 1);
      if (
        content &&
        content.ops &&
        content.ops[0] &&
        content.ops[0].insert &&
        typeof content.ops[0].insert === 'object' &&
        'image' in content.ops[0].insert
      ) {
        const imageUrl = content.ops[0].insert['image'] as string;

        // Find and delete the image from server
        this.deleteImageFromServer(imageUrl);
      }

      this.quill.deleteText(this.selectedImageIndex, 1);
      this.selectedImageIndex = null;
      this.contentChange.emit(this.getContent());
    }
  }

  deleteAllImages(): void {
    if (this.quill) {
      // Get all image URLs before deleting
      const content = this.quill.root.innerHTML;
      const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/gi;
      const imageUrls: string[] = [];
      let match;
      while ((match = imgRegex.exec(content)) !== null) {
        imageUrls.push(match[1]);
      }

      // Delete all images from server
      imageUrls.forEach((url) => this.deleteImageFromServer(url));

      // Remove all images from editor
      const newContent = content.replace(/<img[^>]*>/gi, '');
      this.quill.root.innerHTML = newContent;
      this.content = newContent;
      this.contentChange.emit(newContent);
    }
  }

  hasImages(): boolean {
    if (this.quill) {
      const content = this.quill.root.innerHTML;
      const imgRegex = /<img[^>]*>/gi;
      return imgRegex.test(content);
    }
    return false;
  }

  private deleteImageFromServer(imageUrl: string): void {
    // Find the publicId from the uploaded images map
    for (const [publicId, url] of this.uploadedImages.entries()) {
      if (url === imageUrl) {
        this.fileService.deleteImage(publicId).subscribe({
          next: () => {
            this.uploadedImages.delete(publicId);
          },
          error: (error) => {this.error = 'Lỗi xóa ảnh: ' + (error.message || 'Không xác định');
          },
        });
        return;
      }
    }

    // If image not found in uploadedImages, it might be an external image
    console.warn('Image not found in uploaded images:', imageUrl);
  }

  getPreviewContent(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.getContent());
  }

  // Keyboard shortcuts
  onKeyDown(event: KeyboardEvent): void {
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.contentChange.emit(this.getContent());
    }
  }

  detectDeletedImages(oldDelta: any, newDelta: any): void {
    const oldImages = this.extractImages(oldDelta);
    const newImages = this.extractImages(newDelta);

    const deletedImages = oldImages.filter((img) => !newImages.includes(img));

    deletedImages.forEach((imgUrl) => {
      this.deleteImageFromServer(imgUrl);
    });
  }

  extractImages(delta: any): string[] {
    const images: string[] = [];

    if (!delta?.ops) return images;

    delta.ops.forEach((op: any) => {
      if (op.insert && typeof op.insert === 'object' && op.insert.image) {
        images.push(op.insert.image);
      }
    });

    return images;
  }
}
