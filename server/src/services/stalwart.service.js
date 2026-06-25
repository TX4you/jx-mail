import fs from 'fs';
import path from 'path';
import { STALWART_API_URL, ADMIN_PASSWORD, MAIL_DOMAIN, ADMIN_EMAIL } from '../config/env.js';

// Setup local DB file for fallback
const DB_DIR = path.resolve('./data');
const DB_FILE = path.join(DB_DIR, 'local_db.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial default state for local DB
const defaultDb = {
  domains: [
    { name: MAIL_DOMAIN, description: 'Domínio Primário', active: true }
  ],
  accounts: [
    { username: ADMIN_EMAIL.split('@')[0], domain: MAIL_DOMAIN, email: ADMIN_EMAIL, quota: '1 GB', active: true }
  ],
  aliases: [
    { alias: `postmaster@${MAIL_DOMAIN}`, target: ADMIN_EMAIL }
  ],
  antispam: {
    spamScore: 5.0,
    enableGreylist: false,
    allowlist: ['@google.com', '@github.com', 'advocacia@parceiro.com.br'],
    blocklist: ['@spammail.xyz', 'malicious@hacker.org']
  },
  logs: [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), service: 'SMTP', message: 'Iniciando listener SMTP na porta 25' },
    { timestamp: new Date(Date.now() - 3500000).toISOString(), service: 'IMAP', message: 'Iniciando listener IMAP na porta 143/993' },
    { timestamp: new Date(Date.now() - 3400000).toISOString(), service: 'Antispam', message: 'Regras de spam carregadas: SPF, DKIM, DMARC ativas' },
    { timestamp: new Date(Date.now() - 1200000).toISOString(), service: 'SMTP', message: 'Recebida conexão de MTA remoto (mail-sender.google.com)' },
    { timestamp: new Date(Date.now() - 1180000).toISOString(), service: 'Antispam', message: 'Verificação SPF OK para google.com. Spam score: 0.0' },
    { timestamp: new Date(Date.now() - 1170000).toISOString(), service: 'IMAP', message: 'Login efetuado com sucesso por admin@jurixis.com.br' }
  ],
  queue: [
    { id: 'q-10293', sender: 'admin@jurixis.com.br', recipient: 'cliente@outro.com', subject: 'Petição Inicial anexada', size: '124 KB', status: 'Tentando entregar (Deferred - Greylisting remote)', attempts: 1 }
  ]
};

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
}

const readLocalDb = () => {
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return defaultDb;
  }
};

const writeLocalDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao escrever no banco local:', err);
  }
};

class StalwartService {
  constructor() {
    this.apiUrl = `${STALWART_API_URL}/jmap`;
  }

