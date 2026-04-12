import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PronunciationResponse,
  DetailScore,
} from '../../models/response/pronunciation-response.model';
import { PronunciationRequest } from '../../models/request/pronunciation-request.model';
import { GetPronunciationResponse } from '../../models/response/get-pronunciation-response.model';
import { AgentService } from '../../services/AgentService';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pronunciation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pronunciation.component.html',
  styleUrl: './pronunciation.component.scss',
})
export class PronunciationComponent implements OnInit {
  textToPronounce = '';
  isRecording = false;
  isProcessing = false;
  isGettingPronunciation = false;
  pronunciationResult: PronunciationResponse | null = null;
  audioBlob: Blob | null = null;
  audioUrl: string | null = null;
  referenceAudio: GetPronunciationResponse | null = null;
  referenceAudioUrl: string | null = null;
  isPlayingReference = false;
  maxDurationAudio = 0;
  minDurationAudio = environment.PADDING_MIN_TIME;
  isValidAudio = true;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private referenceAudioElement: HTMLAudioElement | null = null;

  constructor(private agentService: AgentService) {}

  ngOnInit(): void {}

  getReferencePronunciation() {
    if (!this.textToPronounce.trim()) {
      alert('Please enter text to get standard pronunciation');
      return;
    }

    this.isGettingPronunciation = true;
    this.referenceAudio = null;
    if (this.referenceAudioUrl) {
      URL.revokeObjectURL(this.referenceAudioUrl);
      this.referenceAudioUrl = null;
    }

    this.agentService.getPronunciation(this.textToPronounce).subscribe({
      next: (response: GetPronunciationResponse) => {
        this.referenceAudio = response;
        this.createReferenceAudioFromBase64(response.audio_base64);
        this.isGettingPronunciation = false;
      },
      error: (error) => {
this.isGettingPronunciation = false;
        alert('Error getting standard pronunciation. Please try again.');
      },
    });
  }

  private createReferenceAudioFromBase64(base64Audio: string) {
    try {
      // Remove data URL prefix if present
      const base64Data = base64Audio.includes(',')
        ? base64Audio.split(',')[1]
        : base64Audio;

      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const audioBlob = new Blob([byteArray], { type: 'audio/wav' });

      // Create object URL
      this.referenceAudioUrl = URL.createObjectURL(audioBlob);

      // Create audio element
      this.referenceAudioElement = new Audio(this.referenceAudioUrl);
      this.referenceAudioElement.onloadedmetadata = () => {

        this.maxDurationAudio =
          (this.referenceAudioElement?.duration || 0) +
          environment.PADDING_MAX_TIME;
      };
      this.referenceAudioElement.onended = () => {
        this.isPlayingReference = false;
      };
      this.referenceAudioElement.onerror = () => {
        this.isPlayingReference = false;
};
    } catch (error) {
this.isGettingPronunciation = false;
    }
  }

  playReferenceAudio() {
    if (this.referenceAudioElement && !this.isPlayingReference) {
      this.isPlayingReference = true;
      this.referenceAudioElement.play().catch((error) => {
this.isPlayingReference = false;
      });
    }
  }

