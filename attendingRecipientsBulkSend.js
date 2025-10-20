const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const axios = require("axios");
require("dotenv").config();

// ------------------------------
// Send WhatsApp QR Reminder using a TEMPLATE
// ------------------------------
async function sendWhatsAppReminder(to) {
  try {
    // Generate a unique QR code for each recipient's number
    const qrData = `T${to}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      qrData
    )}`;

    await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: "attending_reminder2",
          language: {
            code: "en",
          },
          components: [
            // This part is for the dynamic image in your header
            {
              type: "header",
              parameters: [
                {
                  type: "image",
                  image: {
                    link: qrUrl, // The URL for your dynamic QR code image
                  },
                },
              ],
            },
            // The body component is part of the template itself on WhatsApp Manager
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

    console.log(`✅ Reminder sent to ${to}`);
  } catch (error) {
    console.error(
      `❌ Failed to send reminder to ${to}:`,
      error.response?.data || error.message
    );
  }
}

// ------------------------------
// Bulk sender for attending recipients
// ------------------------------
function sendBulkReminders() {
  const csvFile = path.join(__dirname, "attendingRecipents.csv");
  const recipients = [];

  fs.createReadStream(csvFile)
    .pipe(csv())
    .on("data", (row) => {
      recipients.push(row);
    })
    .on("end", async () => {
      console.log(
        `CSV file successfully processed. Found ${recipients.length} recipients.`
      );

      for (const row of recipients) {
        // Only read the phone number now
        const phone = row.number?.trim();

        if (phone) {
          console.log(`📤 Sending reminder to ${phone}`);
          // Pass only the phone number to the function
          await sendWhatsAppReminder(phone);
        }
      }

      console.log("✅ All reminders have been sent.");
    });
}

// Run the script
sendBulkReminders();