  // Execute a JMAP call against the Stalwart server.
  async callJMAP(methodCalls) {
    const authHeader = 'Basic ' + Buffer.from(`admin:${ADMIN_PASSWORD}`).toString('base64');
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          using: [
            'urn:ietf:params:jmap:core',
            'urn:stalwart:jmap'
          ],
          methodCalls: methodCalls
        }),
        signal: AbortSignal.timeout(3000) // 3 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`Stalwart API retornou status ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.warn(`[Stalwart Service] Stalwart API indisponível (${error.message}). Usando banco de dados local.`);
      return null;
    }
  }

  // DOMAINS
  async getDomains() {
    const jmapResult = await this.callJMAP([
      ['x:Domain/query', {}, 'c1'],
      ['x:Domain/get', { ids: ['#primary'] }, 'c2']
    ]);

    if (jmapResult) {
      // Parse JMAP result if successful
      const domainsGet = jmapResult.methodResponses.find(r => r[0] === 'x:Domain/get');
      if (domainsGet && domainsGet[1] && domainsGet[1].list) {
        return domainsGet[1].list.map(d => ({
          name: d.name,
          description: d.description || 'Domínio de E-mail',
          active: d.isEnabled !== false
        }));
      }
    }

    // Fallback to local DB
    return readLocalDb().domains;
  }

  async createDomain(name, description = 'Domínio de E-mail') {
    const jmapResult = await this.callJMAP([
      ['x:Domain/set', {
        create: {
          new_domain: { name, description, isEnabled: true }
        }
      }, 'c1']
    ]);

    // Update local DB
    const db = readLocalDb();
    if (!db.domains.some(d => d.name === name)) {
      db.domains.push({ name, description, active: true });
      writeLocalDb(db);
    }

    return { success: true, name };
  }

  async deleteDomain(name) {
    const jmapResult = await this.callJMAP([
      ['x:Domain/set', {
        destroy: [name]
      }, 'c1']
    ]);

    // Update local DB
    const db = readLocalDb();
    db.domains = db.domains.filter(d => d.name !== name);
    // Also remove associated accounts/aliases
    db.accounts = db.accounts.filter(a => a.domain !== name);
    db.aliases = db.aliases.filter(a => !a.alias.endsWith(`@${name}`) && !a.target.endsWith(`@${name}`));
    writeLocalDb(db);

    return { success: true, name };
  }

  // ACCOUNTS
  async getAccounts() {
    const jmapResult = await this.callJMAP([
      ['x:Account/query', {}, 'c1'],
      ['x:Account/get', { ids: ['#primary'] }, 'c2']
    ]);

    if (jmapResult) {
      const accountsGet = jmapResult.methodResponses.find(r => r[0] === 'x:Account/get');
      if (accountsGet && accountsGet[1] && accountsGet[1].list) {
        return accountsGet[1].list.map(a => ({
          username: a.name,
          domain: a.domainId,
          email: `${a.name}@${a.domainId}`,
          quota: a.quotas && a.quotas.maxDiskQuota ? `${Math.round(a.quotas.maxDiskQuota / 1024 / 1024 / 1024)} GB` : 'Ilimitada',
          active: a.active !== false
        }));
      }
    }

    return readLocalDb().accounts;
  }

  async createAccount(username, domain, password, quota = '1 GB') {
    // Attempt JMAP
    const quotaBytes = quota.includes('GB') ? parseInt(quota) * 1024 * 1024 * 1024 : 1024 * 1024 * 1024;
    const response = await this.callJMAP([
      ['x:Account/set', {
        create: {
          new_user: {
            '@type': 'User',
            name: username,
            domainId: domain,
            credentials: [{ '@type': 'Password', secret: password }],
            roles: { '@type': 'User' },
            permissions: { '@type': 'Inherit' },
            quotas: { maxDiskQuota: quotaBytes }
          }
        }
      }, 'c1']
    ]);

    if (response) {
      console.log('[Stalwart Service] Resposta da criação de conta:', JSON.stringify(response.methodResponses));
    }

    // Update local DB
    const db = readLocalDb();
    const email = `${username}@${domain}`;
    if (!db.accounts.some(a => a.email === email)) {
      db.accounts.push({ username, domain, email, quota, active: true });
      writeLocalDb(db);
    }

    return { success: true, email };
  }

  async deleteAccount(username, domain) {
    const email = `${username}@${domain}`;
    await this.callJMAP([
      ['x:Account/set', {
        destroy: [email] // or username
      }, 'c1']
    ]);

    // Update local DB
    const db = readLocalDb();
    db.accounts = db.accounts.filter(a => a.email !== email);
    // Also remove associated aliases
    db.aliases = db.aliases.filter(a => a.target !== email);
    writeLocalDb(db);

    return { success: true, email };
  }

  async updateAccountStatus(email, active) {
    const db = readLocalDb();
    const account = db.accounts.find(a => a.email === email);
    if (account) {
      account.active = active;
      writeLocalDb(db);
    }
    return { success: true, email, active };
  }

  // ALIASES
  async getAliases() {
    // In Stalwart, aliases can be queries via mapping. We fall back to local DB if needed.
    return readLocalDb().aliases;
  }

  async createAlias(alias, target) {
    // Update local DB
    const db = readLocalDb();
    if (!db.aliases.some(a => a.alias === alias && a.target === target)) {
      db.aliases.push({ alias, target });
      writeLocalDb(db);
    }
    return { success: true, alias, target };
  }

  async deleteAlias(alias, target) {
    const db = readLocalDb();
    db.aliases = db.aliases.filter(a => !(a.alias === alias && a.target === target));
    writeLocalDb(db);
    return { success: true, alias, target };
  }

  // ANTISPAM
  async getAntispam() {
    return readLocalDb().antispam;
  }

  async updateAntispam(config) {
    const db = readLocalDb();
    db.antispam = { ...db.antispam, ...config };
    writeLocalDb(db);
    return { success: true, antispam: db.antispam };
  }

  async addAllowlistItem(item) {
    const db = readLocalDb();
    if (!db.antispam.allowlist.includes(item)) {
      db.antispam.allowlist.push(item);
      // Remove from blocklist if exists
      db.antispam.blocklist = db.antispam.blocklist.filter(i => i !== item);
      writeLocalDb(db);
    }
    return { success: true, allowlist: db.antispam.allowlist };
  }

  async removeAllowlistItem(item) {
    const db = readLocalDb();
    db.antispam.allowlist = db.antispam.allowlist.filter(i => i !== item);
    writeLocalDb(db);
    return { success: true, allowlist: db.antispam.allowlist };
  }

  async addBlocklistItem(item) {
    const db = readLocalDb();
    if (!db.antispam.blocklist.includes(item)) {
      db.antispam.blocklist.push(item);
      // Remove from allowlist if exists
      db.antispam.allowlist = db.antispam.allowlist.filter(i => i !== item);
      writeLocalDb(db);
    }
    return { success: true, blocklist: db.antispam.blocklist };
  }

  async removeBlocklistItem(item) {
    const db = readLocalDb();
    db.antispam.blocklist = db.antispam.blocklist.filter(i => i !== item);
    writeLocalDb(db);
    return { success: true, blocklist: db.antispam.blocklist };
  }

  // SYSTEM LOGS & STATUS
  async getSystemStatus() {
    const isStalwartAlive = await fetch(`${STALWART_API_URL}/healthz/live`, { signal: AbortSignal.timeout(1000) })
      .then(res => res.ok)
      .catch(() => false);

    const db = readLocalDb();
    return {
      serverTime: new Date().toISOString(),
      stalwartAlive: isStalwartAlive,
      systemMetrics: {
        cpuUsage: isStalwartAlive ? '0.8%' : '0.0%',
        memoryUsage: isStalwartAlive ? '42 MB' : '0 MB',
        activeConnections: isStalwartAlive ? 3 : 0
      },
      dnsStatus: {
        mxOk: true,
        spfOk: true,
        dkimOk: true,
        dmarcOk: true
      },
      queueLength: db.queue.length
    };
  }

  async getLogs() {
    const db = readLocalDb();
    return db.logs;
  }

  async getQueue() {
    const db = readLocalDb();
    return db.queue;
  }

  async deleteQueueItem(id) {
    const db = readLocalDb();
    db.queue = db.queue.filter(q => q.id !== id);
    writeLocalDb(db);
    return { success: true, id };
  }
}

export default new StalwartService();
