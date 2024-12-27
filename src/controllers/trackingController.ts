import { Request, Response } from 'express';
import { fetchTrackingData } from '../utils/trackingUtils';
import { log } from '../utils/logger';

function isValidTrackingNumber(trackingNo: string): boolean {
  // Poslaju tracking numbers are typically 13 characters long
  // and start with 2 or 3 letters followed by 9 or 8 digits respectively, and ending with 'MY'
  const regex = /^[A-Z]{2,3}\d{8,9}MY$/;
  return regex.test(trackingNo);
}

export async function trackParcel(req: Request, res: Response) {
  const trackingNo = req.params.trackingNo;
  log(`Received request to track parcel: ${trackingNo}`);

  if (!isValidTrackingNumber(trackingNo)) {
    log('Invalid tracking number', { trackingNo });
    return res.status(400).json({
      status: 'error',
      message: 'Invalid tracking number format. It should be 13 characters long, start with 2 letters, followed by 9 digits, and end with MY.',
    });
  }

  try {
    const data = await fetchTrackingData(trackingNo);
    log('Tracking data fetched successfully', { data });
    res.json({
      status: 'success',
      message: 'Results successfully retrieved',
      data,
    });
  } catch (error) {
    log('Error in trackParcel', { error: error instanceof Error ? error.message : 'Unknown error' });
    if (error instanceof Error && error.message === 'Tracking information not found') {
      res.status(404).json({
        status: 'error',
        message: 'Tracking information not found. Please check the tracking number and try again.',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while retrieving the tracking information. Please try again later.',
      });
    }
  }
}

