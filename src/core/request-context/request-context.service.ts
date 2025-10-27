import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

@Injectable()
export class RequestContext {
  private asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

  run(context: Map<string, any>, callback: () => void) {
    this.asyncLocalStorage.run(context, () => {
      callback();
    });
  }

  set(key: string, value: any) {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  get(key: string): any {
    const store = this.asyncLocalStorage.getStore();
    return store ? store.get(key) : null;
  }

  clear(){
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store.clear();
    }
  }
}
