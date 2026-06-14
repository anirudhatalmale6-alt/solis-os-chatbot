require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { handleIncomingMessage, isHandedOff, resumeBot } = require('./chatbot');
const { sendWhatsAppMessage } = require('./whatsapp');

const WHATSAPP_DATA_FILE = path.join(__dirname, 'whatsapp_numbers.json');
function loadWhatsappData() {
  try { return JSON.parse(fs.readFileSync(WHATSAPP_DATA_FILE, 'utf8')); } catch { return {}; }
}
function saveWhatsappData(data) {
  fs.writeFileSync(WHATSAPP_DATA_FILE, JSON.stringify(data, null, 2));
}

const EMAIL_CONFIGS_FILE = path.join(__dirname, 'email_configs.json');
function loadEmailConfigs() {
  try { return JSON.parse(fs.readFileSync(EMAIL_CONFIGS_FILE, 'utf8')); } catch { return {}; }
}
function saveEmailConfigs(data) {
  fs.writeFileSync(EMAIL_CONFIGS_FILE, JSON.stringify(data, null, 2));
}

const SMTP_PROVIDERS = {
  gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
  outlook: { host: 'smtp.office365.com', port: 587, secure: false },
  yahoo: { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
};

function createBusinessTransporter(config) {
  const provider = SMTP_PROVIDERS[config.provider];
  if (provider) {
    return nodemailer.createTransport({
      host: provider.host,
      port: provider.port,
      secure: provider.secure,
      auth: { user: config.email, pass: config.password },
    });
  }
  return nodemailer.createTransport({
    host: config.smtp_host,
    port: parseInt(config.smtp_port) || 587,
    secure: parseInt(config.smtp_port) === 465,
    auth: { user: config.email, pass: config.password },
  });
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
app.use(express.json({ limit: '10mb' }));

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
    const { email, password, fullName, businessName, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDU4OSwiZXhwIjoyMDkzOTI2NTg5fQ.qSjr5JCxcw0wzl3_IypMMxWQhFl5FJ4IskiH04YPmiI';
    if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server not configured' });

    const userRole = role || (businessName ? 'business' : 'business');
    const metadata = { full_name: fullName || '', role: userRole };
    if (businessName) metadata.business_name = businessName;

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
        user_metadata: metadata,
      }),
    });

    const userData = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: userData.msg || userData.message || 'Signup failed' });

    const product = businessName ? 'POS' : (userRole === 'customer' ? 'Customer' : 'Dashboard');
    sendWelcomeEmail(email, fullName || 'there', product).catch(() => {});

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
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDU4OSwiZXhwIjoyMDkzOTI2NTg5fQ.qSjr5JCxcw0wzl3_IypMMxWQhFl5FJ4IskiH04YPmiI';
    if (!SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server not configured' });

    const [usersResp, bizResp] = await Promise.all([
      fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=500`, {
        headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
      }),
      fetch(`${SUPABASE_URL}/rest/v1/businesses?select=*&order=created_at.desc`, {
        headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
      }),
    ]);

    const usersData = await usersResp.json();
    const businesses = await bizResp.json();

    const users = (usersData.users || []).map(u => {
      const dbBiz = Array.isArray(businesses) ? businesses.find(b => b.owner_id === u.id) : null;
      const metaBizName = u.user_metadata?.business_name;
      const isPOS = !dbBiz && !!metaBizName;
      return {
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || '',
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at,
        email_confirmed: !!u.email_confirmed_at,
        source: isPOS ? 'pos' : dbBiz ? 'dashboard' : 'unknown',
        business: dbBiz || (metaBizName ? { name: metaBizName, industry: 'POS' } : null),
      };
    });

    users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ users, total: usersData.total || users.length });
  } catch (err) {
    console.error('Admin signups error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.delete('/api/admin/signups/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDU4OSwiZXhwIjoyMDkzOTI2NTg5fQ.qSjr5JCxcw0wzl3_IypMMxWQhFl5FJ4IskiH04YPmiI';
    const delResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
    });
    if (!delResp.ok) {
      const d = await delResp.json().catch(() => ({}));
      return res.status(delResp.status).json({ error: d.msg || d.message || 'Failed to delete user' });
    }
    console.log(`Admin deleted user: ${userId}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
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
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDU4OSwiZXhwIjoyMDkzOTI2NTg5fQ.qSjr5JCxcw0wzl3_IypMMxWQhFl5FJ4IskiH04YPmiI';
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
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDU4OSwiZXhwIjoyMDkzOTI2NTg5fQ.qSjr5JCxcw0wzl3_IypMMxWQhFl5FJ4IskiH04YPmiI';
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
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDU4OSwiZXhwIjoyMDkzOTI2NTg5fQ.qSjr5JCxcw0wzl3_IypMMxWQhFl5FJ4IskiH04YPmiI';
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
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDU4OSwiZXhwIjoyMDkzOTI2NTg5fQ.qSjr5JCxcw0wzl3_IypMMxWQhFl5FJ4IskiH04YPmiI';
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

app.delete('/api/admin/leads', (req, res) => {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([]));
    console.log('All leads cleared');
    res.json({ success: true });
  } catch (err) {
    console.error('Clear leads error:', err);
    res.status(500).json({ error: 'Failed to clear' });
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

// POS Cloud Sync Storage
const POS_DATA_DIR = path.join(__dirname, 'pos_sync_data');
if (!fs.existsSync(POS_DATA_DIR)) fs.mkdirSync(POS_DATA_DIR, { recursive: true });

function mergeRecords(existing, incoming) {
  if (!incoming || incoming.length === 0) return existing || [];
  const map = {};
  (existing || []).forEach(r => { const key = r.syncId || r.id; if (key) map[key] = r; });
  (incoming || []).forEach(r => {
    const key = r.syncId || r.id;
    if (!key) return;
    const ex = map[key];
    if (!ex || (r.updatedAt && (!ex.updatedAt || r.updatedAt > ex.updatedAt))) {
      map[key] = r;
    } else if (!ex) {
      map[key] = r;
    }
  });
  return Object.values(map);
}

const RESET_CODES = new Map();

const SYNC_MAP_FILE = path.join(POS_DATA_DIR, '_email_sync_map.json');
function loadSyncMap() { try { return JSON.parse(fs.readFileSync(SYNC_MAP_FILE, 'utf8')); } catch { return {}; } }
function saveSyncMap(m) { fs.writeFileSync(SYNC_MAP_FILE, JSON.stringify(m)); }

app.post('/api/pos/register-sync', (req, res) => {
  try {
    const { email, syncCode } = req.body;
    if (!email || !syncCode) return res.status(400).json({ error: 'email and syncCode required' });
    const map = loadSyncMap();
    const code = syncCode.toUpperCase();
    const emailLower = email.toLowerCase();
    const existingOwner = Object.entries(map).find(([e, c]) => c === code && e !== emailLower);
    if (existingOwner) {
      return res.status(409).json({ error: 'sync_code_taken', owner: existingOwner[0].slice(0,3) + '***' });
    }
    map[emailLower] = code;
    saveSyncMap(map);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register' });
  }
});

app.get('/api/pos/trial-status/:email', (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const map = loadSyncMap();
    const code = map[email];
    if (!code) return res.json({ trialActive: true, daysLeft: 10 });
    const filePath = path.join(POS_DATA_DIR, `${code}.json`);
    let payload = {};
    try { payload = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch {}
    if (payload.settings?.purchased && !payload.settings?.cancelled) {
      return res.json({ trialActive: false, subscribed: true, purchased: true, daysLeft: 0 });
    }
    const acDate = payload.settings?.accountCreatedAt;
    if (!acDate) return res.json({ trialActive: true, daysLeft: 10 });
    const elapsed = Math.floor((Date.now() - new Date(acDate).getTime()) / (1000*60*60*24));
    const daysLeft = Math.max(0, 10 - elapsed);
    return res.json({ trialActive: daysLeft > 0, subscribed: !!payload.settings?.purchased, daysLeft });
  } catch (err) { res.json({ trialActive: true, daysLeft: 10 }); }
});

app.post('/api/admin/expire-pos-trial', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const map = loadSyncMap();
    const code = map[email.toLowerCase()];
    if (!code) return res.status(404).json({ error: 'No POS account for this email' });
    const filePath = path.join(POS_DATA_DIR, `${code}.json`);
    let payload = {};
    try { payload = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch {}
    if (!payload.settings) payload.settings = {};
    payload.settings.accountCreatedAt = '2026-05-01T00:00:00Z';
    delete payload.settings.purchased;
    delete payload.settings.purchasedAt;
    delete payload.settings.purchasedEmail;
    delete payload.settings.cancelled;
    delete payload.settings.cancelledAt;
    delete payload.settings.subscriptionEnd;
    fs.writeFileSync(filePath, JSON.stringify(payload));
    console.log(`POS trial expired + purchase cleared for: ${email}`);
    res.json({ success: true, message: `POS trial expired for ${email}` });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/pos/lookup-sync/:email', (req, res) => {
  try {
    const map = loadSyncMap();
    const code = map[req.params.email.toLowerCase()];
    if (!code) return res.json({ syncCode: null });
    const filePath = path.join(POS_DATA_DIR, `${code}.json`);
    const exists = fs.existsSync(filePath);
    res.json({ syncCode: exists ? code : null });
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed' });
  }
});

app.post('/api/pos/sync', (req, res) => {
  try {
    const { syncCode, businessName, data, products, promotions, staff, customers, sales, settings, email } = req.body;
    if (!syncCode || !data) return res.status(400).json({ error: 'syncCode and data required' });
    const code = syncCode.toUpperCase();
    const filePath = path.join(POS_DATA_DIR, `${code}.json`);
    let existing = {};
    try { existing = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch {}
    const payload = { businessName: businessName || existing.businessName || 'My Business', data, syncedAt: new Date().toISOString() };
    if (products !== undefined) payload.products = mergeRecords(existing.products, products);
    else if (existing.products) payload.products = existing.products;
    if (promotions !== undefined) payload.promotions = mergeRecords(existing.promotions, promotions);
    else if (existing.promotions) payload.promotions = existing.promotions;
    if (staff !== undefined) payload.staff = mergeRecords(existing.staff, staff);
    else if (existing.staff) payload.staff = existing.staff;
    if (customers !== undefined) payload.customers = mergeRecords(existing.customers, customers);
    else if (existing.customers) payload.customers = existing.customers;
    if (sales !== undefined) payload.sales = mergeRecords(existing.sales, sales);
    else if (existing.sales) payload.sales = existing.sales;
    if (settings !== undefined) {
      const merged = existing.settings ? { ...existing.settings } : {};
      const PROTECTED = ['purchased','purchasedAt','purchasedEmail','subscriptionEnd','cancelled'];
      for (const [k, v] of Object.entries(settings)) {
        if (PROTECTED.includes(k)) continue;
        if (k === 'accountCreatedAt' && merged.accountCreatedAt) continue;
        merged[k] = v;
      }
      payload.settings = merged;
    } else if (existing.settings) payload.settings = existing.settings;
    fs.writeFileSync(filePath, JSON.stringify(payload));
    if (email) {
      const map = loadSyncMap();
      map[email.toLowerCase()] = code;
      saveSyncMap(map);
    }
    res.json({ success: true, syncedAt: payload.syncedAt });
  } catch (err) {
    console.error('POS sync error:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

app.get('/api/pos/dashboard/:syncCode', (req, res) => {
  try {
    const code = req.params.syncCode.toUpperCase();
    const filePath = path.join(POS_DATA_DIR, `${code}.json`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'No data found for this sync code' });
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({
      businessName: payload.businessName,
      data: payload.data,
      syncedAt: payload.syncedAt,
      products: payload.products || [],
      promotions: payload.promotions || [],
      staff: payload.staff || [],
      customers: payload.customers || [],
    });
  } catch (err) {
    console.error('Dashboard data error:', err);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.get('/api/pos/pull/:syncCode', (req, res) => {
  try {
    const code = req.params.syncCode.toUpperCase();
    const filePath = path.join(POS_DATA_DIR, `${code}.json`);
    if (!fs.existsSync(filePath)) return res.json({ products: [], sales: [], customers: [], staff: [], promotions: [], settings: {} });
    const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json({
      products: payload.products || [],
      sales: payload.sales || [],
      customers: payload.customers || [],
      staff: payload.staff || [],
      promotions: payload.promotions || [],
      settings: payload.settings || {},
      syncedAt: payload.syncedAt,
    });
  } catch (err) {
    console.error('Pull data error:', err);
    res.status(500).json({ error: 'Failed to pull data' });
  }
});

app.post('/api/pos/remote/:syncCode', (req, res) => {
  try {
    const code = req.params.syncCode.toUpperCase();
    const { type, data } = req.body;
    if (!type) return res.status(400).json({ error: 'type is required' });
    const filePath = path.join(POS_DATA_DIR, `${code}_commands.json`);
    let commands = [];
    try { commands = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { commands = []; }
    const command = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`, type, data: data || {}, createdAt: new Date().toISOString() };
    commands.push(command);
    fs.writeFileSync(filePath, JSON.stringify(commands));
    res.json({ success: true, command });
  } catch (err) {
    console.error('Remote command push error:', err);
    res.status(500).json({ error: 'Failed to push command' });
  }
});

app.get('/api/pos/remote/:syncCode', (req, res) => {
  try {
    const code = req.params.syncCode.toUpperCase();
    const filePath = path.join(POS_DATA_DIR, `${code}_commands.json`);
    let commands = [];
    try { commands = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { commands = []; }
    res.json({ commands });
  } catch (err) {
    console.error('Remote command fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch commands' });
  }
});

app.delete('/api/pos/remote/:syncCode', (req, res) => {
  try {
    const code = req.params.syncCode.toUpperCase();
    const filePath = path.join(POS_DATA_DIR, `${code}_commands.json`);
    fs.writeFileSync(filePath, JSON.stringify([]));
    res.json({ success: true });
  } catch (err) {
    console.error('Remote command clear error:', err);
    res.status(500).json({ error: 'Failed to clear commands' });
  }
});

// POS Password Reset - Send branded email with verification code
// Payment Terminal Endpoints
app.post('/api/pos/terminal/test', async (req, res) => {
  try {
    const { provider, publishableKey, secretKey, accessToken, locationId, apiKey, merchantCode, merchantId, terminalId, integrationKey, clientId, clientSecret } = req.body;
    if (!provider) return res.status(400).json({ error: 'Provider is required' });
    if (provider === 'stripe') {
      if (!secretKey) return res.json({ success: false, error: 'Secret key is required' });
      const r = await fetch('https://api.stripe.com/v1/terminal/locations', { headers: { 'Authorization': `Bearer ${secretKey}` } });
      if (r.ok) { const d = await r.json(); return res.json({ success: true, details: `${d.data?.length || 0} location(s) found` }); }
      const e = await r.json(); return res.json({ success: false, error: e.error?.message || 'Invalid API key' });
    }
    if (provider === 'square') {
      if (!accessToken) return res.json({ success: false, error: 'Access token is required' });
      const r = await fetch('https://connect.squareup.com/v2/locations', { headers: { 'Authorization': `Bearer ${accessToken}`, 'Square-Version': '2024-01-18' } });
      if (r.ok) { const d = await r.json(); return res.json({ success: true, details: `${d.locations?.length || 0} location(s) found` }); }
      return res.json({ success: false, error: 'Invalid access token' });
    }
    if (provider === 'sumup') {
      if (!apiKey) return res.json({ success: false, error: 'API key is required' });
      const r = await fetch('https://api.sumup.com/v0.1/me', { headers: { 'Authorization': `Bearer ${apiKey}` } });
      if (r.ok) { const d = await r.json(); return res.json({ success: true, details: `Merchant: ${d.merchant_profile?.merchant_code || merchantCode || 'OK'}` }); }
      return res.json({ success: false, error: 'Invalid API key' });
    }
    if (provider === 'tyro') {
      if (!merchantId || !integrationKey) return res.json({ success: false, error: 'Merchant ID and Integration Key required' });
      return res.json({ success: true, details: 'Tyro credentials saved. Will connect to terminal during checkout.' });
    }
    if (provider === 'zettle') {
      if (!clientId || !clientSecret) return res.json({ success: false, error: 'Client ID and Secret required' });
      const r = await fetch('https://oauth.zettle.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}` });
      if (r.ok) return res.json({ success: true, details: 'Zettle authentication successful' });
      return res.json({ success: false, error: 'Invalid credentials' });
    }
    res.json({ success: false, error: 'Unknown provider' });
  } catch (err) { console.error('Terminal test error:', err); res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/pos/terminal/stripe/connection-token', async (req, res) => {
  try {
    const { secretKey } = req.body;
    if (!secretKey) return res.status(400).json({ error: 'Secret key required' });
    const r = await fetch('https://api.stripe.com/v1/terminal/connection_tokens', { method: 'POST', headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' } });
    const d = await r.json();
    if (d.secret) return res.json({ secret: d.secret });
    res.status(400).json({ error: d.error?.message || 'Failed to create token' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pos/terminal/stripe/payment-intent', async (req, res) => {
  try {
    const { secretKey, amount, currency } = req.body;
    if (!secretKey || !amount) return res.status(400).json({ error: 'Secret key and amount required' });
    const params = new URLSearchParams({ amount: String(amount), currency: currency || 'usd', 'payment_method_types[]': 'card_present', capture_method: 'automatic' });
    const r = await fetch('https://api.stripe.com/v1/payment_intents', { method: 'POST', headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
    const d = await r.json();
    if (d.client_secret) return res.json({ client_secret: d.client_secret, id: d.id });
    res.status(400).json({ error: d.error?.message || 'Failed to create payment' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pos/terminal/process', async (req, res) => {
  try {
    const { provider, amount, currency, accessToken, locationId, deviceId, apiKey, merchantCode, merchantId, terminalId, integrationKey, clientId, clientSecret } = req.body;
    if (!provider || !amount) return res.status(400).json({ error: 'Provider and amount required' });

    if (provider === 'square') {
      const body = { checkout: { amount_money: { amount: Math.round(amount * 100), currency: (currency || 'usd').toUpperCase() }, device_options: { device_id: deviceId } }, idempotency_key: `pos-${Date.now()}-${Math.random().toString(36).slice(2)}` };
      const r = await fetch(`https://connect.squareup.com/v2/terminals/checkouts`, { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Square-Version': '2024-01-18', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.checkout) return res.json({ success: true, id: d.checkout.id, status: d.checkout.status });
      return res.json({ success: false, error: d.errors?.[0]?.detail || 'Square checkout failed' });
    }

    if (provider === 'sumup') {
      const body = { checkout_reference: `pos-${Date.now()}`, amount, currency: (currency || 'usd').toUpperCase(), merchant_code: merchantCode, description: 'POS Sale' };
      const r = await fetch('https://api.sumup.com/v0.1/checkouts', { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.id) return res.json({ success: true, id: d.id, status: d.status });
      return res.json({ success: false, error: d.message || 'SumUp checkout failed' });
    }

    if (provider === 'tyro') {
      const body = { amount: Math.round(amount * 100), merchantId, terminalId, transactionType: 'PURCHASE', integratedReceipt: false };
      const r = await fetch('https://api.tyro.com/connect/pay/transactions', { method: 'POST', headers: { 'Authorization': `Bearer ${integrationKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.transactionId) return res.json({ success: true, id: d.transactionId, status: d.status });
      return res.json({ success: false, error: d.message || 'Tyro transaction failed' });
    }

    if (provider === 'zettle') {
      const tokenResp = await fetch('https://oauth.zettle.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}` });
      const tokenData = await tokenResp.json();
      if (!tokenData.access_token) return res.json({ success: false, error: 'Zettle auth failed' });
      const body = { purchaseUUID: `pos-${Date.now()}-${Math.random().toString(36).slice(2)}`, amount: Math.round(amount * 100), title: 'POS Sale' };
      const r = await fetch('https://purchase.izettle.com/purchases/v2', { method: 'POST', headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.purchaseUUID || r.ok) return res.json({ success: true, id: d.purchaseUUID || body.purchaseUUID });
      return res.json({ success: false, error: d.developerMessage || 'Zettle payment failed' });
    }

    res.json({ success: false, error: 'Unknown provider' });
  } catch (err) { console.error('Terminal process error:', err); res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/pos/send-reset-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDU4OSwiZXhwIjoyMDkzOTI2NTg5fQ.qSjr5JCxcw0wzl3_IypMMxWQhFl5FJ4IskiH04YPmiI';
    const SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTA1ODksImV4cCI6MjA5MzkyNjU4OX0.p4hS6hpKaweZRDIZbeuWb6-c0NL7irtTJ_HXOZmdTmY';
    const usersResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=500`, {
      headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
    });
    if (!usersResp.ok) {
      console.error('Failed to fetch users:', usersResp.status);
      return res.status(500).json({ error: 'Unable to verify account. Please try again.' });
    }
    const usersData = await usersResp.json();
    const user = (usersData.users || []).find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(404).json({ error: 'No account found with this email. Please check the email or create a new account.' });
    if (!user.email_confirmed_at) return res.status(404).json({ error: 'This account was never fully activated. Please sign up again.' });
    const linkResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'recovery', email: email.toLowerCase() }),
    });
    if (!linkResp.ok) {
      const errData = await linkResp.json().catch(() => ({}));
      console.error('Generate recovery link error:', errData);
      return res.status(500).json({ error: 'Failed to generate reset link' });
    }
    const linkData = await linkResp.json();
    const otp = linkData.email_otp;
    const resetSubject = 'Password Reset — Solis OS';
    const resetHtml = `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff"><div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:40px 32px;text-align:center;border-radius:16px 16px 0 0"><img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:48px;margin:0 auto 16px"><h1 style="color:#fff;font-size:26px;margin:0;font-weight:700">Password Reset</h1></div><div style="padding:36px 32px;border:1px solid #E8E9EF;border-top:none;border-radius:0 0 16px 16px"><p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 20px">You requested a password reset for your Solis OS account. Use the code below to reset your password:</p><div style="background:#F7F8FC;border-radius:12px;padding:24px;margin:0 0 24px;text-align:center"><p style="color:#9CA3AF;font-size:13px;margin:0 0 8px">Your reset code</p><p style="color:#1A1D2E;font-size:32px;font-weight:700;margin:0;letter-spacing:4px;font-family:monospace">${otp}</p></div><p style="color:#6B7280;font-size:14px;line-height:1.7;margin:0 0 24px">Enter this code on the password reset page. This code expires in 1 hour.</p><p style="color:#6B7280;font-size:14px;margin:0 0 24px">If you did not request this reset, you can safely ignore this email.</p><div style="border-top:1px solid #E8E9EF;padding-top:20px"><table style="width:100%"><tr><td><img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:24px"></td><td style="text-align:right"><a href="https://solis-os.com" style="color:#d97706;font-size:13px;text-decoration:none">solis-os.com</a></td></tr></table><p style="color:#9CA3AF;font-size:12px;margin:12px 0 0">Solis OS Pty Ltd | This is an automated security email.</p></div></div></div>`;
    sendEmailViaRelay(email, resetSubject, resetHtml);
    console.log(`Password reset email sent via relay to: ${email}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Send reset code error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.post('/api/pos/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'Email, verification code, and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDU4OSwiZXhwIjoyMDkzOTI2NTg5fQ.qSjr5JCxcw0wzl3_IypMMxWQhFl5FJ4IskiH04YPmiI';
    const SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTA1ODksImV4cCI6MjA5MzkyNjU4OX0.p4hS6hpKaweZRDIZbeuWb6-c0NL7irtTJ_HXOZmdTmY';
    const verifyResp = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: 'POST',
      headers: { 'apikey': SB_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'recovery', token: code, email: email.toLowerCase() }),
    });
    if (!verifyResp.ok) {
      const errData = await verifyResp.json().catch(() => ({}));
      return res.status(403).json({ error: errData.msg || 'Invalid or expired code. Please request a new one.' });
    }
    const verifyData = await verifyResp.json();
    const accessToken = verifyData.access_token;
    if (accessToken) {
      const updateResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'apikey': SB_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (updateResp.ok) {
        console.log(`Password reset via recovery token: ${email}`);
        return res.json({ success: true });
      }
    }
    const usersResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=500`, {
      headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
    });
    if (!usersResp.ok) return res.status(500).json({ error: 'Unable to verify account. Please try again.' });
    const usersData = await usersResp.json();
    const user = (usersData.users || []).find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.email_confirmed_at) return res.status(404).json({ error: 'No verified account found with this email.' });
    const adminUpdateResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    if (!adminUpdateResp.ok) { const d = await adminUpdateResp.json(); return res.status(500).json({ error: d.msg || d.message || 'Password reset failed' }); }
    console.log(`Password reset via admin: ${email}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// POS Purchase - Activate account after payment
app.post('/api/pos/activate', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const map = loadSyncMap();
    const syncCode = map[email.toLowerCase()];
    if (!syncCode) {
      return res.json({ success: true, note: 'No sync code yet — will activate on next login' });
    }
    const filePath = path.join(POS_DATA_DIR, `${syncCode}.json`);
    let payload = {};
    try { payload = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch {}
    if (!payload.settings) payload.settings = {};
    const now = new Date();
    const end = new Date(now);
    end.setFullYear(end.getFullYear() + 1);
    payload.settings.purchased = true;
    payload.settings.purchasedAt = now.toISOString();
    payload.settings.subscriptionEnd = end.toISOString();
    payload.settings.purchasedEmail = email.toLowerCase();
    fs.writeFileSync(filePath, JSON.stringify(payload));
    console.log(`POS activated: ${email} (sync: ${syncCode}, expires: ${end.toISOString()})`);
    sendReceiptEmail(email, 'POS', '$239', end.toISOString()).catch(e => console.error('Receipt send error:', e.message));
    res.json({ success: true });
  } catch (err) {
    console.error('Activate error:', err);
    res.status(500).json({ error: 'Activation failed' });
  }
});

// POS Purchase - Check purchase status
app.get('/api/pos/purchase-status/:email', (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const map = loadSyncMap();
    const syncCode = map[email];
    if (!syncCode) return res.json({ purchased: false });
    const filePath = path.join(POS_DATA_DIR, `${syncCode}.json`);
    let payload = {};
    try { payload = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch {}
    res.json({ purchased: !!(payload.settings && payload.settings.purchased), purchasedAt: payload.settings?.purchasedAt || null });
  } catch (err) {
    res.status(500).json({ error: 'Check failed' });
  }
});

// POS Purchase - Square Checkout
app.post('/api/pos/checkout', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const SQUARE_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
    const SQUARE_LOCATION = process.env.SQUARE_LOCATION_ID;
    if (!SQUARE_TOKEN || !SQUARE_LOCATION) return res.status(503).json({ error: 'Payment system not configured' });
    const idempotencyKey = `pos_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const body = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: SQUARE_LOCATION,
        line_items: [{ name: 'Solis OS POS — Annual Subscription (TEST)', quantity: '1', base_price_money: { amount: 100, currency: 'AUD' } }],
      },
      checkout_options: { redirect_url: `https://solis-os.com/purchase-success.html?email=${encodeURIComponent(email)}` },
      pre_populated_data: { buyer_email: email },
    };
    const resp = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SQUARE_TOKEN}`, 'Content-Type': 'application/json', 'Square-Version': '2024-12-18' },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (!resp.ok) { console.error('Square checkout error:', JSON.stringify(data)); return res.status(500).json({ error: 'Payment link creation failed', details: data.errors }); }
    const link = data.payment_link || {};
    res.json({ checkout_url: link.long_url || link.url || '', order_id: link.order_id || '' });
  } catch (err) { console.error('Checkout error:', err); res.status(500).json({ error: 'Internal error' }); }
});

// ── Dashboard Subscription & Square Billing ─────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDU4OSwiZXhwIjoyMDkzOTI2NTg5fQ.qSjr5JCxcw0wzl3_IypMMxWQhFl5FJ4IskiH04YPmiI';
const DASHBOARD_PRICE = 3900; // $39 AUD in cents

async function findSupabaseUser(email) {
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=500`, {
    headers: { 'Authorization': `Bearer ${SUPA_SERVICE_KEY}`, 'apikey': SUPA_SERVICE_KEY }
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return (data.users || []).find(u => u.email?.toLowerCase() === email.toLowerCase());
}

async function updateUserMeta(userId, metadata) {
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${SUPA_SERVICE_KEY}`, 'apikey': SUPA_SERVICE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_metadata: metadata })
  });
  return resp.ok;
}

// Square helper
async function squareRequest(endpoint, body) {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const resp = await fetch(`https://connect.squareup.com/v2${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Square-Version': '2024-12-18' },
    body: JSON.stringify(body),
  });
  return resp.json();
}

// Subscribe - Create customer, save card, charge $39/month
app.post('/api/subscribe', async (req, res) => {
  try {
    const { source_id, business_id, user_id, email, name } = req.body;
    if (!source_id || !email) return res.status(400).json({ error: 'Missing required fields' });
    const SQUARE_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
    const SQUARE_LOCATION = process.env.SQUARE_LOCATION_ID;
    if (!SQUARE_TOKEN || !SQUARE_LOCATION) return res.status(503).json({ error: 'Payment system not configured' });

    // 1. Create Square customer
    const custData = await squareRequest('/customers', {
      idempotency_key: `cust_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      email_address: email,
      given_name: name || email.split('@')[0],
      reference_id: user_id || business_id,
    });
    if (custData.errors) { console.error('Square customer error:', custData.errors); return res.status(500).json({ error: 'Failed to create customer' }); }
    const customerId = custData.customer.id;

    // 2. Save card on file
    const cardData = await squareRequest('/cards', {
      idempotency_key: `card_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      source_id,
      card: { customer_id: customerId },
    });
    if (cardData.errors) { console.error('Square card error:', cardData.errors); return res.status(500).json({ error: 'Failed to save card' }); }
    const cardId = cardData.card.id;

    // 3. Charge first month
    const payData = await squareRequest('/payments', {
      idempotency_key: `pay_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      source_id: cardId,
      amount_money: { amount: DASHBOARD_PRICE, currency: 'AUD' },
      customer_id: customerId,
      location_id: SQUARE_LOCATION,
      note: 'Solis OS Dashboard — Monthly Subscription',
      autocomplete: true,
      receipt_email: email,
      receipt_url: 'https://solis-os.com',
    });
    if (payData.errors) { console.error('Square payment error:', payData.errors); return res.status(500).json({ error: 'Payment failed: ' + (payData.errors[0]?.detail || 'Unknown') }); }

    // 4. Store subscription data
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    const user = await findSupabaseUser(email);
    if (user) {
      await updateUserMeta(user.id, {
        ...user.user_metadata,
        dashboard_subscription: {
          status: 'active',
          start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          square_customer_id: customerId,
          square_card_id: cardId,
          cancelled: false,
        }
      });
    }

    console.log(`Dashboard subscription created: ${email} (customer: ${customerId}) — Square receipt sent to ${email}`);
    res.json({
      success: true,
      customer_id: customerId,
      subscription_id: `sub_${customerId}`,
      current_period_end: periodEnd.toISOString(),
    });
  } catch (err) { console.error('Subscribe error:', err); res.status(500).json({ error: 'Internal error' }); }
});

// Cancel subscription via Square (from BillingPage)
app.post('/api/cancel', async (req, res) => {
  try {
    const { business_id } = req.body;
    // Find user by business
    const bizResp = await fetch(`${SUPABASE_URL}/rest/v1/businesses?id=eq.${business_id}&select=owner_id`, {
      headers: { 'Authorization': `Bearer ${SUPA_SERVICE_KEY}`, 'apikey': SUPA_SERVICE_KEY }
    });
    if (!bizResp.ok) return res.status(500).json({ error: 'Business lookup failed' });
    const businesses = await bizResp.json();
    if (!businesses.length) return res.status(404).json({ error: 'Business not found' });
    const ownerId = businesses[0].owner_id;

    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${ownerId}`, {
      headers: { 'Authorization': `Bearer ${SUPA_SERVICE_KEY}`, 'apikey': SUPA_SERVICE_KEY }
    });
    if (!userResp.ok) return res.status(404).json({ error: 'User not found' });
    const user = await userResp.json();
    const sub = user.user_metadata?.dashboard_subscription;
    if (!sub) return res.status(400).json({ error: 'No subscription found' });

    await updateUserMeta(user.id, {
      ...user.user_metadata,
      dashboard_subscription: { ...sub, status: 'cancelled', cancelled: true, cancelled_at: new Date().toISOString() }
    });
    console.log(`Dashboard cancelled via billing: ${user.email}`);
    res.json({ success: true, access_until: sub.current_period_end });
  } catch (err) { console.error('Cancel error:', err); res.status(500).json({ error: 'Internal error' }); }
});

// Get subscription status (from BillingPage)
app.get('/api/subscription/:bizId', async (req, res) => {
  try {
    const bizResp = await fetch(`${SUPABASE_URL}/rest/v1/businesses?id=eq.${req.params.bizId}&select=owner_id`, {
      headers: { 'Authorization': `Bearer ${SUPA_SERVICE_KEY}`, 'apikey': SUPA_SERVICE_KEY }
    });
    if (!bizResp.ok) return res.json({ subscription: null });
    const businesses = await bizResp.json();
    if (!businesses.length) return res.json({ subscription: null });

    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${businesses[0].owner_id}`, {
      headers: { 'Authorization': `Bearer ${SUPA_SERVICE_KEY}`, 'apikey': SUPA_SERVICE_KEY }
    });
    if (!userResp.ok) return res.json({ subscription: null });
    const user = await userResp.json();
    const sub = user.user_metadata?.dashboard_subscription;
    if (!sub) return res.json({ subscription: null });

    const now = new Date();
    const end = new Date(sub.current_period_end);
    res.json({ subscription: { ...sub, active: sub.status === 'active' && end > now } });
  } catch (err) { res.json({ subscription: null }); }
});

// Dashboard Checkout - Square Payment Link for $39/month (fallback for non-logged-in users)
app.post('/api/dashboard/checkout', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const SQUARE_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
    const SQUARE_LOCATION = process.env.SQUARE_LOCATION_ID;
    if (!SQUARE_TOKEN || !SQUARE_LOCATION) return res.status(503).json({ error: 'Payment system not configured' });
    const idempotencyKey = `dash_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const body = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: SQUARE_LOCATION,
        line_items: [{ name: 'Solis OS Dashboard — Monthly Subscription', quantity: '1', base_price_money: { amount: 3900, currency: 'AUD' } }],
      },
      checkout_options: { redirect_url: `https://app.solis-os.com/?payment=success&product=dashboard&email=${encodeURIComponent(email)}` },
      pre_populated_data: { buyer_email: email },
    };
    const resp = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SQUARE_TOKEN}`, 'Content-Type': 'application/json', 'Square-Version': '2024-12-18' },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (!resp.ok) { console.error('Dashboard checkout error:', JSON.stringify(data)); return res.status(500).json({ error: 'Payment link creation failed', details: data.errors }); }
    const link = data.payment_link || {};
    res.json({ checkout_url: link.long_url || link.url || '', order_id: link.order_id || '' });
  } catch (err) { console.error('Dashboard checkout error:', err); res.status(500).json({ error: 'Internal error' }); }
});

// Dashboard Activate - After successful payment
app.post('/api/dashboard/activate', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await findSupabaseUser(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 1);
    const ok = await updateUserMeta(user.id, {
      ...user.user_metadata,
      dashboard_subscription: {
        status: 'active',
        start: now.toISOString(),
        current_period_end: end.toISOString(),
        cancelled: false
      }
    });
    if (!ok) return res.status(500).json({ error: 'Activation failed' });
    console.log(`Dashboard activated: ${email} (expires: ${end.toISOString()})`);
    sendReceiptEmail(email, 'Dashboard', '$39', end.toISOString()).catch(() => {});
    res.json({ success: true, subscription: { status: 'active', current_period_end: end.toISOString() } });
  } catch (err) { console.error('Dashboard activate error:', err); res.status(500).json({ error: 'Internal error' }); }
});

// Dashboard Subscription Status
app.get('/api/dashboard/subscription-status/:email', async (req, res) => {
  try {
    const user = await findSupabaseUser(req.params.email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const sub = user.user_metadata?.dashboard_subscription;
    if (!sub) return res.json({ subscribed: false });
    const now = new Date();
    const end = new Date(sub.current_period_end);
    const active = sub.status === 'active' && end > now;
    res.json({ subscribed: active, subscription: sub });
  } catch (err) { res.status(500).json({ error: 'Check failed' }); }
});

// Dashboard Cancel Subscription
app.post('/api/dashboard/cancel-subscription', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await findSupabaseUser(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const sub = user.user_metadata?.dashboard_subscription;
    if (!sub) return res.status(400).json({ error: 'No active subscription' });
    const ok = await updateUserMeta(user.id, {
      ...user.user_metadata,
      dashboard_subscription: {
        ...sub,
        status: 'cancelled',
        cancelled: true,
        cancelled_at: new Date().toISOString()
      }
    });
    if (!ok) return res.status(500).json({ error: 'Cancellation failed' });
    console.log(`Dashboard cancelled: ${email} (access until: ${sub.current_period_end})`);
    sendCancelEmail(email, 'Dashboard', sub.current_period_end).catch(() => {});
    res.json({ success: true, access_until: sub.current_period_end });
  } catch (err) { console.error('Cancel error:', err); res.status(500).json({ error: 'Internal error' }); }
});

// ── Business Email Configuration ────────────────────────────────
app.get('/api/email-config/:businessId', (req, res) => {
  const configs = loadEmailConfigs();
  const cfg = configs[req.params.businessId];
  if (!cfg) return res.json({ configured: false });
  res.json({
    configured: true,
    provider: cfg.provider,
    email: cfg.email,
    smtp_host: cfg.smtp_host || '',
    smtp_port: cfg.smtp_port || '',
    password_set: !!cfg.password,
  });
});

app.post('/api/email-config/:businessId', (req, res) => {
  const { provider, email, password, smtp_host, smtp_port } = req.body;
  if (!provider || !email) {
    return res.status(400).json({ error: 'Provider and email are required' });
  }
  if (provider === 'custom' && !smtp_host) {
    return res.status(400).json({ error: 'SMTP host is required for custom provider' });
  }
  const configs = loadEmailConfigs();
  const existing = configs[req.params.businessId];
  const actualPassword = (password === '__KEEP__' && existing) ? existing.password : password;
  if (!actualPassword) {
    return res.status(400).json({ error: 'Password is required' });
  }
  configs[req.params.businessId] = {
    provider, email, password: actualPassword,
    smtp_host: smtp_host || '',
    smtp_port: smtp_port || '587',
    updated_at: new Date().toISOString(),
  };
  saveEmailConfigs(configs);
  console.log(`Email config saved for business ${req.params.businessId}: ${provider} / ${email}`);
  res.json({ success: true });
});

app.delete('/api/email-config/:businessId', (req, res) => {
  const configs = loadEmailConfigs();
  delete configs[req.params.businessId];
  saveEmailConfigs(configs);
  console.log(`Email config removed for business ${req.params.businessId}`);
  res.json({ success: true });
});

app.post('/api/email-config/:businessId/test', async (req, res) => {
  const { test_to } = req.body;
  const configs = loadEmailConfigs();
  const cfg = configs[req.params.businessId];
  if (!cfg) return res.status(400).json({ error: 'No email configuration found. Save your settings first.' });

  try {
    const transporter = createBusinessTransporter(cfg);
    await transporter.sendMail({
      from: `Test <${cfg.email}>`,
      to: test_to || cfg.email,
      subject: 'Solis OS - Email Test',
      html: `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:500px;margin:0 auto;padding:32px">
        <h2 style="color:#1A1D2E;margin:0 0 12px">Email Configuration Working</h2>
        <p style="color:#6B7280;font-size:15px;line-height:1.7">Your invoice emails will now be sent from <strong>${cfg.email}</strong>.</p>
        <p style="color:#9CA3AF;font-size:13px;margin-top:20px">This is a test email from Solis OS.</p>
      </div>`,
    });
    console.log(`Test email sent from ${cfg.email} to ${test_to || cfg.email}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Test email failed:', err.message);
    let hint = 'Check your email and password.';
    if (err.message.includes('Invalid login') || err.message.includes('Authentication')) {
      hint = 'Wrong email or app password. Make sure you are using an App Password, not your regular login password.';
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
      hint = 'Cannot connect to the mail server. Check the SMTP host and port.';
    }
    res.status(400).json({ error: hint });
  }
});

// ── Send Invoice Email (from business name via Solis OS) ────────
app.post('/api/send-invoice-email', async (req, res) => {
  const { to, subject, body, html: customHtml, from_name, reply_to, invoice_image, invoice_number, total_amount, customer_name, business_id } = req.body;
  if (!to || !subject) return res.status(400).json({ error: 'to and subject required' });

  try {
    let transporter, senderEmail, senderName;
    const bizEmailConfig = business_id ? loadEmailConfigs()[business_id] : null;

    if (bizEmailConfig) {
      transporter = createBusinessTransporter(bizEmailConfig);
      senderEmail = bizEmailConfig.email;
      senderName = from_name || 'Invoice';
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'solis.os.support@gmail.com', pass: 'adndusbhftozhoyw' },
      });
      senderEmail = 'solis.os.support@gmail.com';
      senderName = from_name ? `${from_name} via Solis OS` : 'Solis OS';
    }

    const mailOptions = {
      from: `${senderName} <${senderEmail}>`,
      replyTo: bizEmailConfig ? undefined : (reply_to || undefined),
      to,
      subject,
      attachments: [],
    };

    if (invoice_image) {
      let pdfBuffer;
      try {
        const { PDFDocument } = require('pdf-lib');
        const pdfDoc = await PDFDocument.create();
        const imgBuffer = Buffer.from(invoice_image, 'base64');
        const pngImage = await pdfDoc.embedPng(imgBuffer);
        const { width: imgW, height: imgH } = pngImage.scale(1);
        const pageW = 612, pageH = 792;
        const margin = 30;
        const availW = pageW - margin * 2, availH = pageH - margin * 2;
        const scale = Math.min(availW / imgW, availH / imgH, 1);
        const drawW = imgW * scale, drawH = imgH * scale;
        const page = pdfDoc.addPage([pageW, pageH]);
        page.drawImage(pngImage, {
          x: (pageW - drawW) / 2,
          y: pageH - margin - drawH,
          width: drawW,
          height: drawH,
        });
        pdfBuffer = Buffer.from(await pdfDoc.save());
      } catch (pdfErr) {
        console.error('PDF generation failed, sending as image:', pdfErr.message);
        pdfBuffer = null;
      }

      if (pdfBuffer) {
        mailOptions.attachments.push({
          filename: `Invoice-${invoice_number || 'document'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        });
      } else {
        mailOptions.attachments.push({
          filename: `Invoice-${invoice_number || 'document'}.png`,
          content: Buffer.from(invoice_image, 'base64'),
          contentType: 'image/png',
        });
      }

      const bizName = from_name || 'Your service provider';
      mailOptions.html = `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
        <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700">Invoice from ${bizName}</h1>
        </div>
        <div style="padding:32px;border:1px solid #E8E9EF;border-top:none;border-radius:0 0 12px 12px">
          <p style="color:#1A1D2E;font-size:16px;margin:0 0 16px">Hi${customer_name ? ' ' + customer_name : ''},</p>
          <p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 20px">Please find your invoice <strong style="color:#1A1D2E">${invoice_number || ''}</strong>${total_amount ? ' for <strong style="color:#1A1D2E">' + total_amount + '</strong>' : ''} attached as a PDF.</p>
          <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:16px;margin:0 0 20px">
            <p style="color:#92400E;font-size:14px;margin:0;font-weight:600">The invoice PDF is attached to this email. You can download and print it directly.</p>
          </div>
          <p style="color:#6B7280;font-size:14px;line-height:1.6;margin:0">If you have any questions about this invoice, please reply to this email or contact us directly.</p>
          <div style="border-top:1px solid #E8E9EF;padding-top:16px;margin-top:24px">
            <p style="color:#9CA3AF;font-size:12px;margin:0">${bizEmailConfig ? `Sent by ${bizName}` : 'Sent via Solis OS'}</p>
          </div>
        </div>
      </div>`;
    } else {
      mailOptions.html = customHtml || `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px"><pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;color:#1a1a1a;line-height:1.7">${(body || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre><hr style="border:none;border-top:1px solid #E8E9EF;margin:24px 0"><p style="color:#9CA3AF;font-size:12px">${bizEmailConfig ? `Sent by ${from_name || 'Business'}` : 'Sent via Solis OS'}</p></div>`;
    }

    await transporter.sendMail(mailOptions);
    console.log(`Invoice email sent: ${senderName} -> ${to} (${subject})${invoice_image ? ' [PDF attached]' : ''}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Invoice email error:', err.message);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

// ── Email Transporter ───────────────────────────────────────────

let GITHUB_EMAIL_TOKEN = process.env.GITHUB_EMAIL_TOKEN || '';
if (!GITHUB_EMAIL_TOKEN) { try { GITHUB_EMAIL_TOKEN = fs.readFileSync(path.join(__dirname, '.email_token'), 'utf8').trim(); } catch {} }
const EMAIL_RELAY_REPO = 'anirudhatalmale6-alt/solis-email-relay';

async function sendEmailViaRelay(to, subject, html) {
  if (!GITHUB_EMAIL_TOKEN) {
    console.error('GITHUB_EMAIL_TOKEN not set, cannot send email');
    return;
  }
  try {
    const resp = await fetch(`https://api.github.com/repos/${EMAIL_RELAY_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_EMAIL_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'send-email',
        client_payload: { to, subject, html },
      }),
    });
    if (resp.status === 204) {
      console.log(`Email relay triggered: ${to} — ${subject}`);
    } else {
      console.error(`Email relay error: HTTP ${resp.status}`);
    }
  } catch (err) {
    console.error(`Email relay failed: ${err.message}`);
  }
}

// ── Receipt Emails ──────────────────────────────────────────────

async function sendReceiptEmail(to, product, amount, nextDate) {
  const dateStr = new Date(nextDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
  const cycle = product === 'POS' ? 'Yearly' : 'Monthly';
  const subject = `Payment Confirmation — Solis OS ${product}`;
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff"><div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:40px 32px;text-align:center;border-radius:16px 16px 0 0"><img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:48px;margin:0 auto 16px"><h1 style="color:#fff;font-size:26px;margin:0;font-weight:700">Payment Successful</h1><p style="color:rgba(255,255,255,0.9);font-size:15px;margin:8px 0 0">Thank you for your subscription</p></div><div style="padding:36px 32px;border:1px solid #E8E9EF;border-top:none;border-radius:0 0 16px 16px"><p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 24px">Your payment has been processed successfully. Here are your subscription details:</p><div style="background:#F7F8FC;border-radius:12px;padding:24px;margin:0 0 24px"><table style="width:100%;border-collapse:collapse"><tr><td style="padding:10px 0;color:#9CA3AF;font-size:14px;border-bottom:1px solid #E8E9EF">Product</td><td style="padding:10px 0;text-align:right;font-weight:700;font-size:14px;color:#1A1D2E;border-bottom:1px solid #E8E9EF">Solis OS ${product}</td></tr><tr><td style="padding:10px 0;color:#9CA3AF;font-size:14px;border-bottom:1px solid #E8E9EF">Amount Paid</td><td style="padding:10px 0;text-align:right;font-weight:700;font-size:14px;color:#1A1D2E;border-bottom:1px solid #E8E9EF">${amount} AUD</td></tr><tr><td style="padding:10px 0;color:#9CA3AF;font-size:14px;border-bottom:1px solid #E8E9EF">Billing Cycle</td><td style="padding:10px 0;text-align:right;font-weight:600;font-size:14px;color:#1A1D2E;border-bottom:1px solid #E8E9EF">${cycle}</td></tr><tr><td style="padding:10px 0;color:#9CA3AF;font-size:14px;border-bottom:1px solid #E8E9EF">Next ${product === 'POS' ? 'Renewal' : 'Billing'} Date</td><td style="padding:10px 0;text-align:right;font-weight:600;font-size:14px;color:#1A1D2E;border-bottom:1px solid #E8E9EF">${dateStr}</td></tr><tr><td style="padding:10px 0;color:#9CA3AF;font-size:14px">Account</td><td style="padding:10px 0;text-align:right;font-size:14px;color:#1A1D2E">${to}</td></tr></table></div><div style="background:linear-gradient(135deg,#ECFDF5,#D1FAE5);border-radius:12px;padding:16px 20px;margin:0 0 24px;border:1px solid #A7F3D0"><p style="color:#065F46;font-size:14px;margin:0"><strong>&#10003; Your subscription is now active.</strong> You have full access to all ${product} features.</p></div><p style="color:#6B7280;font-size:14px;line-height:1.7;margin:0 0 8px">You can manage your subscription anytime from ${product === 'Dashboard' ? 'Settings in your dashboard' : 'solis-os.com'}.</p><p style="color:#6B7280;font-size:14px;line-height:1.7;margin:0 0 24px">Questions? Email us at solis.os.support@gmail.com or WhatsApp us at <strong>+44 7700 168964</strong>.</p><div style="border-top:1px solid #E8E9EF;padding-top:20px"><table style="width:100%"><tr><td><img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:24px"></td><td style="text-align:right"><a href="https://solis-os.com" style="color:#d97706;font-size:13px;text-decoration:none">solis-os.com</a></td></tr></table><p style="color:#9CA3AF;font-size:12px;margin:12px 0 0">Solis OS Pty Ltd | This is an automated payment confirmation. Please keep this email for your records.</p></div></div></div>`;
  sendEmailViaRelay(to, subject, html);
}

async function sendWelcomeEmail(to, name, product) {
  const isPos = product === 'POS';
  const isCustomer = product === 'Customer';
  const trialDays = isPos ? '10' : '14';
  let features;
  if (isPos) {
    features = '<p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Scan barcodes and process sales</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Manage your inventory in real-time</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Track sales reports and analytics</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Print or email receipts</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Multi-staff PIN login</p>';
  } else if (isCustomer) {
    features = '<p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Browse and discover businesses near you</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Book appointments in seconds</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Track your upcoming bookings</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Get reminders before your appointments</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Leave reviews for businesses you visit</p>';
  } else {
    features = '<p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Manage bookings and schedule</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; AI WhatsApp assistant for your customers</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Customer management and CRM</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Invoices, reports, and analytics</p><p style="color:#92400E;font-size:14px;margin:4px 0">&#10003; Marketing campaigns and promo codes</p>';
  }
  const link = isPos ? 'https://solis-os.com/app/' : (isCustomer ? 'https://app.solis-os.com/explore' : 'https://app.solis-os.com');
  const heroSubtitle = isCustomer ? 'Your booking account is ready' : 'Your business management platform is ready';
  const subject = isCustomer ? 'Welcome to Solis OS!' : `Welcome to Solis OS ${product}!`;
  const buttonText = isCustomer ? 'Explore Businesses' : `Open Your ${product}`;
  const helpText = isCustomer ? 'We are here to help you find and book services.' : 'We are here to help you set up your business.';
  const trialLine = isCustomer ? `Your account is ready. Start browsing businesses and booking appointments right away.` : `Your Solis OS ${product} account has been created successfully. You now have a <strong style="color:#1A1D2E">${trialDays}-day free trial</strong> with full access to every feature.`;
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff"><div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:40px 32px;text-align:center;border-radius:16px 16px 0 0"><img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:48px;margin:0 auto 16px"><h1 style="color:#fff;font-size:26px;margin:0;font-weight:700">Welcome to Solis OS!</h1><p style="color:rgba(255,255,255,0.9);font-size:15px;margin:8px 0 0">${heroSubtitle}</p></div><div style="padding:36px 32px;border:1px solid #E8E9EF;border-top:none;border-radius:0 0 16px 16px"><p style="color:#1A1D2E;font-size:17px;font-weight:600;margin:0 0 12px">Hi ${name},</p><p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 20px">${trialLine}</p><div style="background:linear-gradient(135deg,#FFFBEB,#FEF3C7);border-radius:12px;padding:24px;margin:0 0 24px;border:1px solid #FDE68A"><p style="color:#92400E;font-size:14px;font-weight:600;margin:0 0 12px">Here is what you can do:</p>${features}</div><a href="${link}" style="display:block;text-align:center;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:0 0 24px;box-shadow:0 4px 12px rgba(245,158,11,0.3)">${buttonText}</a><div style="background:#F7F8FC;border-radius:12px;padding:20px;margin:0 0 24px"><p style="color:#1A1D2E;font-size:14px;font-weight:600;margin:0 0 8px">Need help getting started?</p><p style="color:#6B7280;font-size:14px;margin:0;line-height:1.6">Email us at solis.os.support@gmail.com or message us on WhatsApp at <strong>+44 7700 168964</strong>. ${helpText}</p></div><div style="border-top:1px solid #E8E9EF;padding-top:20px"><table style="width:100%"><tr><td><img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:24px"></td><td style="text-align:right"><a href="https://solis-os.com" style="color:#d97706;font-size:13px;text-decoration:none">solis-os.com</a></td></tr></table><p style="color:#9CA3AF;font-size:12px;margin:12px 0 0">Solis OS Pty Ltd | You are receiving this email because you created an account on Solis OS.</p></div></div></div>`;
  sendEmailViaRelay(to, subject, html);
}

async function sendCancelEmail(to, product, endDate) {
  const dateStr = new Date(endDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
  const subject = `Subscription Cancelled — Solis OS ${product}`;
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff"><div style="background:linear-gradient(135deg,#1A1D2E,#374151);padding:40px 32px;text-align:center;border-radius:16px 16px 0 0"><img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:48px;margin:0 auto 16px"><h1 style="color:#fff;font-size:26px;margin:0;font-weight:700">Subscription Cancelled</h1><p style="color:rgba(255,255,255,0.7);font-size:15px;margin:8px 0 0">We are sorry to see you go</p></div><div style="padding:36px 32px;border:1px solid #E8E9EF;border-top:none;border-radius:0 0 16px 16px"><p style="color:#6B7280;font-size:15px;line-height:1.7;margin:0 0 20px">Your Solis OS ${product} subscription has been cancelled as requested.</p><div style="background:#FEF3C7;border-radius:12px;padding:20px;margin:0 0 24px;border:1px solid #FDE68A"><p style="color:#92400E;font-size:15px;margin:0;font-weight:700">&#9888; You still have access until ${dateStr}</p><p style="color:#92400E;font-size:13px;margin:8px 0 0">After this date, your dashboard will be locked. Your data will be safely stored and available if you resubscribe.</p></div><div style="background:#F7F8FC;border-radius:12px;padding:20px;margin:0 0 24px"><p style="color:#1A1D2E;font-size:14px;font-weight:600;margin:0 0 8px">What happens next?</p><p style="color:#6B7280;font-size:14px;margin:4px 0">&#8226; Your data remains safe and secure</p><p style="color:#6B7280;font-size:14px;margin:4px 0">&#8226; You can resubscribe anytime to restore access</p><p style="color:#6B7280;font-size:14px;margin:4px 0">&#8226; No further charges will be made</p></div><a href="${product === 'Dashboard' ? 'https://app.solis-os.com/billing' : 'https://solis-os.com'}" style="display:block;text-align:center;background:#F7F8FC;color:#1A1D2E;padding:14px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;margin:0 0 24px;border:1px solid #E8E9EF">Changed your mind? Resubscribe</a><p style="color:#6B7280;font-size:14px;line-height:1.7;margin:0 0 24px">If you have any feedback on how we can improve, we would love to hear from you. WhatsApp us at <strong>+44 7700 168964</strong>.</p><div style="border-top:1px solid #E8E9EF;padding-top:20px"><table style="width:100%"><tr><td><img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:24px"></td><td style="text-align:right"><a href="https://solis-os.com" style="color:#d97706;font-size:13px;text-decoration:none">solis-os.com</a></td></tr></table><p style="color:#9CA3AF;font-size:12px;margin:12px 0 0">Solis OS Pty Ltd | This is a confirmation of your cancellation request.</p></div></div></div>`;
  sendEmailViaRelay(to, subject, html);
}

// Test receipt email (admin only)
app.post('/api/test-receipt', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    console.log(`Sending test receipt to ${email}...`);
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    await sendReceiptEmail(email, 'Dashboard', '$39', nextDate.toISOString());
    res.json({ success: true, message: 'Test receipt sent' });
  } catch (err) {
    console.error('Test receipt error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POS Cancel Subscription
app.post('/api/pos/cancel-subscription', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const map = loadSyncMap();
    const syncCode = map[email.toLowerCase()];
    if (!syncCode) return res.status(404).json({ error: 'No account found with this email.' });
    const filePath = path.join(POS_DATA_DIR, `${syncCode}.json`);
    let payload = {};
    try { payload = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch {}
    if (!payload.settings || !payload.settings.purchased) return res.status(400).json({ error: 'No active subscription found for this email.' });
    payload.settings.cancelled = true;
    payload.settings.cancelledAt = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(payload));
    console.log(`POS cancelled: ${email} (access until: ${payload.settings.subscriptionEnd})`);
    sendCancelEmail(email, 'POS', payload.settings.subscriptionEnd || new Date().toISOString()).catch(() => {});
    res.json({ success: true, access_until: payload.settings.subscriptionEnd || null });
  } catch (err) { console.error('POS cancel error:', err); res.status(500).json({ error: 'Internal error' }); }
});

// ── Subscription Renewal Reminders ──────────────────────────────

async function sendRenewalEmail(to, product, daysLeft, renewalDate) {
  const dateStr = new Date(renewalDate).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
  const subject = `Your Solis OS ${product} subscription renews in ${daysLeft} days`;
  const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px"><img src="https://solis-os.com/assets/logo.png" alt="Solis OS" style="height:40px;margin-bottom:20px"><h2 style="color:#1A1D2E">Subscription Renewal Reminder</h2><p style="color:#6B7280;line-height:1.7">Hi there,</p><p style="color:#6B7280;line-height:1.7">Your <strong>Solis OS ${product}</strong> subscription will renew on <strong>${dateStr}</strong> (${daysLeft} days from now).</p><p style="color:#6B7280;line-height:1.7">${product === 'POS' ? 'The annual renewal fee is $239 AUD.' : 'The monthly fee is $39 AUD.'}</p><p style="color:#6B7280;line-height:1.7">If you wish to continue using the service, no action is needed. If you would like to cancel, please ${product === 'Dashboard' ? 'go to Settings in your dashboard' : 'visit solis-os.com and use the cancel form'}.</p><p style="color:#6B7280;line-height:1.7">Thank you for using Solis OS!</p><p style="color:#9CA3AF;font-size:13px;margin-top:30px;border-top:1px solid #E8E9EF;padding-top:15px">Solis OS | <a href="https://solis-os.com" style="color:#d97706">solis-os.com</a></p></div>`;
  sendEmailViaRelay(to, subject, html);
}

// ── Automated Booking Reminders ─────────────────────────────────

const REMINDER_CONFIG_FILE = path.join(__dirname, 'reminder_configs.json');
function loadReminderConfigs() { try { return JSON.parse(fs.readFileSync(REMINDER_CONFIG_FILE, 'utf8')); } catch { return {}; } }
function saveReminderConfigs(c) { fs.writeFileSync(REMINDER_CONFIG_FILE, JSON.stringify(c, null, 2)); }

app.post('/api/reminders/config', (req, res) => {
  try {
    const { businessId, reminder_enabled, reminder_hours, followup_enabled, followup_hours, review_request } = req.body;
    if (!businessId) return res.status(400).json({ error: 'businessId required' });
    const configs = loadReminderConfigs();
    configs[businessId] = { reminder_enabled, reminder_hours, followup_enabled, followup_hours, review_request, updated_at: new Date().toISOString() };
    saveReminderConfigs(configs);
    console.log(`Reminder config saved for business ${businessId}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to save' }); }
});

app.get('/api/reminders/config/:businessId', (req, res) => {
  try {
    const configs = loadReminderConfigs();
    const config = configs[req.params.businessId] || { reminder_enabled: false, reminder_hours: 24, followup_enabled: false, followup_hours: 2, review_request: false };
    res.json(config);
  } catch (err) { res.json({ reminder_enabled: false, reminder_hours: 24, followup_enabled: false, followup_hours: 2, review_request: false }); }
});

const REMINDER_LOG = path.join(__dirname, 'reminder_log.json');
function loadReminderLog() { try { return JSON.parse(fs.readFileSync(REMINDER_LOG, 'utf8')); } catch { return {}; } }
function saveReminderLog(log) { fs.writeFileSync(REMINDER_LOG, JSON.stringify(log)); }

async function checkRenewals() {
  const log = loadReminderLog();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // Check POS subscriptions
  try {
    const map = loadSyncMap();
    for (const [email, syncCode] of Object.entries(map)) {
      const filePath = path.join(POS_DATA_DIR, `${syncCode}.json`);
      let payload = {};
      try { payload = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { continue; }
      const end = payload.settings?.subscriptionEnd;
      if (!end || !payload.settings?.purchased) continue;
      const endDate = new Date(end);
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      if (daysLeft >= 13 && daysLeft <= 15) {
        const key = `pos_${email}_${today}`;
        if (!log[key]) {
          await sendRenewalEmail(email, 'POS', daysLeft, end);
          log[key] = true;
          saveReminderLog(log);
        }
      }
    }
  } catch (err) { console.error('POS renewal check error:', err.message); }

  // Check Dashboard subscriptions — reminders + auto-renewal
  try {
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=500`, {
      headers: { 'Authorization': `Bearer ${SUPA_SERVICE_KEY}`, 'apikey': SUPA_SERVICE_KEY }
    });
    if (resp.ok) {
      const data = await resp.json();
      for (const user of (data.users || [])) {
        const sub = user.user_metadata?.dashboard_subscription;
        if (!sub || sub.cancelled) continue;
        const endDate = new Date(sub.current_period_end);
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        // Send reminder 5-7 days before renewal
        if (sub.status === 'active' && daysLeft >= 5 && daysLeft <= 7) {
          const key = `dash_${user.email}_${today}`;
          if (!log[key]) {
            await sendRenewalEmail(user.email, 'Dashboard', daysLeft, sub.current_period_end);
            log[key] = true;
            saveReminderLog(log);
          }
        }

        // Auto-renew if period ended and card on file
        if (sub.status === 'active' && endDate <= now && sub.square_card_id && sub.square_customer_id) {
          const renewKey = `dash_renew_${user.email}_${today}`;
          if (!log[renewKey]) {
            try {
              const SQUARE_LOCATION = process.env.SQUARE_LOCATION_ID;
              const payData = await squareRequest('/payments', {
                idempotency_key: `renew_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
                source_id: sub.square_card_id,
                amount_money: { amount: DASHBOARD_PRICE, currency: 'AUD' },
                customer_id: sub.square_customer_id,
                location_id: SQUARE_LOCATION,
                note: 'Solis OS Dashboard — Monthly Renewal',
                autocomplete: true,
                receipt_email: user.email,
                receipt_url: 'https://solis-os.com',
              });
              if (!payData.errors) {
                const newEnd = new Date(now);
                newEnd.setMonth(newEnd.getMonth() + 1);
                await updateUserMeta(user.id, {
                  ...user.user_metadata,
                  dashboard_subscription: { ...sub, current_period_end: newEnd.toISOString() }
                });
                console.log(`Dashboard auto-renewed: ${user.email} (until ${newEnd.toISOString()}) — Square receipt sent`);
              } else {
                console.error(`Dashboard renewal payment failed for ${user.email}:`, payData.errors[0]?.detail);
                await updateUserMeta(user.id, {
                  ...user.user_metadata,
                  dashboard_subscription: { ...sub, status: 'past_due' }
                });
              }
              log[renewKey] = true;
              saveReminderLog(log);
            } catch (err) { console.error(`Dashboard renewal error for ${user.email}:`, err.message); }
          }
        }
      }
    }
  } catch (err) { console.error('Dashboard renewal check error:', err.message); }
}

setInterval(checkRenewals, 6 * 60 * 60 * 1000);
setTimeout(checkRenewals, 30000);

const BOOKING_REMINDER_LOG = path.join(__dirname, 'booking_reminder_log.json');
function loadBookingReminderLog() { try { return JSON.parse(fs.readFileSync(BOOKING_REMINDER_LOG, 'utf8')); } catch { return {}; } }
function saveBookingReminderLog(l) { fs.writeFileSync(BOOKING_REMINDER_LOG, JSON.stringify(l)); }

async function checkBookingReminders() {
  const configs = loadReminderConfigs();
  const log = loadBookingReminderLog();
  const now = new Date();
  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joeklgpncbrhnujzdzsp.supabase.co';
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZWtsZ3BuY2JyaG51anpkenNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDU4OSwiZXhwIjoyMDkzOTI2NTg5fQ.qSjr5JCxcw0wzl3_IypMMxWQhFl5FJ4IskiH04YPmiI';

  for (const [bizId, config] of Object.entries(configs)) {
    if (!config.reminder_enabled && !config.followup_enabled) continue;
    try {
      const today = now.toISOString().slice(0, 10);
      const tomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/bookings?business_id=eq.${bizId}&date=gte.${today}&date=lte.${tomorrow}&status=eq.confirmed`, {
        headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
      });
      if (!resp.ok) continue;
      const bookings = await resp.json();

      for (const bk of bookings) {
        if (!bk.customer_phone || !bk.date || !bk.time) continue;
        const bookingTime = new Date(`${bk.date}T${bk.time}`);
        const hoursUntil = (bookingTime - now) / (1000 * 60 * 60);

        if (config.reminder_enabled && hoursUntil > 0 && hoursUntil <= config.reminder_hours) {
          const key = `reminder_${bk.id}`;
          if (!log[key]) {
            const timeStr = bookingTime.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true });
            const dateStr = bookingTime.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' });
            const msg = `Hi ${bk.customer_name}! This is a friendly reminder about your upcoming appointment:\n\n${bk.service_name || bk.notes || 'Your appointment'}\n${dateStr} at ${timeStr}\n\nSee you soon!`;
            const phone = bk.customer_phone.replace(/[^0-9]/g, '');
            try {
              const sendResp = await fetch('http://127.0.0.1:3003/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ business_id: bizId, phone, message: msg }),
              });
              const sendResult = await sendResp.json();
              if (!sendResult.success && !sendResult.messageId) throw new Error(sendResult.error || 'Send failed');
              log[key] = new Date().toISOString();
              saveBookingReminderLog(log);
              console.log(`Booking reminder sent to ${bk.customer_name} (${phone}) via Baileys`);
            } catch (e) { console.error('Reminder send failed:', e.message); }
          }
        }

        if (config.followup_enabled && hoursUntil < -1 * config.followup_hours) {
          const key = `followup_${bk.id}`;
          if (!log[key]) {
            const msg = `Hi ${bk.customer_name}! Thank you for visiting us today. We hope you had a great experience! If you have a moment, we would love to hear your feedback.`;
            const phone = bk.customer_phone.replace(/[^0-9]/g, '');
            try {
              const sendResp = await fetch('http://127.0.0.1:3003/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ business_id: bizId, phone, message: msg }),
              });
              const sendResult = await sendResp.json();
              if (!sendResult.success && !sendResult.messageId) throw new Error(sendResult.error || 'Send failed');
              log[key] = new Date().toISOString();
              saveBookingReminderLog(log);
              console.log(`Followup sent to ${bk.customer_name} (${phone}) via Baileys`);
            } catch (e) { console.error('Followup send failed:', e.message); }
          }
        }
      }
    } catch (err) { console.error(`Booking reminder error for ${bizId}:`, err.message); }
  }
}

setInterval(checkBookingReminders, 5 * 60 * 1000);
setTimeout(checkBookingReminders, 60000);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Solis OS Chatbot running on port ${PORT}`);
  });
}

module.exports = app;
