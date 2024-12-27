class InactiveTrackingNumberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InactiveTrackingNumberError';
  }
}

import axios from 'axios';
import * as cheerio from 'cheerio';
import { CONFIG } from '../config';
import { log } from './logger';

interface TrackingEvent {
  date: string;
  time: string;
  process: string;
  event: string;
}

interface TrackingData {
  trackingNo: string;
  trackingStatus: string;
  date: string;
  time: string;
  trackingEvents: TrackingEvent[];
}

export async function fetchTrackingData(trackingNo: string): Promise<TrackingData> {
  let retries = 0;
  while (retries < CONFIG.MAX_RETRIES) {
    try {
      log(`Attempting to fetch data for tracking number: ${trackingNo}`);
      const response = await axios.get(`${CONFIG.POSLAJU_URL}?track-trace=${trackingNo}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      log('Response received', { status: response.status, headers: response.headers });

      const html = response.data;
      const $ = cheerio.load(html);

      log('HTML loaded with Cheerio');

      const trackingStatus = $('.status-label').text().trim();
      log('Tracking status', { trackingStatus });

      if (!trackingStatus) {
        throw new Error('Tracking information not found');
      }

      if (trackingStatus.toLowerCase().includes('no record')) {
        throw new InactiveTrackingNumberError('The tracking number is not active or has no records.');
      }

      const dateTime = $('.date-time').text().trim().split(',');
      log('Date and time', { dateTime });

      const trackingEvents: TrackingEvent[] = [];

      $('.table-track tbody tr').each((i, elem) => {
        const event = {
          date: $(elem).find('td').eq(0).text().trim(),
          time: $(elem).find('td').eq(1).text().trim(),
          process: $(elem).find('td').eq(2).text().trim(),
          event: $(elem).find('td').eq(3).text().trim(),
        };
        trackingEvents.push(event);
      });

      log('Tracking events', { trackingEvents });

      return {
        trackingNo,
        trackingStatus,
        date: dateTime[0].trim(),
        time: dateTime[1].trim(),
        trackingEvents,
      };
    } catch (error) {
      log(`Attempt ${retries + 1} failed`, { error: error instanceof Error ? error.message : 'Unknown error' });
      retries++;
      if (retries < CONFIG.MAX_RETRIES) {
        log(`Retrying in ${CONFIG.RETRY_DELAY}ms`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      } else {
        log('Max retries reached');
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
}

