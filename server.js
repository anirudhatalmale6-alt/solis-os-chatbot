require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { handleIncomingMessage, isHandedOff, resumeBot } = require('./chatbot');
const { sendWhatsAppMessage } = require('./whatsapp');

const WHATSAPP_DATA_FILE = path.join(__dirname, 'whatsapp_numbers.json');
function loadWhatsappData() {
  try { return JSON.parse(fs.readFileSync(WHATSAPP_DATA_FILE, 'utf8')); } catch { return {}; }
}
function saveWhatsappData(data) {
  fs.writeFileSync(WHATSAPP_DATA_FILE, JSON.stringify(data, null, 2));
}

const processedMessages = new Set();
function isDuplicate(msgId) {
  if (!msgId || processedMessages.has(msgId)) return true;
  processedMessages.add(msgId);
  setTimeout(() => processedMessages.delete(msgId), 60000);
  return false;
}

const LEADS_FILE = path.join(__dirname, 'leads_log.json');
function loadLeads() {
  try { return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch { return []; }
}
function logLead(phone, name, direction, text) {
  try {
    let leads = loadLeads();
    leads.push({ id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, phone, name, direction, text, timestamp: new Date().toISOString() });
    if (leads.length > 5000) leads = leads.slice(-5000);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads));
  } catch (err) { console.error('Lead log error:', err.message); }
}

const BDATA_DIR = path.join(__dirname, 'business_data');
if (!fs.existsSync(BDATA_DIR)) fs.mkdirSync(BDATA_DIR, { recursive: true });
function bdataPath(bizId) { return path.join(BDATA_DIR, `${bizId}.json`); }
function loadBdata(bizId) {
  try { return JSON.parse(fs.readFileSync(bdataPath(bizId), 'utf8')); } catch { return {}; }
}
function saveBdata(bizId, data) {
  fs.writeFileSync(bdataPath(bizId), JSON.stringify(data));
}

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'Solis OS WhatsApp Chatbot is running' });
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  try {
    const body = req.body;
    if (!body.object || body.object !== 'whatsapp_business_account') return;

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== 'messages') continue;
        const value = change.value;
        if (!value || !value.messages) continue;

        for (const message of value.messages) {
          if (isDuplicate(message.id)) continue;
          if (message.type !== 'text') {
            await sendWhatsAppMessage(
              message.from,
              "Thanks for reaching out! I can best assist you with text messages. Feel free to type your question and I'll help you right away."
            );
            continue;
          }

          const userText = message.text.body;
          const senderName = value.contacts?.[0]?.profile?.name || 'there';
          console.log(`Message from ${senderName} (${message.from}): ${userText}`);

          logLead(message.from, senderName, 'inbound', userText);
          const reply = await handleIncomingMessage(userText, senderName, message.from);
          if (reply) {
            await sendWhatsAppMessage(message.from, reply);
            logLead(message.from, senderName, 'outbound', reply);
          }
        }
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }
});

app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server not configured' });

    const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName || '' },
      }),
    });

    const userData = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: userData.msg || userData.message || 'Signup failed' });

    res.json({ user: { id: userData.id, email: userData.email, full_name: fullName } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/admin/leads', (req, res) => {
  const leads = loadLeads();
  const convos = {};
  for (const m of leads) {
    if (!convos[m.phone]) convos[m.phone] = { phone: m.phone, name: m.name, messages: [], lastMessage: m.timestamp };
    convos[m.phone].messages.push(m);
    convos[m.phone].lastMessage = m.timestamp;
    if (m.name && m.name !== 'there') convos[m.phone].name = m.name;
  }
  const sorted = Object.values(convos).sort((a, b) => b.lastMessage.localeCompare(a.lastMessage));
  sorted.forEach(c => { c.handedOff = isHandedOff(c.phone); });
  res.json({ conversations: sorted, totalMessages: leads.length, totalContacts: sorted.length });
});

