# jx-mail — Servidor de E-mail Jurixis

Servidor de e-mail integrado para o ecossistema **Jurixis**, projetado para ser leve, rápido, seguro e fácil de operar em servidores virtuais privados (VPS).

---

## 1. Visão Geral da Stack

*   **Motor Principal**: [Stalwart Mail Server](https://stalw.art) (escrito em Rust).
    *   **Consumo de RAM**: ~50-100MB (comparado a >1GB das stacks tradicionais como Mailcow, Postfix + Dovecot + Rspamd).
    *   **Recursos Inclusos**: SMTP, SMTPS, Submission, IMAP, IMAPS, JMAP, assinatória DKIM dinâmica, validação SPF/DMARC, relatórios DMARC e antispam bayesiano integrado.
*   **Painel Administrativo**:
    *   **Backend**: Node.js + Express (ES Modules) orquestrando chamadas JMAP da API do Stalwart.
    *   **Frontend**: React 18 + Vite + Tailwind CSS integrado (dark mode, responsivo).
    *   **Arquitetura**: O backend serve os arquivos estáticos compilados do frontend (`express.static`), eliminando a necessidade de um container de web separado.

---

## 2. Estrutura do Projeto

```text
jx-mail/
  ├── docker-compose.yml     # Orquestração dos containers (Stalwart + Painel)
  ├── .env.example           # Arquivo modelo de variáveis de ambiente
  ├── README.md              # Este manual de operação e DNS
  ├── /server/               # Backend do Painel Express
  │   ├── Dockerfile
  │   └── src/
  ├── /web/                  # Frontend do Painel React (Vite)
  │   └── src/
  ├── /mail/
  │   └── stalwart/          # Configurações locais do motor Stalwart
  └── /scripts/              # Scripts de inicialização e auxiliares
      ├── init.sh            # Inicializa a stack inteira e configura domínio/admin
      ├── create-mailbox.sh  # Cria caixas postais via linha de comando
      ├── generate-dkim.sh   # Gera chaves RSA 2048 para DKIM
      └── healthcheck.sh     # Testa a integridade das portas SMTP/IMAP/HTTP
```

---

## 3. Guia de Configuração de DNS (Obrigatório)

Para que seus e-mails sejam entregues sem cair na caixa de spam do destinatário (como Gmail ou Outlook), você deve configurar os seguintes registros no provedor de DNS do seu domínio (ex: Registro.br):

| Tipo | Entrada (Host) | Valor | Descrição |
| :--- | :--- | :--- | :--- |
| **A** | `mail` | `IP_DA_SUA_VPS` | Aponta o subdomínio de e-mail para a VPS. |
| **MX** | `@` | `10 mail.jurixis.com.br` | Define este servidor como o receptor de e-mails. |
| **TXT** | `@` | `"v=spf1 mx ip4:IP_DA_SUA_VPS -all"` | SPF: Autoriza apenas este IP a enviar e-mails pelo domínio. |
| **TXT** | `mail._domainkey` | `"v=DKIM1; k=rsa; p=PUBLIC_KEY..."` | DKIM: Chave pública gerada pelo script `generate-dkim.sh`. |
| **TXT** | `_dmarc` | `"v=DMARC1; p=quarantine; pct=100; rua=mailto:postmaster@seu-dominio.com.br"` | DMARC: Regras de ação em caso de falha de SPF/DKIM. |

> [!IMPORTANT]
> **PTR Record (Reverse DNS)**: Você **deve** solicitar ao seu provedor de VPS (KingHost, Azure, etc.) a configuração do DNS Reverso (PTR) do IP da máquina para apontar para `mail.seu-dominio.com.br`. Sem isso, o Gmail rejeitará as mensagens.

---

## 4. Portas e Configuração de Firewall na VPS

As seguintes portas **devem** ser abertas no firewall do sistema (UFW/IPTables) e nas regras de rede da VPS:

*   **`25` (TCP)**: SMTP (Entrada de e-mails de outros servidores).
*   **`465` (TCP)**: SMTPS (Envio seguro - SSL/TLS implícito).
*   **`587` (TCP)**: Submission (Envio seguro - STARTTLS).
*   **`993` (TCP)**: IMAPS (Leitura segura de e-mails).
*   **`143` (TCP)**: IMAP (Leitura com STARTTLS).
*   **`3003` (TCP)**: Painel Administrativo Web (ou a porta configurada no `PANEL_PORT`).

---

## 5. Inicialização e Instalação Rápida

### Passo 1: Clonar o Repositório e Criar o Arquivo `.env`
Copie o arquivo `.env.example` para `.env` e configure suas credenciais administrativas e domínios:
```bash
cp .env.example .env
nano .env
```

### Passo 2: Executar o Script de Inicialização
O script `scripts/init.sh` automatiza todo o processo de deploy:
1. Garante permissão de execução nos scripts.
2. Gera as chaves DKIM iniciais.
3. Inicia o Docker Compose (`docker compose up -d`).
4. Aguarda o servidor SMTP ficar pronto.
5. Registra o domínio principal e a conta administrativa inicial no Stalwart.

Execute:
```bash
./scripts/init.sh
```

---

## 6. Operação e Scripts Utilitários

### Criar uma Caixa Postal manualmente:
Para criar contas sem usar a interface web, use:
```bash
./scripts/create-mailbox.sh contato@jurixis.com.br MinhaSenhaForte2026
```

### Testar Portas e Serviços:
Para validar se as portas SMTP e IMAP estão ativas na máquina:
```bash
./scripts/healthcheck.sh
```

---

## 7. Diagnósticos e Testes do Servidor

### 1. Testar conexões IMAP/SMTP com SSL/TLS
Para testar se os certificados TLS estão respondendo corretamente nas portas seguras:
```bash
# SMTP Seguro (SMTPS)
openssl s_client -connect 127.0.0.1:465 -crlf

# IMAP Seguro (IMAPS)
openssl s_client -connect 127.0.0.1:993 -crlf
```

### 2. Testar envio de e-mails via terminal (Swaks)
O utilitário `swaks` é a melhor ferramenta para testar se seu servidor permite login e envio:
```bash
# Instalação
sudo apt install swaks -y

# Testar autenticação e envio na porta 587 (STARTTLS)
swaks --server mail.jurixis.com.br --port 587 --to destinatario@gmail.com \
  --from admin@jurixis.com.br --auth LOGIN --auth-user admin@jurixis.com.br \
  --auth-password "SUA_SENHA_ADMIN" -tls
```

---

## 8. Segurança Mínima Ativa

*   **Prevenção de Open Relay**: O servidor recusa qualquer tentativa de enviar mensagens se o usuário não estiver autenticado nas portas 587/465.
*   **Armazenamento de Senhas**: As credenciais das caixas postais são criptografadas com hash bcrypt/argon2 no banco de dados interno.
*   **Limitação de Conexões**: Proteção nativa contra ataques de força bruta no login IMAP/SMTP.
*   **TLS Obrigatório**: Forçamos conexões criptografadas nas portas de transmissão de credenciais.
