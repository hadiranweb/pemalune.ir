# Deployment Guide for Interactive Letter Application on Ubuntu Server

This guide provides comprehensive instructions for securely deploying the Interactive Letter Application on your Ubuntu server (IP: `188.121.105.115`). It covers SSH security best practices, Docker-based deployment, and alternative methods.

## 1. SSH Security Configuration

Securing your SSH access is paramount to protect your server from unauthorized access. The following steps outline essential security measures.

### 1.1. Use SSH Key-Based Authentication

Password-based authentication is vulnerable to brute-force attacks. SSH keys provide a much more secure alternative. You will generate a pair of keys (a private key and a public key) on your local machine and then upload the public key to your server.

#### 1.1.1. Generate SSH Keys (Local Machine)

If you don't already have an SSH key pair, generate one on your local machine. Open your terminal and run:

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

- `-t rsa`: Specifies the type of key to create (RSA).
- `-b 4096`: Specifies the number of bits in the key (4096 bits is highly recommended for security).
- `-C "your_email@example.com"`: Adds a comment to the key, which can be helpful for identification.

You will be prompted to enter a file in which to save the key (e.g., `/home/youruser/.ssh/id_rsa`). Press Enter to accept the default location. You will also be asked for a passphrase. **It is highly recommended to use a strong passphrase** to protect your private key, even if someone gains access to your local machine.

This command will generate two files:
- `id_rsa`: Your private key (keep this secure and never share it).
- `id_rsa.pub`: Your public key (this is what you will upload to the server).

#### 1.1.2. Copy Public Key to Server

Use `ssh-copy-id` to easily copy your public key to the server. This tool automatically appends the public key to the `~/.ssh/authorized_keys` file on the server and sets the correct permissions.

```bash
ssh-copy-id ubuntu@188.121.105.115
```

You will be prompted for the `ubuntu` user's password on the server. After successful authentication, your public key will be installed.

Alternatively, you can manually copy the key:

