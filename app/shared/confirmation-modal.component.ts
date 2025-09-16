import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (modalService.isOpen(); as isOpen) {
      <div class="fixed inset-0 bg-brand-bg/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in" (click)="modalService.cancel()">
        @if (modalService.config(); as config) {
          <div class="bg-brand-surface rounded-lg shadow-2xl border border-brand-border w-full max-w-md m-4" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="p-5 border-b border-brand-border">
              <h2 class="text-xl font-bold text-brand-heading">{{ config.title }}</h2>
            </div>
            
            <!-- Body -->
            <div class="p-6 space-y-4">
              <p class="text-sm text-brand-text">Please review and confirm the details below before proceeding.</p>
              <div class="bg-brand-bg/50 p-4 rounded-md border border-brand-border space-y-3">
                @for(detail of config.details; track detail.key) {
                  <div class="flex justify-between items-start">
                    <span class="text-brand-muted font-medium">{{ detail.key }}:</span>
                    <span class="text-right font-mono text-brand-accent break-all">{{ detail.value }}</span>
                  </div>
                }
                 <div class="flex justify-between items-start pt-3 border-t border-brand-border/50">
                    <span class="text-brand-muted font-medium">Estimated Fee:</span>
                    <span class="text-right font-mono text-brand-text">{{ config.fee | number:'1.0-4' }} AENZ</span>
                  </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-5 bg-brand-surface/50 flex justify-end items-center space-x-4 rounded-b-lg">
              <button (click)="modalService.cancel()" class="px-5 py-2 rounded-md bg-brand-border hover:bg-brand-border/70 transition-colors">
                Cancel
              </button>
              <button (click)="modalService.confirm()" class="px-5 py-2 rounded-md bg-brand-accent text-brand-bg hover:bg-brand-accent-hover transition-colors font-semibold">
                {{ config.confirmButtonText ?? 'Confirm' }}
              </button>
            </div>
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModalComponent {
  modalService = inject(ModalService);
}