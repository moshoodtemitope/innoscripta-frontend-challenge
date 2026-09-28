import type { ProviderId } from '../../domain/article';
import type { INewsAdapter } from './baseAdapter';
import { BbcAdapter } from './bbcAdapter';
import { GuardianAdapter } from './guardianAdapter';
import { NytAdapter } from './nytAdapter';
import { NewsApiAdapter } from './newsApiAdapter';

export { BaseAdapter } from './baseAdapter';
export type { INewsAdapter } from './baseAdapter';
export { BbcAdapter } from './bbcAdapter';
export { GuardianAdapter } from './guardianAdapter';
export { NytAdapter } from './nytAdapter';
export { NewsApiAdapter } from './newsApiAdapter';

export class AdapterRegistry {
  private static adapterFactories: Record<ProviderId, () => INewsAdapter> = {
    bbc: () => new BbcAdapter(),
    guardian: () => new GuardianAdapter(),
    nyt: () => new NytAdapter(),
    newsapi: () => new NewsApiAdapter()
  };

  static getAdapter(id: ProviderId): INewsAdapter | undefined {
    const factory = this.adapterFactories[id];
    return factory ? factory() : undefined;
  }

  static getActiveAdapters(selectedIds?: ProviderId[]): INewsAdapter[] {
    if (!selectedIds || selectedIds.length === 0) {
      return Object.values(this.adapterFactories).map(factory => factory());
    }
    return selectedIds
      .map(id => this.getAdapter(id))
      .filter((adapter): adapter is INewsAdapter => adapter !== undefined);
  }
}