app.get('/api/admin/signups', async (req, res) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server not configured' });

    const [usersResp, bizResp] = await Promise.all([
      fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, {
        headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/businesses?select=*&order=created_at.desc`, {
        headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
      }),
    ]);

    const usersData = await usersResp.json();
    const businesses = await bizResp.json();

    const users = (usersData.users || []).map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name || '',
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at,
      business: Array.isArray(businesses) ? businesses.find(b => b.owner_id === u.id) || null : null,
    }));

    users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ users, total: usersData.total || users.length });
  } catch (err) {
    console.error('Admin signups error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/api/public-booking', async (req, res) => {
  try {
    const { business_id, service_id, service_name, customer_name, customer_phone, customer_email, date, time, duration, notes } = req.body;
    if (!business_id || !service_id || !customer_name || !customer_phone || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server not configured' });

    const booking = { business_id, service_id, customer_name, customer_phone, date, time, duration: duration || 30, notes: notes || (service_name ? `${service_name}` : ''), status: 'confirmed' };
    if (customer_email) booking.customer_email = customer_email;

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(booking),
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: data.message || 'Booking failed' });

    const created = Array.isArray(data) ? data[0] : data;

    const custResp = await fetch(`${SUPABASE_URL}/rest/v1/customers?business_id=eq.${business_id}&phone=eq.${encodeURIComponent(customer_phone)}`, {
      headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
    });
    const existingCustomers = await custResp.json();
    if (Array.isArray(existingCustomers) && existingCustomers.length === 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ business_id, name: customer_name, phone: customer_phone, email: customer_email || null }),
      });
    }

    res.json({ data: created });
  } catch (err) {
    console.error('Public booking error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/business', async (req, res) => {
  try {
    const { owner_id } = req.query;
    if (!owner_id) return res.status(400).json({ error: 'owner_id required' });

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server not configured' });

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/businesses?owner_id=eq.${owner_id}`, {
      headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
    });
    const data = await resp.json();
    if (Array.isArray(data) && data.length > 0) {
      res.json(data[0]);
    } else {
      res.json(null);
    }
  } catch (err) {
    console.error('Get business error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { business_id } = req.query;
    if (!business_id) return res.status(400).json({ error: 'business_id required' });

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server not configured' });

    let url = `${SUPABASE_URL}/rest/v1/bookings?business_id=eq.${business_id}&order=date.asc,time.asc`;
    const { date } = req.query;
    if (date) url += `&date=eq.${date}`;

    const resp = await fetch(url, {
      headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server not configured' });

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updates),
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: data.message || 'Update failed' });
    res.json(Array.isArray(data) ? data[0] : data);
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/whatsapp/:businessId', (req, res) => {
  const data = loadWhatsappData();
  res.json({ whatsapp_number: data[req.params.businessId] || '' });
});

app.post('/api/whatsapp/:businessId', (req, res) => {
  const { whatsapp_number } = req.body;
  const data = loadWhatsappData();
  data[req.params.businessId] = whatsapp_number || '';
  saveWhatsappData(data);
  res.json({ success: true });
});

app.get('/api/data/:businessId', (req, res) => {
  const data = loadBdata(req.params.businessId);
  const { key } = req.query;
  if (key) return res.json({ value: data[key] ?? null });
  res.json(data);
});

app.put('/api/data/:businessId', (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: 'key required' });
  const data = loadBdata(req.params.businessId);
  data[key] = value;
  saveBdata(req.params.businessId, data);
  res.json({ success: true });
});

app.put('/api/data/:businessId/bulk', (req, res) => {
  const items = req.body;
  if (!items || typeof items !== 'object') return res.status(400).json({ error: 'object required' });
  const data = loadBdata(req.params.businessId);
  Object.assign(data, items);
  saveBdata(req.params.businessId, data);
  res.json({ success: true });
});

app.post('/api/admin/reply', async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ error: 'phone and message required' });
    await sendWhatsAppMessage(phone, message);
    logLead(phone, 'Support Agent', 'outbound', message);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin reply error:', err);
    res.status(500).json({ error: 'Failed to send' });
  }
});

app.delete('/api/admin/leads/:phone', (req, res) => {
  try {
    const { phone } = req.params;
    let leads = loadLeads();
    const before = leads.length;
    leads = leads.filter(m => m.phone !== phone);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads));
    res.json({ success: true, deleted: before - leads.length });
  } catch (err) {
    console.error('Delete lead error:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

app.get('/admin/inbox', (req, res) => {
  res.sendFile(path.join(__dirname, 'inbox.html'));
});

app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, name } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    const sid = sessionId || `web_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
    const userName = name || 'there';
    const reply = await handleIncomingMessage(message, userName, sid);
    if (!reply) {
      return res.json({ reply: "A support team member will be with you shortly. Thank you for your patience!", sessionId: sid, handedOff: true });
    }
    res.json({ reply, sessionId: sid });
  } catch (err) {
    console.error('Chat API error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Solis OS Chatbot running on port ${PORT}`);
  });
}

module.exports = app;
