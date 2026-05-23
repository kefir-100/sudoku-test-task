import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { APP_CONFIG } from '../../../../core/config/app-config';
import { GameDifficultyLevel } from '../../../../models/game-difficulty-level';

@Component({
  selector: 'app-difficulty-selector',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './difficulty-selector.component.html',
  styleUrl: './difficulty-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DifficultySelectorComponent {
  readonly disabled = input.required<boolean>();
  readonly difficultyChanged = output<GameDifficultyLevel>();
  readonly options = APP_CONFIG.difficulties;
  readonly selected = signal<GameDifficultyLevel>(GameDifficultyLevel.Random);

  onSelectionChange(value: GameDifficultyLevel): void {
    this.selected.set(value);
    this.difficultyChanged.emit(value);
  }
}
