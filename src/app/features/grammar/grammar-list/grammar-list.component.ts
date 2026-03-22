import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GrammarService } from '../../../services/GrammarService';
import { Grammar } from '../../../models/grammar/grammar.model';
import { GrammarDetailComponent } from '../grammar-detail/grammar-detail.component';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-grammar-list',
  standalone: true,
  imports: [CommonModule, GrammarDetailComponent, FontAwesomeModule],
  templateUrl: './grammar-list.component.html',
})
export class GrammarListComponent implements OnInit {
  grammars: Grammar[] = [];
  topicId!: string;
  title = 'Grammar List';
  faArrowLeft = faArrowLeft;
  selectedGrammar: Grammar | null = null;

  constructor(
    private grammarService: GrammarService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.topicId = this.route.snapshot.paramMap.get('topicId')!;
    this.grammarService.getGrammarsByTopicId(this.topicId).subscribe({
      next: (data) => {
        this.grammars = data.grammars;
        this.title = data.name;
      },
    });
  }

  onLearn(grammar: Grammar) {
    this.selectedGrammar = grammar;
  }

  onBack() {
    this.selectedGrammar = null;
  }
  onTest(grammarId: string) {
    this.router.navigate(['./', grammarId], { relativeTo: this.route });
  }
  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
