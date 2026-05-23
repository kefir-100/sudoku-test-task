import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { NewGameConfirmDialogComponent } from '../new-game-confirm-dialog/new-game-confirm-dialog.component';

@Component({
  selector: 'app-game-controls',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './game-controls.component.html',
  styleUrl: './game-controls.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameControlsComponent {
  private readonly dialog = inject(MatDialog);

  readonly isGameInProgress = input.required<boolean>();
  readonly hasUserEntries = input.required<boolean>();
  readonly canValidate = input.required<boolean>();
  readonly canSolve = input.required<boolean>();
  readonly isLoading = input.required<boolean>();

  readonly startGame = output<void>();
  readonly validate = output<void>();
  readonly solve = output<void>();

  async onStartClicked(): Promise<void> {
    if (this.hasUserEntries()) {
      const dialogRef = this.dialog.open<NewGameConfirmDialogComponent, void, boolean>(
        NewGameConfirmDialogComponent,
      );
      const result = await firstValueFrom(dialogRef.afterClosed());
      if (result !== true) {
        return;
      }
    }
    this.startGame.emit();
  }
}
