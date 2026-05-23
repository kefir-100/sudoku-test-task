import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-game-confirm-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './new-game-confirm-dialog.component.html',
  styleUrl: './new-game-confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewGameConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<NewGameConfirmDialogComponent, boolean>);

  onClickClose(isConfirmed: boolean): void {
    this.dialogRef.close(isConfirmed);
  }
}
