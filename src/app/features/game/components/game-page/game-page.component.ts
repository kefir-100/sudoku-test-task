import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SudokuGameService } from '../../services/sudoku-game.service';
import { SudokuBoardComponent } from '../sudoku-board/sudoku-board.component';
import { DifficultySelectorComponent } from '../difficulty-selector/difficulty-selector.component';
import { GameControlsComponent } from '../game-controls/game-controls.component';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ErrorStateComponent } from '../error-state/error-state.component';
import { NumpadComponent } from '../numpad/numpad.component';
import { GameDifficultyLevel } from '../../../../models/game-difficulty-level';
import { GameStatus } from '../../../../models/game-status';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [
    SudokuBoardComponent,
    DifficultySelectorComponent,
    GameControlsComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    NumpadComponent,
  ],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePageComponent implements OnInit {
  protected readonly gameService = inject(SudokuGameService);
  protected readonly GameStatus = GameStatus;
  selectedDifficulty: GameDifficultyLevel = GameDifficultyLevel.Random;

  ngOnInit(): void {
    this.gameService.restoreFromStorage();
  }

  onDifficultyChanged(value: GameDifficultyLevel): void {
    this.selectedDifficulty = value;
  }

  onStartGame(): void {
    this.gameService.startGame(this.selectedDifficulty);
  }

  onDigitEntered(payload: { cellId: number; digit: number }): void {
    this.gameService.enterDigit(payload.cellId, payload.digit);
  }

  onCellCleared(cellId: number): void {
    this.gameService.clearCell(cellId);
  }

  onCellFocused(cellId: number): void {
    this.gameService.focusCell(cellId);
  }

  onNumpadDigit(digit: number): void {
    const cellId = this.gameService.focusedCellId();
    if (cellId === null) {
      return;
    }
    this.gameService.enterDigit(cellId, digit);
  }

  onNumpadClear(): void {
    const cellId = this.gameService.focusedCellId();
    if (cellId === null) {
      return;
    }
    this.gameService.clearCell(cellId);
  }

  onValidate(): void {
    this.gameService.validate();
  }

  onSolve(): void {
    this.gameService.solve();
  }
}
