import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiMaintainerService } from '../services/ai-maintainer.service';
// FIX: Import BlockchainService to resolve type errors.
import { BlockchainService } from '../services/blockchain.service';

@Component({
  selector: 'app-ai-maintainer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-brand-heading">AI Blockchain Maintainer</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Status & Actions -->
        <div class="lg:col-span-1 space-y-6">
            <!-- Main Status -->
            <div class="bg-brand-surface p-6 rounded-lg text-center border border-brand-border">
                <h3 class="text-sm font-medium text-brand-muted">Overall Network Status</h3>
                <div class="my-4">
                    <div class="inline-flex items-center justify-center w-32 h-32 rounded-full"
                        [class.bg-green-500/10]="status() === 'Optimal' || status() === 'Stable'"
                        [class.bg-yellow-500/10]="status() === 'Congested'"
                        [class.bg-red-500/10]="status() === 'Critical'">
                        <div class="w-24 h-24 rounded-full flex items-center justify-center"
                            [class.bg-green-500/20]="status() === 'Optimal' || status() === 'Stable'"
                            [class.bg-yellow-500/20]="status() === 'Congested'"
                            [class.bg-red-500/20]="status() === 'Critical'">
                            <p class="text-2xl font-bold"
                                [class.text-green-400]="status() === 'Optimal' || status() === 'Stable'"
                                [class.text-yellow-400]="status() === 'Congested'"
                                [class.text-red-400]="status() === 'Critical'">
                                {{ status() }}
                            </p>
                        </div>
                    </div>
                </div>
                 @if (aiService.isScanning()) {
                    <p class="text-sm text-brand-accent animate-pulse">AI is scanning network...</p>
                 } @else {
                    <p class="text-sm text-brand-muted">All systems operational.</p>
                 }
            </div>

            <!-- Actions -->
            <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
                <h3 class="text-lg font-semibold mb-4 text-brand-heading">AI Controls</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between bg-brand-bg/50 p-3 rounded-md">
                        <label for="autonomous-toggle" class="font-medium text-brand-text">Autonomous Mode</label>
                        <button (click)="aiService.toggleAutonomousMode()"
                                class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                                [class.bg-brand-accent]="aiService.autonomousMode()"
                                [class.bg-brand-border]="!aiService.autonomousMode()">
                            <span class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform"
                                  [class.translate-x-6]="aiService.autonomousMode()"
                                  [class.translate-x-1]="!aiService.autonomousMode()"></span>
                        </button>
                    </div>
                    <button (click)="aiService.runManualScan()" [disabled]="aiService.isScanning()"
                            class="w-full bg-brand-accent text-brand-bg font-semibold px-4 py-3 rounded-md hover:bg-brand-accent-hover transition-colors disabled:bg-brand-border/50 disabled:cursor-wait">
                        {{ aiService.isScanning() ? 'Scanning...' : 'Run Diagnostic Scan' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Right Column: Metrics & Logs -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Live Metrics -->
            <div class="grid grid-cols-2 gap-6">
                 <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
                    <h3 class="text-sm font-medium text-brand-muted">Transaction Throughput</h3>
                    <p class="text-3xl font-semibold text-brand-heading">{{ tps() }} <span class="text-lg">TPS</span></p>
                </div>
                <div class="bg-brand-surface p-6 rounded-lg border border-brand-border">
                    <h3 class="text-sm font-medium text-brand-muted">Current Gas Price</h3>
                    <p class="text-3xl font-semibold text-brand-heading">{{ gasPrice() }} <span class="text-lg">gwei</span></p>
                </div>
            </div>

            <!-- Event Log -->
            <div class="bg-brand-surface rounded-lg border border-brand-border">
                <h3 class="text-lg font-semibold p-4 border-b border-brand-border text-brand-heading">AI Event Log</h3>
                <div class="h-96 overflow-y-auto p-4 space-y-3">
                    @for(log of logs(); track log.timestamp) {
                        <div class="flex items-start space-x-3 text-sm">
                            <span class="font-mono text-brand-muted/75">{{ log.timestamp | date:'HH:mm:ss' }}</span>
                            <p class="flex-1" [class.text-green-400]="log.type === 'success'"
                                [class.text-yellow-400]="log.type === 'warning'"
                                [class.text-red-400]="log.type === 'error'"
                                [class.text-brand-text]="log.type === 'info'">
                                {{ log.message }}
                            </p>
                        </div>
                    } @empty {
                         <p class="text-center text-brand-muted pt-16">No AI events logged yet.</p>
                    }
                </div>
            </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiMaintainerComponent {
  aiService = inject(AiMaintainerService);
  private blockchainService = inject(BlockchainService);

  status = this.aiService.networkStatus;
  logs = this.aiService.logMessages;
  tps = this.aiService.transactionPerSecond;
  gasPrice = this.blockchainService.gasPrice;
}