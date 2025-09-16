import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalDetails {
  key: string;
  value: string | number;
}

export interface ModalConfig {
  title: string;
  details: ModalDetails[];
  fee: number;
  confirmButtonText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  isOpen = signal(false);
  config = signal<ModalConfig | null>(null);

  private action = new Subject<boolean>();
  action$ = this.action.asObservable();

  open(config: ModalConfig): void {
    this.config.set(config);
    this.isOpen.set(true);
  }

  confirm(): void {
    if (this.isOpen()) {
      this.action.next(true);
      this.close();
    }
  }

  cancel(): void {
    if (this.isOpen()) {
      this.action.next(false);
      this.close();
    }
  }

  private close(): void {
    this.isOpen.set(false);
    this.config.set(null);
  }
}
