import express from 'express';
import { trackParcel } from '../controllers/trackingController';

const router = express.Router();

/**
 * @swagger
 * /track/{trackingNo}:
 *   get:
 *     summary: Track a Poslaju parcel
 *     parameters:
 *       - in: path
 *         name: trackingNo
 *         required: true
 *         description: Poslaju tracking number
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tracking information retrieved successfully
 *       400:
 *         description: Invalid tracking number format
 *       404:
 *         description: Tracking information not found
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.get('/:trackingNo', trackParcel);

export default router;

