const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const axios = require("axios");
require("dotenv").config();

// ------------------------------
// Send WhatsApp Template Message
// ------------------------------
async function sendWhatsAppTemplate(to) {
  try {
    // The video must be hosted on a public URL and be in MP4 format.
    const videoUrl = "https://art-cairo-2.onrender.com/18925.mp4";

    await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: "video_template", // ✅ Your new, approved video template name
          language: { code: "en" },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "video",
                  video: {
                    link: videoUrl, // ✅ Link to your publicly hosted video
                  },
                },
              ],
            },
            // No body component is needed if the body has no variables
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Video template sent to ${to}`);
  } catch (error) {
    console.error(
      `❌ Failed to send video template to ${to}:`,
      error.response?.data || error.message
    );
  }
}
// ------------------------------
// Bulk sender
// ------------------------------
function sendBulkMessages() {
  const csvFile = path.join(__dirname, "recipients.csv");

  fs.createReadStream(csvFile)
    .pipe(csv())
    .on("data", async (row) => {
      // Correctly read the phone number from the 'number' column
      const phone = row.number?.trim();
      
      if (phone) {
        console.log(`📤 Sending template to ${phone}`);
        // Only pass the phone number, as required
        await sendWhatsAppTemplate(phone);
      }
    })
    .on("end", () => {
      console.log("✅ All messages processed");
    });
}

// Run
sendBulkMessages();
