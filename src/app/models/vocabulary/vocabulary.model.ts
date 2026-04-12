export interface Vocabulary {
  id: string;
  topicId: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  audioUrl: string;
  imageUrl: string;
  imageName?: string;
  audioName?: string;
  imageFile?: File;
  audioFile?: File;
  createdAt: string;
  exampleMeaning: string;
}
