import "@supabase/functions-js/edge-runtime.d.ts";

const GMAIL_USER = "Solis.os.support@gmail.com";
const GMAIL_PASS = Deno.env.get("GMAIL_APP_PASSWORD") || "xdjjbbzvxsxpjvin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, html: string) {
  const authStr = btoa(`\x00${GMAIL_USER}\x00${GMAIL_PASS}`);

  const response = await fetch("https://smtp-relay.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bypass: true }),
  }).catch(() => null);

  // Use Gmail SMTP via raw TCP
  const conn = await Deno.connectTls({ hostname: "smtp.gmail.com", port: 465 });
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  async function readLine(): Promise<string> {
    const buf = new Uint8Array(4096);
    const n = await conn.read(buf);
    return n ? decoder.decode(buf.subarray(0, n)) : "";
  }

  async function sendCmd(cmd: string): Promise<string> {
    await conn.write(encoder.encode(cmd + "\r\n"));
    return await readLine();
  }

  await readLine(); // greeting
  await sendCmd("EHLO solis-os.com");
  await sendCmd(`AUTH PLAIN ${authStr}`);
  await sendCmd(`MAIL FROM:<${GMAIL_USER}>`);
  await sendCmd(`RCPT TO:<${to}>`);
  await sendCmd("DATA");

  const message = [
    `From: "Solis OS" <${GMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    html,
    `.`,
  ].join("\r\n");

  await conn.write(encoder.encode(message + "\r\n"));
  await readLine();
  await sendCmd("QUIT");
  conn.close();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, product, amount, next_date } = await req.json();
    if (!to || !product) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dateStr = new Date(next_date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
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
            <tr><td style="padding:8px 0;color:#9CA3AF;font-size:14px">Account</td><td style="padding:8px 0;text-align:right;font-size:14px;color:#1A1D2E">${to}</td></tr>
          </table>
        </div>
        <p style="color:#6B7280;font-size:14px">You now have full access. Questions? WhatsApp +44 7700 168964 or email Solis.os.support@gmail.com</p>
        <p style="color:#9CA3AF;font-size:12px;margin-top:20px;padding-top:16px;border-top:1px solid #E8E9EF">Solis OS | <a href="https://solis-os.com" style="color:#d97706">solis-os.com</a></p>
      </div>
    </div>`;

    const subject = `Payment Confirmation — Solis OS ${product}`;
    await sendEmail(to, subject, html);

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
