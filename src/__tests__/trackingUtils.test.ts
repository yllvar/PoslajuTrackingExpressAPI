import { fetchTrackingData } from '../utils/trackingUtils';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchTrackingData', () => {
  it('should fetch and parse tracking data correctly', async () => {
    const mockHtml = `
      <div class="status-label">In Transit</div>
      <div class="date-time">2023-05-01, 10:00 AM</div>
      <table class="table-track">
        <tbody>
          <tr>
            <td>2023-05-01</td>
            <td>10:00 AM</td>
            <td>Process</td>
            <td>Item processed</td>
          </tr>
        </tbody>
      </table>
    `;

    mockedAxios.get.mockResolvedValue({ data: mockHtml });

    const result = await fetchTrackingData('TEST123');

    expect(result).toEqual({
      trackingNo: 'TEST123',
      trackingStatus: 'In Transit',
      date: '2023-05-01',
      time: '10:00 AM',
      trackingEvents: [
        {
          date: '2023-05-01',
          time: '10:00 AM',
          process: 'Process',
          event: 'Item processed',
        },
      ],
    });
  });

  it('should throw an error if tracking information is not found', async () => {
    const mockHtml = '<div>No tracking information found</div>';

    mockedAxios.get.mockResolvedValue({ data: mockHtml });

    await expect(fetchTrackingData('TEST123')).rejects.toThrow('Tracking information not found');
  });
});

