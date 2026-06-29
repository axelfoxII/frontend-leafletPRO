import { Component, input, output } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast toast-top toast-end z-50">
      <div
        class="alert cursor-pointer"
        [class.alert-success]="type() === 'success'"
        [class.alert-error]="type() === 'error'"
        [class.alert-warning]="type() === 'warning'"
        [class.alert-info]="type() === 'info'"
        (click)="dismissed.emit()"
      >
        <span>{{ message() }}</span>
      </div>
    </div>
  `,
})
export class ToastComponent {
  readonly message = input.required<string>();
  readonly type = input<ToastType>('info');
  readonly dismissed = output<void>();
}
