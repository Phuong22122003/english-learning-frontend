import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Grammar } from '../../../models/grammar/grammar.model';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActivatedRoute, Router } from '@angular/router';
import { GrammarService } from '../../../services/GrammarService';

@Component({
  selector: 'app-grammar-detail',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './grammar-detail.component.html',
  styleUrl: './grammar-detail.component.scss',
})
export class GrammarDetailComponent {
  @Input({ required: true }) grammar!: Grammar;
  @Output() goBack = new EventEmitter<void>();
  faArrowLeft = faArrowLeft;
  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private grammarService: GrammarService
    ) {}
  ngOnInit(): void {
    if(this.grammar) return;
    const grammarId = this.route.snapshot.paramMap.get('grammarId')!;
    this.loadGrammarDetail(grammarId);
  }
  loadGrammarDetail(grammarId: string): void {
    this.grammarService.getGrammarById(grammarId).subscribe((data) => {
      this.grammar = data;
    });
  }
  onBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
