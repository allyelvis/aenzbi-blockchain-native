import { Injectable, signal, inject, computed, OnDestroy } from '@angular/core';
import { BlockchainService } from './blockchain.service';

export type NetworkStatus = 'Optimal' | 'Stable' | 'Congested' | 'Critical';
export interface AiLog {
    timestamp: number;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
}

@Injectable({
    providedIn: 'root',
})
export class AiMaintainerService implements OnDestroy {
    private blockchainService = inject(BlockchainService);

    readonly networkStatus = signal<NetworkStatus>('Stable');
    readonly logMessages = signal<AiLog[]>([]);
    readonly transactionPerSecond = signal(0);
    readonly autonomousMode = signal(true);
    readonly isScanning = signal(false);

    private scanInterval: any;

    constructor() {
        this.log('AI Maintainer Initialized. Starting autonomous monitoring...', 'success');
        this.start();
    }

    ngOnDestroy(): void {
        this.stop();
    }

    start(): void {
        if (this.scanInterval) return;
        this.scanInterval = setInterval(() => {
            if (this.autonomousMode()) {
                this.runScan();
            }
        }, 7000); // Scan every 7 seconds
    }

    stop(): void {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
            this.log('AI autonomous mode stopped.', 'warning');
        }
    }

    toggleAutonomousMode(): void {
        this.autonomousMode.update(enabled => !enabled);
        if (this.autonomousMode()) {
            this.log('Autonomous mode ENABLED.', 'success');
            this.start();
        } else {
            this.log('Autonomous mode DISABLED.', 'warning');
            this.stop();
        }
    }

    runManualScan(): void {
        this.log('Manual network diagnostic initiated...', 'info');
        this.runScan();
    }

    private runScan(): void {
        if (this.isScanning()) return;
        this.isScanning.set(true);

        setTimeout(() => {
            try {
                // 1. Calculate TPS
                const latestBlocks = this.blockchainService.blocks().slice(0, 2);
                if (latestBlocks.length < 2) {
                    this.isScanning.set(false);
                    return;
                }
                const txCount = latestBlocks[0].transactions.length;
                const timeDiff = (latestBlocks[0].timestamp - latestBlocks[1].timestamp) / 1000;
                const tps = timeDiff > 0 ? txCount / timeDiff : 0;
                this.transactionPerSecond.set(parseFloat(tps.toFixed(2)));

                // 2. Determine Network Status & Adjust Gas
                this.updateStatusAndGas(tps);

                // 3. Anomaly Detection (Mock)
                this.detectAnomalies();

                this.log(`Scan complete. TPS: ${this.transactionPerSecond()}. Gas Price: ${this.blockchainService.gasPrice()} gwei.`, 'info');

            } catch (e) {
                this.log('An error occurred during network scan.', 'error');
            } finally {
                this.isScanning.set(false);
            }
        }, 1500); // Simulate scan duration
    }

    private updateStatusAndGas(tps: number): void {
        const gas = this.blockchainService.gasPrice;
        if (tps > 2.5) {
            this.networkStatus.set('Critical');
            gas.update(g => Math.min(g + 15, 200));
            this.log('High network congestion detected! Increasing gas price.', 'error');
        } else if (tps > 1) {
            this.networkStatus.set('Congested');
            gas.update(g => Math.min(g + 5, 200));
            this.log('Network is congested. Increasing gas price.', 'warning');
        } else if (tps > 0.5) {
            this.networkStatus.set('Stable');
             gas.update(g => Math.max(g - 1, 10)); // Slowly decrease
        } else {
            this.networkStatus.set('Optimal');
            gas.update(g => Math.max(g - 3, 10));
        }
    }

    private detectAnomalies(): void {
         const allTxs = this.blockchainService.transactions().slice(0, 20);
         const highValueTx = allTxs.find(tx => tx.amount > 95);
         if (highValueTx && Math.random() > 0.7) {
            this.log(`Anomaly: High value transaction (${highValueTx.amount} AENZ) detected. Hash: ${highValueTx.hash.substring(0, 20)}...`, 'warning');
         }
    }

    private log(message: string, type: AiLog['type']): void {
        const newLog: AiLog = { timestamp: Date.now(), message, type };
        this.logMessages.update(logs => [newLog, ...logs.slice(0, 49)]);
    }
}
