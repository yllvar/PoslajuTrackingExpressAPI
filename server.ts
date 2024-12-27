import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/track/:trackingNo', async (req, res) => {
  const trackingNo = req.params.trackingNo;

  try {
    const response = await axios.get(`https://track.pos.com.my/postal-services/quick-access/?track-trace=${trackingNo}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const data: any = {
      status: 'success',
      message: 'Results successfully retrieved',
      data: {
        trackingNo: trackingNo,
        trackingStatus: $('.status-label').text().trim(),
        trackingEvents: [],
      },
    };

    // Extract date time
    const dateTime = $('.date-time').text().trim().split(',');
    data.data.date = dateTime[0].trim();
    data.data.time = dateTime[1].trim();

    // Extract tracking events
    $('.table-track tbody tr').each((i, elem) => {
      const date = $(elem).find('td').eq(0).text().trim();
      const time = $(elem).find('td').eq(1).text().trim();
      const process = $(elem).find('td').eq(2).text().trim();
      const event = $(elem).find('td').eq(3).text().trim();

      data.data.trackingEvents.push({
        date,
        time,
        process,
        event,
      });
    });

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving results',
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