```bash
cat ~/.ssh/id_rsa.pub | ssh ubuntu@188.121.105.115 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

After copying the key, try logging in using your SSH key:

```bash
ssh ubuntu@188.121.105.115
```

If you are prompted for your passphrase (if you set one) and not a password, then key-based authentication is working.

### 1.2. Disable Password Authentication

Once you have confirmed that SSH key-based authentication is working, you should disable password authentication to prevent brute-force attacks.

1.  **Connect to your server via SSH** using your key:
    ```bash
    ssh ubuntu@188.121.105.115
    ```

2.  **Edit the SSH daemon configuration file**: 
    ```bash
    sudo nano /etc/ssh/sshd_config
    ```

3.  **Find and modify the following lines** (uncomment them if they are commented out, and change their values):
    ```
    PasswordAuthentication no
    ChallengeResponseAuthentication no
    UsePAM no
    ```

4.  **Save and exit** the file (Ctrl+X, Y, Enter).

5.  **Restart the SSH service** for the changes to take effect:
    ```bash
    sudo systemctl restart ssh
    ```

    **Important**: Before closing your current SSH session, open a new terminal window and try to log in to the server using your SSH key. If you can log in successfully, then the changes have been applied correctly. If you cannot log in, **do not close your current session** and revert the changes in `sshd_config`.

### 1.3. Configure Firewall (UFW)

Uncomplicated Firewall (UFW) is a user-friendly frontend for `iptables` that simplifies firewall management. It's crucial to restrict incoming connections to only those ports that are absolutely necessary.

1.  **Check UFW status**:
    ```bash
    sudo ufw status
    ```

2.  **Allow SSH connections**: By default, SSH runs on port 22. If you changed your SSH port, replace `22` with your custom port.
    ```bash
    sudo ufw allow ssh
    # Or if you changed the port: sudo ufw allow <your_ssh_port>/tcp
    ```

3.  **Allow HTTP (port 80) and HTTPS (port 443)**: These ports are necessary for web traffic.
    ```bash
    sudo ufw allow http
    sudo ufw allow https
    ```

4.  **Enable UFW**: Once you have allowed the necessary ports, enable the firewall.
    ```bash
    sudo ufw enable
    ```
    You will be warned that enabling the firewall might disrupt existing SSH connections. Type `y` and press Enter to proceed.

5.  **Verify UFW status** again:
    ```bash
    sudo ufw status verbose
    ```
    You should see rules allowing traffic on ports 22, 80, and 443.

### 1.4. Install and Configure Fail2Ban

Fail2Ban is an intrusion prevention framework that protects computer servers from brute-force attacks. It works by monitoring log files for malicious activity and then temporarily or permanently banning the IP addresses of attackers.

1.  **Update package lists and install Fail2Ban**:
    ```bash
    sudo apt update
    sudo apt install fail2ban
    ```

2.  **Create a local configuration file**: Fail2Ban's configuration files are located in `/etc/fail2ban/`. It's best practice to create a `jail.local` file to override default settings, as `jail.conf` might be overwritten during updates.
    ```bash
    sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    ```

3.  **Edit `jail.local`**: Open the file for editing:
    ```bash
    sudo nano /etc/fail2ban/jail.local
    ```

4.  **Configure basic settings**: 
    - Find the `[DEFAULT]` section. You might want to adjust `bantime` (how long an IP is banned, in seconds) and `maxretry` (number of failed attempts before banning).
    - Ensure `destemail` is set to your email address for notifications.
    - Add your IP address to `ignoreip` if you have a static IP, to prevent yourself from being banned.

    ```ini
    [DEFAULT]
    # Ban hosts for one hour:
    bantime = 3600

    # A host is banned if it has 5 failures within 10 minutes.
    findtime = 600
    maxretry = 5

    # Email address for notifications
    # destemail = your_email@example.com

    # IPs to ignore (your static IP)
    # ignoreip = 127.0.0.1/8 ::1 <your_static_ip>
    ```

5.  **Enable SSH protection**: Find the `[sshd]` section and ensure `enabled = true`.

    ```ini
    [sshd]
    enabled = true
    ```

6.  **Save and exit** the file.

7.  **Restart Fail2Ban service**:
    ```bash
    sudo systemctl restart fail2ban
    ```

8.  **Check Fail2Ban status**:
    ```bash
    sudo systemctl status fail2ban
    sudo fail2ban-client status sshd
    ```
    This will show you the status of the `sshd` jail, including any banned IPs.

By following these SSH security steps, your Ubuntu server will be significantly more resilient against common attack vectors. Remember to regularly update your system and review your security configurations.



## 2. Docker Deployment

Docker provides a consistent and isolated environment for running your application, simplifying deployment and management. This section outlines how to deploy the Interactive Letter Application using Docker and Docker Compose.

### 2.1. Install Docker and Docker Compose

If Docker and Docker Compose are not already installed on your Ubuntu server, follow these steps:

1.  **Update your `apt` package index**:
    ```bash
    sudo apt update
    ```

2.  **Install necessary packages** to allow `apt` to use a repository over HTTPS:
    ```bash
    sudo apt install ca-certificates curl gnupg lsb-release
    ```

3.  **Add Docker’s official GPG key**:
    ```bash
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    ```

4.  **Set up the repository**:
    ```bash
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    ```

5.  **Install Docker Engine, Containerd, and Docker Compose**:
    ```bash
    sudo apt update
    sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
    ```

6.  **Verify Docker installation** by running the `hello-world` image:
    ```bash
    sudo docker run hello-world
    ```

7.  **Manage Docker as a non-root user** (optional but recommended):
    ```bash
    sudo usermod -aG docker $USER
    newgrp docker
    ```
    You might need to log out and log back in for the changes to take effect.

### 2.2. Transfer Application Files to Server

Transfer your entire `interactive-letter` project directory to your Ubuntu server. You can use `scp` (Secure Copy Protocol) for this:

```bash
scp -r /path/to/your/local/interactive-letter ubuntu@188.121.105.115:/home/ubuntu/
```

Replace `/path/to/your/local/interactive-letter` with the actual path to your project on your local machine.

### 2.3. Configure Google Sheets Access

As mentioned in the `DOCKER_INSTRUCTIONS.md` file, you need to set up Google Sheets API access. Ensure you have:

1.  A `service_account.json` file placed in the `server/` directory of your project.
2.  An `.env` file (created from `.env.example`) in the root of your project, configured with your `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `GOOGLE_SPREADSHEET_ID`.

**Important**: The `service_account.json` file and your private key are sensitive. Ensure they are properly secured and not exposed publicly.

### 2.4. Build and Run the Application with Docker Compose

Navigate to the `interactive-letter` directory on your server:

```bash
cd /home/ubuntu/interactive-letter
```

