const GMAIL_USER = "Solis.os.support@gmail.com";
const GMAIL_PASS = Deno.env.get("GMAIL_APP_PASSWORD") || "xdjjbbzvxsxpjvin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, html: string) {
  const conn = await Deno.connectTls({ hostname: "smtp.gmail.com", port: 465 });
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  async function read(): Promise<string> {
    const buf = new Uint8Array(4096);
    const n = await conn.read(buf);
    return n ? decoder.decode(buf.subarray(0, n)) : "";
  }

  async function send(cmd: string): Promise<string> {
    await conn.write(encoder.encode(cmd + "\r\n"));
    return await read();
  }

  await read();
  await send("EHLO solis-os.com");
  const authStr = btoa(`\x00${GMAIL_USER}\x00${GMAIL_PASS}`);
  await send(`AUTH PLAIN ${authStr}`);
  await send(`MAIL FROM:<${GMAIL_USER}>`);
  await send(`RCPT TO:<${to}>`);
  await send("DATA");

  const msg = [
    `From: "Solis OS" <${GMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    html,
    `.`,
  ].join("\r\n");

  await conn.write(encoder.encode(msg + "\r\n"));
  await read();
  await send("QUIT");
  conn.close();
}

function welcomeEmail(name: string, product: string) {
  const isPos = product === "POS";
  return {
    subject: `Welcome to Solis OS ${product}!`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;text-align:center;border-radius:12px 12px 0 0">
        <img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:40px;margin:0 auto 12px">
        <h1 style="color:#fff;font-size:24px;margin:0">Welcome to Solis OS!</h1>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #E8E9EF;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#1A1D2E;font-size:16px;font-weight:600">Hi ${name},</p>
        <p style="color:#6B7280;font-size:15px;line-height:1.7">Your Solis OS ${product} account has been created successfully! You now have a <strong>${isPos ? "10" : "14"}-day free trial</strong> to explore all features.</p>
        <div style="background:#F7F8FC;border-radius:10px;padding:20px;margin:20px 0">
          <p style="color:#1A1D2E;font-size:14px;font-weight:600;margin:0 0 8px">What you can do:</p>
          ${isPos ? `
          <p style="color:#6B7280;font-size:14px;margin:4px 0">- Scan barcodes and process sales</p>
          <p style="color:#6B7280;font-size:14px;margin:4px 0">- Manage your inventory</p>
          <p style="color:#6B7280;font-size:14px;margin:4px 0">- Track sales reports</p>
          <p style="color:#6B7280;font-size:14px;margin:4px 0">- Print receipts</p>
          ` : `
          <p style="color:#6B7280;font-size:14px;margin:4px 0">- Manage bookings and schedule</p>
          <p style="color:#6B7280;font-size:14px;margin:4px 0">- AI WhatsApp assistant</p>
          <p style="color:#6B7280;font-size:14px;margin:4px 0">- Customer management</p>
          <p style="color:#6B7280;font-size:14px;margin:4px 0">- Analytics and reports</p>
          `}
        </div>
        <a href="${isPos ? "https://solis-os.com/app/" : "https://app.solis-os.com"}" style="display:block;text-align:center;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin:20px 0">Open Solis OS ${product}</a>
        <p style="color:#6B7280;font-size:14px">Questions? WhatsApp +44 7700 168964 or reply to this email.</p>
        <p style="color:#9CA3AF;font-size:12px;margin-top:20px;padding-top:16px;border-top:1px solid #E8E9EF">Solis OS | <a href="https://solis-os.com" style="color:#d97706">solis-os.com</a></p>
      </div>
    </div>`,
  };
}

function receiptEmail(product: string, amount: string, nextDate: string, email: string) {
  const dateStr = new Date(nextDate).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" });
  return {
    subject: `Payment Confirmation — Solis OS ${product}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;text-align:center;border-radius:12px 12px 0 0">
        <img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:40px;margin:0 auto 12px">
        <h1 style="color:#fff;font-size:24px;margin:0">Payment Successful</h1>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #E8E9EF;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#6B7280;font-size:15px;line-height:1.7">Thank you for subscribing to Solis OS!</p>
        <div style="background:#F7F8FC;border-radius:10px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#9CA3AF;font-size:14px">Product</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;color:#1A1D2E">Solis OS ${product}</td></tr>
            <tr><td style="padding:8px 0;color:#9CA3AF;font-size:14px">Amount</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;color:#1A1D2E">${amount} AUD</td></tr>
            <tr><td style="padding:8px 0;color:#9CA3AF;font-size:14px">Next billing date</td><td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;color:#1A1D2E">${dateStr}</td></tr>
            <tr><td style="padding:8px 0;color:#9CA3AF;font-size:14px">Account</td><td style="padding:8px 0;text-align:right;font-size:14px;color:#1A1D2E">${email}</td></tr>
          </table>
        </div>
        <p style="color:#6B7280;font-size:14px">You now have full access. Questions? WhatsApp +44 7700 168964 or email Solis.os.support@gmail.com</p>
        <p style="color:#9CA3AF;font-size:12px;margin-top:20px;padding-top:16px;border-top:1px solid #E8E9EF">Solis OS | <a href="https://solis-os.com" style="color:#d97706">solis-os.com</a></p>
      </div>
    </div>`,
  };
}

function cancelEmail(product: string, endDate: string, email: string) {
  const dateStr = new Date(endDate).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" });
  return {
    subject: `Subscription Cancelled — Solis OS ${product}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1A1D2E;padding:32px;text-align:center;border-radius:12px 12px 0 0">
        <img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:40px;margin:0 auto 12px">
        <h1 style="color:#fff;font-size:24px;margin:0">Subscription Cancelled</h1>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #E8E9EF;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#6B7280;font-size:15px;line-height:1.7">Your Solis OS ${product} subscription has been cancelled.</p>
        <div style="background:#FEF3C7;border-radius:10px;padding:16px;margin:20px 0;border:1px solid #FDE68A">
          <p style="color:#92400E;font-size:14px;margin:0"><strong>You still have access until ${dateStr}.</strong></p>
        </div>
        <p style="color:#6B7280;font-size:14px;line-height:1.7">After that date, your account will be locked but your data will be kept safe. You can resubscribe anytime to restore full access.</p>
        <p style="color:#6B7280;font-size:14px">Changed your mind? Just visit your billing page to resubscribe.</p>
        <p style="color:#9CA3AF;font-size:12px;margin-top:20px;padding-top:16px;border-top:1px solid #E8E9EF">Solis OS | <a href="https://solis-os.com" style="color:#d97706">solis-os.com</a></p>
      </div>
    </div>`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, to } = body;
    if (!to || !type) {
      return new Response(JSON.stringify({ error: "Missing 'to' and 'type'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let email: { subject: string; html: string };

    switch (type) {
      case "welcome":
        email = welcomeEmail(body.name || "there", body.product || "Dashboard");
        break;
      case "receipt":
        email = receiptEmail(body.product || "Dashboard", body.amount || "$39", body.next_date || new Date().toISOString(), to);
        break;
      case "cancel":
        email = cancelEmail(body.product || "Dashboard", body.end_date || new Date().toISOString(), to);
        break;
      default:
        return new Response(JSON.stringify({ error: "Unknown type. Use: welcome, receipt, cancel" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    await sendEmail(to, email.subject, email.html);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
