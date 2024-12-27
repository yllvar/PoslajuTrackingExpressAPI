import { CONFIG } from '../config';

export function log(message: string, data?: any) {
  if (CONFIG.DEBUG) {
    console.log(`[DEBUG] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

