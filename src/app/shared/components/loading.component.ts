import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      @if (message()) {
        <p class="text-base-content/60 text-sm">{{ message() }}</p>
      }
    </div>
  `,
})
export class LoadingComponent {
  readonly message = input<string>();
}