  stopReferenceAudio() {
    if (this.referenceAudioElement && this.isPlayingReference) {
      this.referenceAudioElement.pause();
      this.referenceAudioElement.currentTime = 0;
      this.isPlayingReference = false;
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioUrl = URL.createObjectURL(this.audioBlob);

        const audio = new Audio(this.audioUrl);
        audio.onloadedmetadata = () => {
          const recordedDuration = audio.duration;

          if (recordedDuration < this.minDurationAudio) {
            // Clear data
            this.audioBlob = null!;
            this.audioChunks = [];
            URL.revokeObjectURL(this.audioUrl!);
            this.audioUrl = null;

            // Notify user
            alert(
              'Audio too short (< ' +
                this.minDurationAudio +
                ' seconds). Please record again.'
            );

            this.isRecording = false;
            this.isProcessing = false;
            this.isValidAudio = false;
            return;
          }

          if (recordedDuration > this.maxDurationAudio) {
            this.audioBlob = null!;
            this.audioChunks = [];
            URL.revokeObjectURL(this.audioUrl!);
            this.audioUrl = null;
            alert(
              'Audio too long (> ' +
                this.maxDurationAudio +
                ' seconds). Please record again.'
            );
            this.isRecording = false;
            this.isProcessing = false;
            this.isValidAudio = false;
            return;
          }
          this.isValidAudio = true;
        };

        // Stop stream
        stream.getTracks().forEach((track) => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.pronunciationResult = null;
      this.audioBlob = null;
      if (this.audioUrl) {
        URL.revokeObjectURL(this.audioUrl);
        this.audioUrl = null;
      }

    } catch (error) {
alert('Error accessing microphone. Please check your permissions.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isProcessing = true;

      // Process pronunciation after a short delay to ensure audio is ready
      setTimeout(() => {
        this.processPronunciation();
      }, 1000);
    }
  }

  processPronunciation() {
    if (!this.isValidAudio) {
      return;
    }
    if (!this.textToPronounce.trim()) {
      this.isProcessing = false;
      alert('Please enter text to pronounce');
      return;
    }

    // Call API to evaluate pronunciation
    const audioFile = new File([this.audioBlob!], 'recording.wav', {
      type: 'audio/wav',
    });
    const request: PronunciationRequest = {
      text: this.textToPronounce,
      file: audioFile,
    };

    this.agentService.pronounce(request).subscribe({
      next: (response: PronunciationResponse) => {
        this.pronunciationResult = response;
        this.isProcessing = false;
      },
      error: (error) => {
this.isProcessing = false;
        alert('Error evaluating pronunciation. Please try again.');
      },
    });
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }

  getScoreText(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  }

  getOverallScoreColor(score: number): string {
    if (score >= 80) return 'text-green-700 bg-green-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-200';
    return 'text-red-700 bg-red-200';
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getObjectValues(obj: any): number[] {
    return Object.values(obj);
  }

  getWordAccuracyColor(score: number): string {
    if (score >= 80) return 'text-green-600 ';
    if (score >= 60) return 'text-yellow-600 ';
    return 'text-red-600';
  }

  getWordAccuracyBorder(score: number): string {
    if (score >= 80) return 'border-green-300';
    if (score >= 60) return 'border-yellow-300';
    return 'border-red-300';
  }

  getWordAccuracyText(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Practice';
  }

  getWordsWithScores(): Array<{
    word: string;
    score: number;
    color: string;
    border: string;
    text: string;
  }> {
    if (!this.pronunciationResult || !this.pronunciationResult.detail_scores) {
      return [];
    }

    const words = this.textToPronounce.split(' ');
    const result: Array<{
      word: string;
      score: number;
      color: string;
      border: string;
      text: string;
    }> = [];

    words.forEach((word, index) => {
      if (index < this.pronunciationResult!.detail_scores.length) {
        const detailScore = this.pronunciationResult!.detail_scores[index];
        const score = Object.values(detailScore)[0] || 0;

        result.push({
          word: word,
          score: score,
          color: this.getWordAccuracyColor(score),
          border: this.getWordAccuracyBorder(score),
          text: this.getWordAccuracyText(score),
        });
      } else {
        result.push({
          word: word,
          score: 0,
          color: 'text-gray-600 bg-gray-100',
          border: 'border-gray-300',
          text: 'No Score',
        });
      }
    });

    return result;
  }

  getPhoneticWithScores(): Array<{
    word: string;
    score: number;
    color: string;
    border: string;
    text: string;
  }> {
    if (!this.pronunciationResult || !this.pronunciationResult.detail_scores) {
      return [];
    }
    const result: Array<{
      word: string;
      score: number;
      color: string;
      border: string;
      text: string;
    }> = [];

    this.pronunciationResult!.detail_scores.forEach((key, value, index) => {
      result.push({
        word: Object.keys(key)[0],
        score: Object.values(key)[0],
        color: this.getWordAccuracyColor(Object.values(key)[0]),
        border: this.getWordAccuracyBorder(Object.values(key)[0]),
        text: this.getWordAccuracyText(Object.values(key)[0]),
      });
    });
    return result;
  }

  getWordStatistics(): {
    excellent: number;
    good: number;
    needsPractice: number;
    total: number;
  } {
    const words = this.getPhoneticWithScores().filter((word) =>
      word.word.trim()
    );
    const stats = {
      excellent: 0,
      good: 0,
      needsPractice: 0,
      total: words.length,
    };

    words.forEach((word) => {
      if (word.score >= 80) {
        stats.excellent++;
      } else if (word.score >= 60) {
        stats.good++;
      } else {
        stats.needsPractice++;
      }
    });

    return stats;
  }

  resetForm() {
    this.textToPronounce = '';
    this.pronunciationResult = null;
    this.audioBlob = null;
    this.referenceAudio = null;
    this.isGettingPronunciation = false;
    this.isPlayingReference = false;

    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }

    if (this.referenceAudioUrl) {
      URL.revokeObjectURL(this.referenceAudioUrl);
      this.referenceAudioUrl = null;
    }

    if (this.referenceAudioElement) {
      this.referenceAudioElement.pause();
      this.referenceAudioElement = null;
    }
  }
}
