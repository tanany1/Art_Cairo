const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const axios = require("axios");
require("dotenv").config();

// ------------------------------
// Send WhatsApp Template Message
// ------------------------------
async function sendWhatsAppTemplate(to, name) {
  try {
    await axios.post(
      `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: "talabat_vip_inv", // ✅ your approved template name
          language: { code: "en" },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "image",
                  image: {
                    link: "https://raw.githubusercontent.com/Sirkil/talabat_partners_event/main/E-Invittation_V2%20(AR%26EN)%20.jpg",
                  },
                },
              ],
            },
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: name, // ✅ inject first_name into {{1}}
                },
              ],
            },
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
    console.log(`✅ Template sent to ${to} (${name})`);
  } catch (error) {
    console.error(
      `❌ Failed to send template to ${to}:`,
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
      const phone = row.number.trim();
      const name = row.first_name?.trim();

      console.log(`📤 Sending template to ${phone} (${name})`);

      // ✅ Pass both phone + name
      await sendWhatsAppTemplate(phone, name);
    })
    .on("end", () => {
      console.log("✅ All messages processed");
    });
}

// Run
sendBulkMessages();
