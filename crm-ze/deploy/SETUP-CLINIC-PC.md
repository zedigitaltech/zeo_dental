# ManagerCRM - Clinic PC Setup Guide

## Prerequisites

- Windows 10/11 PC (any edition)
- Internet connection
- Admin access to the PC
- Domain: crm.zeodentalclinic.com

## Step 1: Install Docker Desktop

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Run the installer, accept defaults
3. When asked, enable **WSL 2** (recommended)
4. Restart the PC when prompted
5. Open Docker Desktop and wait for it to start (green icon in system tray)

If Windows asks to install WSL updates, follow the prompts.

## Step 2: Install Tailscale (Remote Management)

1. Download: https://tailscale.com/download/windows
2. Install and sign in with your Google/GitHub account
3. Note the Tailscale IP shown (e.g., 100.x.x.x)
4. Also install Tailscale on your MacBook: `brew install tailscale`
5. Now you can SSH into the clinic PC from anywhere via the Tailscale IP

Enable Tailscale SSH (optional):

- In Tailscale admin console (https://login.tailscale.com/admin), enable SSH

## Step 3: Download ManagerCRM

Open PowerShell (as Administrator) and run:

```powershell
# Create directory
mkdir C:\ManagerCRM
cd C:\ManagerCRM

# Download the project (or copy from USB)
git clone https://github.com/ezekaj/zeo_dental.git .

# Or if git isn't installed, download ZIP from GitHub and extract to C:\ManagerCRM
```

## Step 4: Configure Environment

```powershell
cd C:\ManagerCRM\crm-ze

# Copy the environment file
copy deploy\.env.production .env

# Edit with Notepad
notepad .env
```

In the .env file, change these values:

```
MYSQL_ROOT_PASSWORD=<generate a strong password>
MYSQL_PASSWORD=<generate a different strong password>
CRM_ZE_PASS=<admin login password>
```

Save and close.

## Step 5: Start ManagerCRM

```powershell
cd C:\ManagerCRM\crm-ze

# Start the containers
docker compose up -d

# Wait 2-3 minutes for first-time setup, then run:
# (In Git Bash or WSL terminal)
bash setup.sh
```

If bash isn't available, use WSL:

```powershell
wsl bash setup.sh
```

Verify it works: open http://localhost:8300 in a browser.

## Step 6: Set Up Cloudflare Tunnel (Public Access)

### 6a: Move DNS to Cloudflare (if not already there)

1. Create free Cloudflare account: https://dash.cloudflare.com/sign-up
2. Add site: zeodentalclinic.com
3. Cloudflare shows you two nameservers (e.g., anna.ns.cloudflare.com)
4. Go to your domain registrar and update nameservers to Cloudflare's
5. Wait for propagation (can take up to 24h, usually faster)
6. Keep existing DNS records (Cloudflare imports them)

### 6b: Create the Tunnel

1. In Cloudflare dashboard, go to **Zero Trust** > **Networks** > **Tunnels**
2. Click **Create a tunnel**
3. Name it: `managercrm`
4. Choose **Cloudflared** connector
5. Download and install the Windows connector (follow Cloudflare's instructions)
6. Configure the tunnel route:
   - **Public hostname**: `crm.zeodentalclinic.com`
   - **Service**: `https://localhost:9300`
   - **Additional settings**: Enable "No TLS Verify" (since CRM uses self-signed cert)
7. Save

That's it! `crm.zeodentalclinic.com` now points to the clinic PC through Cloudflare's network.

## Step 7: Auto-Start on Boot

Make Docker Desktop start automatically:

1. Open Docker Desktop > Settings > General
2. Check "Start Docker Desktop when you sign in"

Make containers restart automatically (already configured in docker-compose.yml with `restart: always`).

## Step 8: Configure SMTP (Email Notifications)

1. Go to https://myaccount.google.com/apppasswords (with zeodentalclinic@gmail.com)
2. Generate an app password for "Mail"
3. Edit the .env file and set:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=zeodentalclinic@gmail.com
SMTP_PASS=<the app password>
SMTP_SECURE=tls
```

4. Restart: `docker compose down && docker compose up -d && bash setup.sh`

## Step 9: Set Up Booking Sync

After the CRM is accessible at crm.zeodentalclinic.com:

1. Log into ManagerCRM as admin
2. Go to Admin > System > API Clients
3. Register a new API client (note the client_id and client_secret)
4. On your website (Fly.io), set the secrets:

```bash
fly secrets set CRM_BASE_URL=https://crm.zeodentalclinic.com
fly secrets set CRM_CLIENT_ID=<client_id>
fly secrets set CRM_CLIENT_SECRET=<client_secret>
fly secrets set CRM_USERNAME=admin
fly secrets set CRM_PASSWORD=<admin password>
```

## Troubleshooting

### Docker won't start

- Make sure virtualization is enabled in BIOS (VT-x / AMD-V)
- Run: `wsl --update` in PowerShell

### Can't access http://localhost:8300

- Check Docker Desktop is running (green icon)
- Run: `docker ps` to see if containers are up
- Check logs: `docker logs crm-ze-crm-ze-app-1`

### Cloudflare tunnel not working

- Check cloudflared service is running: Services > Cloudflared Agent
- Verify in Cloudflare dashboard that tunnel status is "Healthy"

### Slow performance

- Allocate more RAM to Docker: Docker Desktop > Settings > Resources > Memory (set to 4GB+)
- Make sure the PC has at least 8GB RAM total

## Daily Backup

Create a scheduled task in Windows:

1. Open Task Scheduler
2. Create Basic Task: "ManagerCRM Backup"
3. Trigger: Daily at 3:00 AM
4. Action: Start a program
5. Program: `wsl`
6. Arguments: `bash -c "docker exec crm-ze-crm-ze-db-1 mysqldump -u root -pYOUR_ROOT_PASSWORD openemr | gzip > /mnt/c/ManagerCRM/backups/backup_$(date +%Y%m%d).sql.gz"`

## Remote Management

From your MacBook (with Tailscale installed):

```bash
# SSH into the clinic PC
ssh user@100.x.x.x

# Or use Tailscale machine name
ssh user@clinic-pc
```

## Support

Repository: https://github.com/ezekaj/zeo_dental
