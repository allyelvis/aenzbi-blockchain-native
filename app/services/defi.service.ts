import { Injectable, OnDestroy, signal, inject } from '@angular/core';
import { BlockchainService } from './blockchain.service';

@Injectable({
  providedIn: 'root',
})
export class DeFiService implements OnDestroy {
  private blockchainService = inject(BlockchainService);

  readonly stakedBalance = signal(0);
  readonly rewards = signal(0);
  readonly apy = signal(8.5); // 8.5% APY

  private rewardInterval: any;

  constructor() {
    this.rewardInterval = setInterval(() => {
      const currentStaked = this.stakedBalance();
      if (currentStaked > 0) {
        // (Principal * (APY / 100)) / seconds_in_a_year
        const rewardsPerSecond = (currentStaked * (this.apy() / 100)) / 31_536_000;
        // Accrue rewards for 3-second interval
        const rewardsThisTick = rewardsPerSecond * 3;
        this.rewards.update((r) => r + rewardsThisTick);
      }
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.rewardInterval) {
      clearInterval(this.rewardInterval);
    }
  }

  stake(amount: number): { success: boolean; message: string } {
    if (amount <= 0) {
      return { success: false, message: 'Amount to stake must be positive.' };
    }
    const fee = this.blockchainService.gasPrice() * 0.00005;
    const totalCost = amount + fee;

    if (this.blockchainService.wallet().balance < totalCost) {
      return { success: false, message: 'Insufficient balance for stake + fee.' };
    }

    const success = this.blockchainService.executeDeFiTransaction('stake', amount, fee);
    if (success) {
      this.stakedBalance.update((s) => s + amount);
      return { success: true, message: `${amount.toLocaleString()} AENZ staked successfully.` };
    }
    return { success: false, message: 'Staking transaction failed.' };
  }

  unstake(amount: number): { success: boolean; message: string } {
     if (amount <= 0) {
      return { success: false, message: 'Amount to unstake must be positive.' };
    }
    if (amount > this.stakedBalance()) {
        return { success: false, message: 'Cannot unstake more than you have staked.' };
    }
    const fee = this.blockchainService.gasPrice() * 0.00005;

    if (this.blockchainService.wallet().balance < fee) {
      return { success: false, message: 'Insufficient balance for unstaking fee.' };
    }

    const success = this.blockchainService.executeDeFiTransaction('unstake', amount, fee);
     if (success) {
      this.stakedBalance.update((s) => s - amount);
      return { success: true, message: `${amount.toLocaleString()} AENZ unstaked successfully.` };
    }
    return { success: false, message: 'Unstaking transaction failed.' };
  }

  claimRewards(): { success: boolean; message: string } {
    const rewardsToClaim = this.rewards();
    if (rewardsToClaim <= 0) {
        return { success: false, message: 'No rewards to claim.' };
    }
    const fee = this.blockchainService.gasPrice() * 0.00005;

    if (this.blockchainService.wallet().balance < fee) {
      return { success: false, message: 'Insufficient balance for claim fee.' };
    }
    
    const success = this.blockchainService.executeDeFiTransaction('claim_rewards', rewardsToClaim, fee);
    if (success) {
      this.rewards.set(0);
      return { success: true, message: `Successfully claimed ${rewardsToClaim.toFixed(6)} AENZ.` };
    }
    return { success: false, message: 'Claim rewards transaction failed.' };
  }
}