Then, use Docker Compose to build and run your application. This will build the Docker image (if not already built) and start the containers for both the frontend and backend.

```bash
docker-compose up --build -d
```

- `--build`: This flag ensures that Docker Compose rebuilds the images. Use this when you make changes to your code or Dockerfiles.
- `-d`: This flag runs the containers in detached mode, meaning they will run in the background.

### 2.5. Access the Deployed Application

Once the containers are running, you can access your application:

-   **Full Application**: `http://188.121.105.115:5000`
-   **API Health Check**: `http://188.121.105.115:5000/api/health`

**Note**: If you have a domain name, you can configure Nginx as a reverse proxy to serve the application on standard HTTP/HTTPS ports (80/443) without specifying the port in the URL. This is beyond the scope of this guide but is highly recommended for production environments.

For more detailed information on Docker commands, troubleshooting, and advanced configurations, refer to the `DOCKER_INSTRUCTIONS.md` file located in your project root.




## 3. Alternative Deployment Methods (Direct Node.js)

If you prefer not to use Docker, you can deploy the Node.js backend and React frontend directly on your Ubuntu server. This method requires manual setup of Node.js, a process manager, and a web server like Nginx for serving the frontend and acting as a reverse proxy for the backend.

### 3.1. Install Node.js and npm

1.  **Update your `apt` package index**:
    ```bash
    sudo apt update
    ```

