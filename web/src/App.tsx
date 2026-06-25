import React, { useState, useEffect } from 'react';
import { 
  Mail, Shield, Server, List, Users, Plus, Trash2, LogOut, CheckCircle2, 
  XCircle, RefreshCw, Cpu, HardDrive, Network, Layers, ShieldCheck, 
  ShieldAlert, UserPlus, Sliders, ToggleLeft, ToggleRight, FileText, AlertCircle, Eye, EyeOff
} from 'lucide-react';

// API Fetch Helper
const fetchApi = async (url: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
  }
  
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Erro na requisição');
  }
  return response.json();
};

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync auth state across changes
  useEffect(() => {
    const handleAuth = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('auth-change', handleAuth);
    return () => window.removeEventListener('auth-change', handleAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setSuccess('Sessão encerrada com sucesso.');
  };

  const showNotification = (type: 'error' | 'success', msg: string) => {
    if (type === 'error') {
      setError(msg);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 5000);
    }
  };

  if (!token) {
    return <Login onLoginSuccess={() => setToken(localStorage.getItem('token'))} showNotification={showNotification} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-jurixis-950 text-slate-100 font-sans relative">
      {/* Decorative Blur Spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-blue glow-blur"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-jurixis-500 glow-blur"></div>

      {/* Navigation Sidebar */}
      <aside className="w-64 bg-jurixis-900 border-r border-slate-800 flex flex-col z-10">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-accent-blue/10 p-2 rounded-lg border border-accent-blue/30 text-accent-blue">
            <Mail className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white">jx-mail</h1>
            <p className="text-xs text-slate-400">Servidor Jurixis</p>
          </div>
        </div>

        {/* Menu Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <TabButton active={activeTab === 'dashboard'} icon={<Server className="w-5 h-5" />} label="Dashboard" onClick={() => setActiveTab('dashboard')} />
          <TabButton active={activeTab === 'domains'} icon={<Layers className="w-5 h-5" />} label="Domínios" onClick={() => setActiveTab('domains')} />
          <TabButton active={activeTab === 'accounts'} icon={<Users className="w-5 h-5" />} label="Caixas Postais" onClick={() => setActiveTab('accounts')} />
          <TabButton active={activeTab === 'aliases'} icon={<List className="w-5 h-5" />} label="Aliases / Redirecionamentos" onClick={() => setActiveTab('aliases')} />
          <TabButton active={activeTab === 'antispam'} icon={<Shield className="w-5 h-5" />} label="Segurança & Antispam" onClick={() => setActiveTab('antispam')} />
          <TabButton active={activeTab === 'logs'} icon={<FileText className="w-5 h-5" />} label="Logs e Fila" onClick={() => setActiveTab('logs')} />
        </nav>

        {/* Footer Admin info */}
        <div className="p-4 border-t border-slate-800 bg-jurixis-950/40 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs text-slate-400 font-medium">Administrador</p>
            <p className="text-sm text-slate-200 truncate">{localStorage.getItem('adminEmail') || 'admin@jurixis.com.br'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-colors border border-transparent hover:border-rose-500/20"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden z-10 relative">
        {/* Notifications */}
        {error && (
          <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg backdrop-blur-md shadow-lg transition-all animate-bounce">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-lg backdrop-blur-md shadow-lg transition-all">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab Router Panels */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <DashboardPanel showNotification={showNotification} />}
          {activeTab === 'domains' && <DomainsPanel showNotification={showNotification} />}
          {activeTab === 'accounts' && <AccountsPanel showNotification={showNotification} />}
          {activeTab === 'aliases' && <AliasesPanel showNotification={showNotification} />}
          {activeTab === 'antispam' && <AntispamPanel showNotification={showNotification} />}
          {activeTab === 'logs' && <LogsPanel showNotification={showNotification} />}
        </div>
      </main>
    </div>
  );
}

// Side tab button
function TabButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
        active 
          ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20 shadow-inner' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// LOGIN PANEL
function Login({ onLoginSuccess, showNotification }: { onLoginSuccess: () => void, showNotification: (t: 'error' | 'success', m: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('adminEmail', data.user.email);
      showNotification('success', `Bem-vindo de volta!`);
      onLoginSuccess();
    } catch (err: any) {
      showNotification('error', err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-jurixis-950 text-slate-200 relative overflow-hidden font-sans">
      <div className="absolute w-[50%] h-[50%] rounded-full bg-accent-blue glow-blur"></div>
      <div className="w-full max-w-md p-8 bg-jurixis-900 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-accent-blue/15 p-3 rounded-2xl border border-accent-blue/30 text-accent-blue mb-4">
            <Mail className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Painel de E-mail Jurixis</h2>
          <p className="text-sm text-slate-400 mt-1">Insira suas credenciais administrativas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: admin@jurixis.com.br"
              required
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white placeholder-slate-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Senha</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white placeholder-slate-600 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-accent-blue/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Acessar Painel'}
          </button>
        </form>
      </div>
    </div>
  );
}

// 1. DASHBOARD PANEL
function DashboardPanel({ showNotification }: { showNotification: (t: 'error' | 'success', m: string) => void }) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const data = await fetchApi('/api/system/status');
      setStatus(data);
    } catch (err: any) {
      showNotification('error', 'Erro ao obter status do sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-slate-400">Carregando métricas...</div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-sm text-slate-400">Visão geral do servidor de e-mail</p>
        </div>
        <button onClick={fetchStatus} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
          <RefreshCw className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Services status banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatusCard 
          icon={<Server className="w-6 h-6 text-accent-blue" />} 
          title="Serviço E-mail" 
          value={status?.stalwartAlive ? "Ativo" : "Inativo"} 
          statusColor={status?.stalwartAlive ? "text-emerald-400" : "text-rose-400"}
          badge={status?.stalwartAlive ? "Online" : "Off-line"}
          badgeColor={status?.stalwartAlive ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}
        />
        <StatusCard 
          icon={<Cpu className="w-6 h-6 text-accent-teal" />} 
          title="Uso de CPU" 
          value={status?.systemMetrics?.cpuUsage || '0%'} 
          statusColor="text-slate-200"
          badge="Métrico"
          badgeColor="bg-slate-800 border-slate-700 text-slate-300"
        />
        <StatusCard 
          icon={<HardDrive className="w-6 h-6 text-accent-amber" />} 
          title="Memória" 
          value={status?.systemMetrics?.memoryUsage || '0MB'} 
          statusColor="text-slate-200"
          badge="Alocada"
          badgeColor="bg-slate-800 border-slate-700 text-slate-300"
        />
        <StatusCard 
          icon={<Network className="w-6 h-6 text-accent-rose" />} 
          title="Fila de Saída" 
          value={status?.queueLength !== undefined ? `${status.queueLength} e-mails` : '0'} 
          statusColor="text-slate-200"
          badge={status?.queueLength > 0 ? "Atrasado" : "Vazia"}
          badgeColor={status?.queueLength > 0 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}
        />
      </div>

      {/* Security DNS health card */}
      <div className="bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-accent-blue" />
          <span>Status de Integridade do DNS (Segurança de Entrega)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <DnsBadge label="Registro A" detail="mail.jurixis.com.br" status={status?.dnsStatus?.mxOk} />
          <DnsBadge label="Registro MX" detail="10 mail.jurixis.com.br" status={status?.dnsStatus?.mxOk} />
          <DnsBadge label="SPF (TXT)" detail="v=spf1 mx -all" status={status?.dnsStatus?.spfOk} />
          <DnsBadge label="DKIM (TXT)" detail="mail._domainkey" status={status?.dnsStatus?.dkimOk} />
          <DnsBadge label="DMARC (TXT)" detail="_dmarc" status={status?.dnsStatus?.dmarcOk} />
        </div>

        <div className="mt-6 p-4 rounded-lg bg-accent-blue/5 border border-accent-blue/20 text-slate-300 text-sm flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-accent-blue shrink-0 mt-0.5" />
          <p>
            Todos os registros de DNS de segurança essenciais estão pré-configurados e documentados no README. Certifique-se de publicá-los nas configurações DNS do seu domínio (Registro.br) para evitar que e-mails enviados caiam na caixa de spam do destinatário.
          </p>
        </div>
      </div>

      {/* Simulated throughput charts SVG */}
      <div className="bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Volume de Tráfego de E-mail (24h)</h3>
        <div className="h-64 w-full flex items-end justify-between relative mt-6">
          {/* SVG line graph */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="#1f2937" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#1f2937" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#1f2937" strokeWidth="0.5" />

            {/* Inbound Email line (Green) */}
            <path 
              d="M 0 90 Q 20 80, 40 40 T 80 50 T 100 20" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="2" 
            />
            {/* Outbound Email line (Blue) */}
            <path 
              d="M 0 95 Q 15 90, 30 70 T 60 30 T 90 40 T 100 50" 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="2" 
            />
          </svg>
          {/* Axis Labels */}
          <div className="absolute left-2 top-2 text-[10px] text-slate-500">Alto</div>
          <div className="absolute left-2 bottom-6 text-[10px] text-slate-500">Baixo</div>
          <div className="absolute left-0 bottom-0 text-[10px] text-slate-500">00:00</div>
          <div className="absolute left-1/4 bottom-0 text-[10px] text-slate-500">06:00</div>
          <div className="absolute left-1/2 bottom-0 text-[10px] text-slate-500">12:00</div>
          <div className="absolute left-3/4 bottom-0 text-[10px] text-slate-500">18:00</div>
          <div className="absolute right-0 bottom-0 text-[10px] text-slate-500">Agora</div>
        </div>
        <div className="flex items-center space-x-6 justify-center mt-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-xs text-slate-400">Mensagens Recebidas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent-blue"></div>
            <span className="text-xs text-slate-400">Mensagens Enviadas</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon, title, value, statusColor, badge, badgeColor }: { 
  icon: React.ReactNode, title: string, value: string, statusColor: string, badge: string, badgeColor: string 
}) {
  return (
    <div className="bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <div>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${statusColor}`}>{value}</p>
      </div>
    </div>
  );
}

function DnsBadge({ label, detail, status }: { label: string, detail: string, status: boolean }) {
  return (
    <div className="flex flex-col p-4 rounded-lg bg-slate-950 border border-slate-800">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-white mt-1 truncate">{detail}</span>
      <div className="flex items-center space-x-1.5 mt-3">
        {status ? (
          <>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Configurado</span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-500 font-medium">Recomendado</span>
          </>
        )}
      </div>
    </div>
  );
}

// 2. DOMAINS PANEL
function DomainsPanel({ showNotification }: { showNotification: (t: 'error' | 'success', m: string) => void }) {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchDomains = async () => {
    try {
      const data = await fetchApi('/api/domains');
      setDomains(data);
    } catch (err: any) {
      showNotification('error', 'Erro ao buscar domínios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await fetchApi('/api/domains', {
        method: 'POST',
        body: JSON.stringify({ name, description })
      });
      setName('');
      setDescription('');
      showNotification('success', `Domínio ${name} adicionado com sucesso.`);
      fetchDomains();
    } catch (err: any) {
      showNotification('error', err.message || 'Erro ao adicionar domínio.');
    }
  };

  const handleDeleteDomain = async (domainName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o domínio ${domainName}? Isso removerá todas as contas e aliases associados!`)) return;
    try {
      await fetchApi(`/api/domains/${domainName}`, { method: 'DELETE' });
      showNotification('success', `Domínio ${domainName} removido com sucesso.`);
      fetchDomains();
    } catch (err: any) {
      showNotification('error', err.message || 'Erro ao remover domínio.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Gerenciamento de Domínios</h2>
        <p className="text-sm text-slate-400">Configure múltiplos domínios para recebimento e envio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Domain Form */}
        <div className="bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg h-fit">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-accent-blue" />
            <span>Adicionar Novo Domínio</span>
          </h3>
          <form onSubmit={handleAddDomain} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nome do Domínio</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="ex: novo-dominio.com.br"
                required
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white placeholder-slate-700 text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Descrição</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="ex: Domínio Secundário do Escritório"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white placeholder-slate-700 text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold rounded-lg text-sm transition-all"
            >
              Adicionar Domínio
            </button>
          </form>
        </div>

        {/* Domain List */}
        <div className="lg:col-span-2 bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Domínios Configurados</h3>
          {loading ? (
            <div className="text-slate-400">Carregando domínios...</div>
          ) : domains.length === 0 ? (
            <div className="text-slate-500 text-sm py-4">Nenhum domínio configurado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 rounded-l-lg">Domínio</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 rounded-r-lg text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {domains.map((dom) => (
                    <tr key={dom.name} className="hover:bg-slate-800/20">
                      <td className="px-6 py-4 font-semibold text-white">{dom.name}</td>
                      <td className="px-6 py-4">{dom.description}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          dom.active 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dom.active ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                          <span>{dom.active ? 'Ativo' : 'Inativo'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteDomain(dom.name)}
                          className="p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-colors border border-transparent hover:border-rose-500/20"
                          title="Excluir Domínio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 3. ACCOUNTS PANEL
function AccountsPanel({ showNotification }: { showNotification: (t: 'error' | 'success', m: string) => void }) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [domain, setDomain] = useState('');
  const [password, setPassword] = useState('');
  const [quota, setQuota] = useState('1 GB');

  const fetchData = async () => {
    try {
      const accList = await fetchApi('/api/accounts');
      const domList = await fetchApi('/api/domains');
      setAccounts(accList);
      setDomains(domList);
      if (domList.length > 0 && !domain) {
        setDomain(domList[0].name);
      }
    } catch (err: any) {
      showNotification('error', 'Erro ao obter dados das caixas postais.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !domain || !password) return;
    try {
      await fetchApi('/api/accounts', {
        method: 'POST',
        body: JSON.stringify({ username, domain, password, quota })
      });
      setUsername('');
      setPassword('');
      showNotification('success', `Caixa postal ${username}@${domain} criada com sucesso.`);
      fetchData();
    } catch (err: any) {
      showNotification('error', err.message || 'Erro ao criar caixa postal.');
    }
  };

  const handleDeleteAccount = async (email: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente a caixa postal ${email}? Todos os e-mails dessa caixa serão perdidos!`)) return;
    try {
      await fetchApi(`/api/accounts/${email}`, { method: 'DELETE' });
      showNotification('success', `Caixa postal ${email} removida com sucesso.`);
      fetchData();
    } catch (err: any) {
      showNotification('error', err.message || 'Erro ao remover caixa.');
    }
  };

  const toggleStatus = async (email: string, currentStatus: boolean) => {
    try {
      await fetchApi(`/api/accounts/${email}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !currentStatus })
      });
      showNotification('success', `Status da conta ${email} atualizado.`);
      fetchData();
    } catch (err: any) {
      showNotification('error', 'Erro ao alterar status.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Gerenciamento de Caixas Postais</h2>
        <p className="text-sm text-slate-400">Crie, ative e exclua contas de e-mail corporativas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Account Form */}
        <div className="bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg h-fit">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-accent-blue" />
            <span>Criar Nova Caixa Postal</span>
          </h3>
          <form onSubmit={handleAddAccount} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="ex: contato"
                  required
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white placeholder-slate-700 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Domínio</label>
                <select 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white text-sm transition-all h-[38px]"
                >
                  {domains.map(d => (
                    <option key={d.name} value={d.name}>@{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Senha da Caixa</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Senha forte do usuário"
                required
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white placeholder-slate-700 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cota de Armazenamento</label>
              <select 
                value={quota} 
                onChange={(e) => setQuota(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white text-sm transition-all"
              >
                <option value="500 MB">500 MB</option>
                <option value="1 GB">1 GB</option>
                <option value="5 GB">5 GB</option>
                <option value="10 GB">10 GB</option>
                <option value="Ilimitada">Ilimitada</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={domains.length === 0}
              className="w-full py-2.5 bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold rounded-lg text-sm transition-all disabled:opacity-50"
            >
              Criar Caixa Postal
            </button>
          </form>
        </div>

        {/* Account List */}
        <div className="lg:col-span-2 bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Contas Ativas</h3>
          {loading ? (
            <div className="text-slate-400">Carregando contas...</div>
          ) : accounts.length === 0 ? (
            <div className="text-slate-500 text-sm py-4">Nenhuma caixa postal configurada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 rounded-l-lg">E-mail</th>
                    <th className="px-6 py-4">Cota</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 rounded-r-lg text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {accounts.map((acc) => (
                    <tr key={acc.email} className="hover:bg-slate-800/20">
                      <td className="px-6 py-4 font-semibold text-white">{acc.email}</td>
                      <td className="px-6 py-4">{acc.quota}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleStatus(acc.email, acc.active)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                            acc.active 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${acc.active ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                          <span>{acc.active ? 'Ativo' : 'Bloqueado'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteAccount(acc.email)}
                          className="p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-colors border border-transparent hover:border-rose-500/20"
                          title="Excluir Conta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 4. ALIASES PANEL
function AliasesPanel({ showNotification }: { showNotification: (t: 'error' | 'success', m: string) => void }) {
  const [aliases, setAliases] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aliasPrefix, setAliasPrefix] = useState('');
  const [aliasDomain, setAliasDomain] = useState('');
  const [target, setTarget] = useState('');

  const fetchData = async () => {
    try {
      const aliasList = await fetchApi('/api/aliases');
      const accList = await fetchApi('/api/accounts');
      const domList = await fetchApi('/api/domains');
      setAliases(aliasList);
      setAccounts(accList);
      setDomains(domList);
      if (domList.length > 0 && !aliasDomain) {
        setAliasDomain(domList[0].name);
      }
      if (accList.length > 0 && !target) {
        setTarget(accList[0].email);
      }
    } catch (err: any) {
      showNotification('error', 'Erro ao obter aliases de e-mail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aliasPrefix || !aliasDomain || !target) return;
    const aliasEmail = `${aliasPrefix}@${aliasDomain}`;
    try {
      await fetchApi('/api/aliases', {
        method: 'POST',
        body: JSON.stringify({ alias: aliasEmail, target })
      });
      setAliasPrefix('');
      showNotification('success', `Alias ${aliasEmail} apontando para ${target} criado.`);
      fetchData();
    } catch (err: any) {
      showNotification('error', err.message || 'Erro ao criar alias.');
    }
  };

  const handleDeleteAlias = async (aliasEmail: string, targetEmail: string) => {
    if (!confirm(`Remover redirecionamento de ${aliasEmail} para ${targetEmail}?`)) return;
    try {
      await fetchApi(`/api/aliases?alias=${aliasEmail}&target=${targetEmail}`, { method: 'DELETE' });
      showNotification('success', 'Alias removido com sucesso.');
      fetchData();
    } catch (err: any) {
      showNotification('error', err.message || 'Erro ao remover alias.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Aliases e Redirecionamentos</h2>
        <p className="text-sm text-slate-400">Configure apelidos/redirecionamentos (ex: vendas@ apontando para joao@)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alias Form */}
        <div className="bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg h-fit">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-accent-blue" />
            <span>Criar Novo Alias</span>
          </h3>
          <form onSubmit={handleAddAlias} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Apelido (Alias)</label>
                <input 
                  type="text" 
                  value={aliasPrefix} 
                  onChange={(e) => setAliasPrefix(e.target.value)} 
                  placeholder="ex: financeiro"
                  required
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white placeholder-slate-700 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Domínio</label>
                <select 
                  value={aliasDomain} 
                  onChange={(e) => setAliasDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white text-sm transition-all h-[38px]"
                >
                  {domains.map(d => (
                    <option key={d.name} value={d.name}>@{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Destino (Conta Real)</label>
              <select 
                value={target} 
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white text-sm transition-all h-[38px]"
              >
                {accounts.map(acc => (
                  <option key={acc.email} value={acc.email}>{acc.email}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={domains.length === 0 || accounts.length === 0}
              className="w-full py-2.5 bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold rounded-lg text-sm transition-all disabled:opacity-50"
            >
              Criar Alias
            </button>
          </form>
        </div>

        {/* Alias List */}
        <div className="lg:col-span-2 bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Redirecionamentos de E-mail</h3>
          {loading ? (
            <div className="text-slate-400">Carregando aliases...</div>
          ) : aliases.length === 0 ? (
            <div className="text-slate-500 text-sm py-4">Nenhum alias configurado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 rounded-l-lg">Apelido (De)</th>
                    <th className="px-6 py-4">Destinatário (Para)</th>
                    <th className="px-6 py-4 rounded-r-lg text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {aliases.map((al) => (
                    <tr key={`${al.alias}-${al.target}`} className="hover:bg-slate-800/20">
                      <td className="px-6 py-4 font-semibold text-white">{al.alias}</td>
                      <td className="px-6 py-4 text-accent-blue font-medium">{al.target}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteAlias(al.alias, al.target)}
                          className="p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-colors border border-transparent hover:border-rose-500/20"
                          title="Remover Redirecionamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 5. SECURITY & ANTISPAM PANEL
function AntispamPanel({ showNotification }: { showNotification: (t: 'error' | 'success', m: string) => void }) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [listType, setListType] = useState<'allow' | 'block'>('allow');

  const fetchAntispam = async () => {
    try {
      const data = await fetchApi('/api/system/antispam');
      setConfig(data);
    } catch (err: any) {
      showNotification('error', 'Erro ao obter dados antispam.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAntispam();
  }, []);

  const handleUpdateConfig = async (updatedFields: any) => {
    try {
      const newConfig = { ...config, ...updatedFields };
      await fetchApi('/api/system/antispam', {
        method: 'PUT',
        body: JSON.stringify(newConfig)
      });
      showNotification('success', 'Configurações antispam salvas.');
      setConfig(newConfig);
    } catch (err: any) {
      showNotification('error', 'Erro ao salvar configurações.');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem) return;
    const url = listType === 'allow' ? '/api/system/antispam/allowlist' : '/api/system/antispam/blocklist';
    try {
      await fetchApi(url, {
        method: 'POST',
        body: JSON.stringify({ item: newItem })
      });
      showNotification('success', `Item adicionado à lista.`);
      setNewItem('');
      fetchAntispam();
    } catch (err: any) {
      showNotification('error', 'Erro ao adicionar item.');
    }
  };

  const handleRemoveItem = async (item: string, type: 'allow' | 'block') => {
    const url = type === 'allow' ? `/api/system/antispam/allowlist/${item}` : `/api/system/antispam/blocklist/${item}`;
    try {
      await fetchApi(url, { method: 'DELETE' });
      showNotification('success', 'Item removido.');
      fetchAntispam();
    } catch (err: any) {
      showNotification('error', 'Erro ao remover item.');
    }
  };

  if (loading) return <div className="text-slate-400">Carregando regras de segurança...</div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Segurança e Filtros Antispam</h2>
        <p className="text-sm text-slate-400">Ajuste limites de score de spam, greylisting e allow/block lists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AntiSpam Settings */}
        <div className="bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg h-fit space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-accent-blue" />
            <span>Limites e Motores</span>
          </h3>

          {/* Spam score threshold slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase">
              <span>Score Limite de Spam</span>
              <span className="text-accent-blue font-bold text-sm bg-accent-blue/10 px-2 py-0.5 rounded">{config.spamScore}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="15" 
              step="0.5"
              value={config.spamScore} 
              onChange={(e) => setConfig({ ...config, spamScore: parseFloat(e.target.value) })}
              onMouseUp={() => handleUpdateConfig({ spamScore: config.spamScore })}
              onTouchEnd={() => handleUpdateConfig({ spamScore: config.spamScore })}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-accent-blue"
            />
            <p className="text-[10px] text-slate-500">
              Pontuação menor torna o filtro mais agressivo. Mensagens que pontuarem acima deste score são movidas para quarentena/spam.
            </p>
          </div>

          {/* Greylisting toggle */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <div>
              <span className="block text-sm font-semibold text-white">Ativar Greylisting</span>
              <span className="block text-[10px] text-slate-500 mt-1 max-w-[200px]">
                Atrasa conexões SMTP suspeitas temporariamente para mitigar spams automáticos.
              </span>
            </div>
            <button 
              onClick={() => handleUpdateConfig({ enableGreylist: !config.enableGreylist })}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              {config.enableGreylist ? (
                <ToggleRight className="w-10 h-10 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Allowlist/Blocklist Manager */}
        <div className="lg:col-span-2 bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-lg font-semibold text-white">Allowlist & Blocklist</h3>
            <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
              <button 
                onClick={() => setListType('allow')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  listType === 'allow' 
                    ? 'bg-accent-blue text-white shadow' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Allowlist (Liberados)
              </button>
              <button 
                onClick={() => setListType('block')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  listType === 'block' 
                    ? 'bg-rose-500 text-white shadow' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Blocklist (Bloqueados)
              </button>
            </div>
          </div>

          {/* Add form */}
          <form onSubmit={handleAddItem} className="flex space-x-2">
            <input 
              type="text" 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={listType === 'allow' ? "ex: @google.com ou advocacia@parceiro.com.br" : "ex: @spammail.xyz ou chatos@empresa.com"}
              required
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue/50 text-white placeholder-slate-700 text-sm transition-all"
            />
            <button 
              type="submit"
              className={`px-5 py-2.5 font-bold rounded-lg text-sm text-white transition-all ${
                listType === 'allow' ? 'bg-accent-blue hover:bg-accent-blue/90' : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              Adicionar
            </button>
          </form>

          {/* List items */}
          <div className="space-y-2 mt-4 max-h-72 overflow-y-auto pr-2">
            {listType === 'allow' ? (
              config.allowlist.length === 0 ? (
                <div className="text-slate-500 text-xs py-4">Nenhum remetente na allowlist.</div>
              ) : (
                config.allowlist.map((item: string) => (
                  <ListItem key={item} item={item} onRemove={() => handleRemoveItem(item, 'allow')} type="allow" />
                ))
              )
            ) : (
              config.blocklist.length === 0 ? (
                <div className="text-slate-500 text-xs py-4">Nenhum remetente na blocklist.</div>
              ) : (
                config.blocklist.map((item: string) => (
                  <ListItem key={item} item={item} onRemove={() => handleRemoveItem(item, 'block')} type="block" />
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListItem({ item, onRemove, type }: { item: string, onRemove: () => void, type: 'allow' | 'block' }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
      <span className="text-sm text-slate-300 font-medium">{item}</span>
      <button 
        onClick={onRemove}
        className={`p-1 rounded transition-colors ${type === 'allow' ? 'hover:bg-rose-500/10 hover:text-rose-400' : 'hover:bg-slate-800'} text-slate-500`}
        title="Remover"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// 6. LOGS AND QUEUE PANEL
function LogsPanel({ showNotification }: { showNotification: (t: 'error' | 'success', m: string) => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const logData = await fetchApi('/api/system/logs');
      const queueData = await fetchApi('/api/system/queue');
      setLogs(logData);
      setQueue(queueData);
    } catch (err: any) {
      showNotification('error', 'Erro ao obter logs e filas do sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteQueueItem = async (id: string) => {
    if (!confirm(`Remover mensagem ${id} da fila de saída permanentemente?`)) return;
    try {
      await fetchApi(`/api/system/queue/${id}`, { method: 'DELETE' });
      showNotification('success', 'Mensagem removida da fila.');
      fetchData();
    } catch (err: any) {
      showNotification('error', 'Erro ao remover mensagem.');
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.service.toUpperCase() === filter.toUpperCase();
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Logs de Serviço e Fila de Saída</h2>
          <p className="text-sm text-slate-400">Verifique logs do SMTP/IMAP/Antispam em tempo real e limpe filas de envio</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
          <RefreshCw className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Outgoing queue */}
      <div className="bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Network className="w-5 h-5 text-accent-rose" />
          <span>Fila de Transmissão Ativa (SMTP Outbound)</span>
        </h3>
        
        {loading ? (
          <div className="text-slate-400">Carregando fila...</div>
        ) : queue.length === 0 ? (
          <div className="text-slate-500 text-sm py-4">Nenhum e-mail retido na fila de saída. Transmissões fluindo normalmente!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-l-lg">ID da Fila</th>
                  <th className="px-6 py-4">Remetente</th>
                  <th className="px-6 py-4">Destinatário</th>
                  <th className="px-6 py-4">Tamanho</th>
                  <th className="px-6 py-4">Tentativas</th>
                  <th className="px-6 py-4">Status / Erro</th>
                  <th className="px-6 py-4 rounded-r-lg text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-mono text-slate-400 text-xs">{item.id}</td>
                    <td className="px-6 py-4">{item.sender}</td>
                    <td className="px-6 py-4">{item.recipient}</td>
                    <td className="px-6 py-4">{item.size}</td>
                    <td className="px-6 py-4">{item.attempts}</td>
                    <td className="px-6 py-4 text-xs text-amber-400 max-w-[200px] truncate" title={item.status}>
                      {item.status}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteQueueItem(item.id)}
                        className="p-1.5 rounded hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-colors border border-transparent hover:border-rose-500/20"
                        title="Descartar E-mail"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Logs console */}
      <div className="bg-jurixis-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-accent-teal" />
            <span>Console de Logs em Tempo Real</span>
          </h3>
          {/* Logs filtering */}
          <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-lg h-9">
            <LogFilterButton active={filter === 'ALL'} label="Todos" onClick={() => setFilter('ALL')} />
            <LogFilterButton active={filter === 'SMTP'} label="SMTP" onClick={() => setFilter('SMTP')} />
            <LogFilterButton active={filter === 'IMAP'} label="IMAP" onClick={() => setFilter('IMAP')} />
            <LogFilterButton active={filter === 'ANTISPAM'} label="Antispam" onClick={() => setFilter('ANTISPAM')} />
          </div>
        </div>

        {/* Console Box */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-xs text-slate-400 h-96 overflow-y-auto space-y-2 shadow-inner">
          {loading ? (
            <div className="text-slate-600">Lendo console...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-slate-600">Nenhum log gravado para o serviço filtrado.</div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={idx} className="hover:bg-slate-900/50 py-0.5 flex space-x-2">
                <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                <span className={`shrink-0 font-bold ${
                  log.service === 'SMTP' ? 'text-accent-blue' :
                  log.service === 'IMAP' ? 'text-accent-amber' :
                  'text-accent-teal'
                }`}>
                  [{log.service.toUpperCase()}]
                </span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function LogFilterButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
        active 
          ? 'bg-slate-800 text-white shadow' 
          : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}