2.  **Install Node.js using `nvm` (Node Version Manager)** (recommended for managing multiple Node.js versions):
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    ```
    Close and reopen your terminal, or run `source ~/.bashrc` (or `~/.zshrc` if you use Zsh) to load `nvm`.

3.  **Install the latest LTS version of Node.js**:
    ```bash
    nvm install --lts
    nvm use --lts
    ```

4.  **Verify installation**:
    ```bash
    node -v
    npm -v
    ```

### 3.2. Install PM2 (Process Manager)

PM2 is a production process manager for Node.js applications with a built-in load balancer. It allows you to keep applications alive forever, reload them without downtime, and facilitate common system admin tasks.

```bash
sudo npm install -g pm2
```

### 3.3. Prepare the Application

1.  **Transfer your application files** to the server (if you haven't already, as described in Section 2.2).
    ```bash
    scp -r /path/to/your/local/interactive-letter ubuntu@188.121.105.115:/home/ubuntu/
    ```

2.  **Navigate to the project directory** on the server:
    ```bash
    cd /home/ubuntu/interactive-letter
    ```

3.  **Install backend dependencies**:
    ```bash
    cd server
    npm install --production
    cd ..
    ```

4.  **Build the React frontend**:
    ```bash
    cd client
    npm install
    npm run build
    cd ..
    ```
    This will create a `build` directory inside `client/` containing the static frontend files.

### 3.4. Run the Backend with PM2

1.  **Start the Node.js backend** using PM2 from the `server` directory:
    ```bash
    cd server
    pm2 start index.js --name interactive-letter-backend
    ```

2.  **Save the PM2 process list** to ensure it restarts on server reboot:
    ```bash
    pm2 save
    pm2 startup
    ```
    Follow the instructions provided by `pm2 startup` to set up the startup script.

3.  **Check PM2 status**:
    ```bash
    pm2 status
    pm2 logs interactive-letter-backend
    ```

### 3.5. Configure Nginx as a Reverse Proxy

Nginx will serve your static React frontend files and proxy API requests to your Node.js backend.

1.  **Install Nginx**:
    ```bash
    sudo apt install nginx
    ```

2.  **Create an Nginx server block configuration file**:
    ```bash
    sudo nano /etc/nginx/sites-available/interactive-letter
    ```

3.  **Add the following configuration**:
    ```nginx
    server {
        listen 80;
        server_name 188.121.105.115; # Replace with your server IP or domain name

        root /home/ubuntu/interactive-letter/client/build; # Path to your React build directory
        index index.html index.htm;

        location / {
            try_files $uri $uri/ =404;
        }

        location /api/ {
            proxy_pass http://localhost:5000; # Proxy to your Node.js backend
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

4.  **Create a symbolic link** from `sites-available` to `sites-enabled` to enable the configuration:
    ```bash
    sudo ln -s /etc/nginx/sites-available/interactive-letter /etc/nginx/sites-enabled/
    ```

5.  **Test Nginx configuration** for syntax errors:
    ```bash
    sudo nginx -t
    ```

6.  **Restart Nginx** to apply changes:
    ```bash
    sudo systemctl restart nginx
    ```

7.  **Adjust UFW** (if enabled) to allow Nginx traffic (ports 80 and 443, already covered in Section 1.3).

Now, your application should be accessible via `http://188.121.105.115` (or your domain name if configured).



## 4. Monitoring and Maintenance

Regular monitoring and maintenance are crucial for ensuring the stability, performance, and security of your deployed application.

### 4.1. Checking Application Logs

Logs provide valuable insights into the application's behavior, errors, and performance. Depending on your deployment method, you can check logs as follows:

#### 4.1.1. Docker Logs

If you are using Docker Compose, you can view the logs of your `interactive-letter` service:

```bash
docker-compose logs interactive-letter
```

To follow logs in real-time:

```bash
docker-compose logs -f interactive-letter
```

To view logs from a specific time or for a specific number of lines:

```bash
docker-compose logs --since "2025-08-01T00:00:00" interactive-letter
docker-compose logs --tail 100 interactive-letter
```

If you are running the Docker container directly:

```bash
docker logs interactive-letter-container
docker logs -f interactive-letter-container
```

#### 4.1.2. PM2 Logs (for Direct Node.js Deployment)

If you deployed the Node.js backend using PM2, you can check its logs:

```bash
pm2 logs interactive-letter-backend
```

To view logs for a specific period or clear them:

```bash
pm2 logs interactive-letter-backend --lines 100
pm2 flush
```

#### 4.1.3. Nginx Logs (for Direct Node.js Deployment)

Nginx access and error logs are typically located in `/var/log/nginx/`:

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 4.2. Monitoring System Resources

It's important to monitor your server's CPU, memory, and disk usage to ensure optimal performance and prevent outages.

-   **CPU and Memory Usage**:
    ```bash
    htop
    # or
    top
    ```
    These commands provide a dynamic real-time view of running processes and system resource usage.

-   **Disk Usage**:
    ```bash
    df -h
    ```
    This command shows the amount of free and used disk space on your file systems.

-   **Network Activity**:
    ```bash
    netstat -tulnp
    ```
    This command displays active network connections and listening ports.

### 4.3. Updating the Application

Regularly updating your application is essential for security patches, bug fixes, and new features.

#### 4.3.1. Updating Docker Deployment

1.  **Transfer updated files**: Copy the latest version of your `interactive-letter` project to the server, overwriting the old files.
    ```bash
    scp -r /path/to/your/local/interactive-letter ubuntu@188.121.105.115:/home/ubuntu/
    ```

2.  **Rebuild and restart containers**: Navigate to the project directory on the server and run:
    ```bash
    cd /home/ubuntu/interactive-letter
    docker-compose down
    docker-compose up --build -d
    ```
    The `down` command stops and removes old containers, and `up --build -d` builds new images from the updated code and starts fresh containers.

#### 4.3.2. Updating Direct Node.js Deployment

1.  **Transfer updated files**: Copy the latest version of your `interactive-letter` project to the server.
    ```bash
    scp -r /path/to/your/local/interactive-letter ubuntu@188.121.105.115:/home/ubuntu/
    ```

2.  **Install new dependencies (if any)**:
    ```bash
    cd /home/ubuntu/interactive-letter/server
    npm install --production
    cd ../client
    npm install
    ```

3.  **Rebuild the React frontend**:
    ```bash
    npm run build
    cd ..
    ```

4.  **Reload PM2 process**: This will restart your Node.js backend without downtime.
    ```bash
    pm2 reload interactive-letter-backend
    ```

5.  **Reload Nginx** (if you made changes to Nginx configuration):
    ```bash
    sudo systemctl reload nginx
    ```

### 4.4. System Updates

Regularly update your Ubuntu server's packages to ensure you have the latest security patches and bug fixes.

```bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

Consider setting up automatic security updates for critical packages.

### 4.5. Backups

Implement a robust backup strategy for your application code, database (if any), and critical configuration files. This is essential for disaster recovery.

-   **Code**: Use a version control system like Git and push your code to a remote repository (e.g., GitHub, GitLab).
-   **Database**: If you were using a database (like SQLite in the original pema_backend), regularly back up the database file.
-   **Configuration**: Back up your Nginx configurations, PM2 process lists, and any other custom configurations.

By following these monitoring and maintenance practices, you can ensure the long-term health and reliability of your Interactive Letter Application.

