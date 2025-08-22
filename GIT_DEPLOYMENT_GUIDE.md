# Git-Based Deployment Guide for Interactive Letter Application

This guide provides step-by-step instructions on how to deploy your Interactive Letter Application to a server using a Git repository and Docker Compose. This approach facilitates continuous integration and deployment (CI/CD) practices, making updates and rollbacks more efficient.

## 1. Setting Up Your Git Repository

Before deploying, you need to set up a Git repository for your project. This will serve as the central source of truth for your application code.

### 1.1. Create a New Remote Git Repository

Choose a Git hosting service (e.g., GitHub, GitLab, Bitbucket) and create a new, empty repository. Do **not** initialize it with a README or license file, as you will be pushing your existing project to it.

For example, on GitHub:
1. Go to [github.com/new](https://github.com/new).
2. Enter a repository name (e.g., `interactive-letter-app`).
3. Choose visibility (Public or Private).
4. Click "Create repository".

After creation, you will typically see instructions similar to these:

```bash
# ...or create a new repository on the command line
echo "# interactive-letter-app" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/interactive-letter-app.git
git push -u origin main

# ...or push an existing repository from the command line
git remote add origin https://github.com/YOUR_USERNAME/interactive-letter-app.git
git branch -M main
git push -u origin main
```

Keep this page open, as you will need the remote repository URL.

### 1.2. Initialize Your Local Project as a Git Repository

Navigate to the root directory of your `interactive-letter` project on your local machine. This is the directory containing `client/`, `server/`, `Dockerfile`, `docker-compose.yml`, etc.

```bash
cd /path/to/your/local/interactive-letter
```

Initialize a new Git repository in this directory:

```bash
git init
```

### 1.3. Add Files and Make Your First Commit

Add all your project files to the Git repository. It's crucial to ensure that sensitive files (like `.env` or `service_account.json`) are **not** committed. The `.dockerignore` file already helps prevent some of these from being included in your Docker image, but Git has its own ignore file.

Create or update a `.gitignore` file in the root of your `interactive-letter` project:

```bash
nano .gitignore
```

Add the following lines to it:

```
# Environment variables
.env
.env.local

# Google Service Account Key
server/service_account.json

# Node modules
node_modules/
client/node_modules/
server/node_modules/

# Build outputs
client/build/
server/dist/

# Logs
*.log
npm-debug.log*

# IDE files
.vscode/
.idea/

# OS generated files
.DS_Store
```

Save and close the `.gitignore` file. Now, add all files to the staging area:

```bash
git add .
```

Make your first commit:

```bash
git commit -m "Initial commit of Interactive Letter Application"
```

### 1.4. Link to Remote Repository and Push Code

Add the remote repository you created in Step 1.1. Replace `YOUR_USERNAME` and `interactive-letter-app` with your actual GitHub username and repository name.

```bash
git remote add origin https://github.com/YOUR_USERNAME/interactive-letter-app.git
```

Rename your default branch to `main` (a common practice):

```bash
git branch -M main
```

Finally, push your local code to the remote repository:

```bash
git push -u origin main
```

You will be prompted for your Git hosting service username and password/personal access token. After a successful push, your code will be available in your remote repository. You can verify this by refreshing the repository page in your web browser.



## 2. Deploying to Your Ubuntu Server with Docker Compose

Once your code is in a remote Git repository, you can easily deploy it to your Ubuntu server. This section assumes you have already configured SSH security and installed Docker and Docker Compose on your server, as detailed in the `DEPLOYMENT_GUIDE.md`.

### 2.1. Clone the Repository on Your Server

First, SSH into your Ubuntu server:

```bash
ssh ubuntu@188.121.105.115
```

Navigate to your desired deployment directory (e.g., your home directory) and clone your Git repository. Replace `YOUR_USERNAME` and `interactive-letter-app` with your actual Git repository details.

```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/interactive-letter-app.git
```

This will create a directory named `interactive-letter-app` (or whatever your repository name is) containing your project files.

### 2.2. Configure Environment Variables and Service Account

Navigate into your cloned project directory:

```bash
cd /home/ubuntu/interactive-letter-app
```

1.  **Create the `.env` file**: Copy the example environment file and then edit it with your specific Google Sheets credentials.
    ```bash
    cp .env.example .env
    nano .env
    ```
    Ensure you fill in `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, and `GOOGLE_SPREADSHEET_ID` with your actual values. Remember that `GOOGLE_PRIVATE_KEY` needs to be enclosed in double quotes and have `\n` for newlines.

2.  **Place `service_account.json`**: Transfer your `service_account.json` file (downloaded from Google Cloud) into the `server/` directory of your cloned project on the server. You can use `scp` from your local machine:
    ```bash
    scp /path/to/your/local/service_account.json ubuntu@188.121.105.115:/home/ubuntu/interactive-letter-app/server/
    ```

### 2.3. Build and Run with Docker Compose

With your environment configured and `service_account.json` in place, you can now build and run your application using Docker Compose.

```bash
docker-compose up --build -d
```

-   `--build`: This flag tells Docker Compose to build the images. It will use the `Dockerfile` in your project root. If you make changes to your code or Dockerfile, you will need to run this command again to rebuild the images.
-   `-d`: This flag runs the containers in detached mode, meaning they will run in the background and not tie up your terminal.

### 2.4. Verify Deployment

After running the `docker-compose up` command, give it a minute or two for the containers to start up. You can check the status of your running containers:

```bash
docker-compose ps
```

You should see `interactive-letter-system` (or whatever name you assigned in `docker-compose.yml`) listed with a `Up` status.

Check the application logs for any errors:

```bash
docker-compose logs -f
```

Finally, access your application in a web browser using your server's IP address and the exposed port:

```
http://188.121.105.115:5000
```

Your Interactive Letter Application should now be running, fetching data from your Google Sheet, and ready for use.

## 3. Updating the Application

To update your application with new code changes:

1.  **Push changes to your Git repository** (from your local machine):
    ```bash
    git add .
    git commit -m "Your commit message"
    git push origin main
    ```

2.  **Pull changes on your server**:
    ```bash
    ssh ubuntu@188.121.105.115
    cd /home/ubuntu/interactive-letter-app
    git pull origin main
    ```

3.  **Rebuild and restart Docker containers**:
    ```bash
    docker-compose up --build -d
    ```
    This will pull the latest code, rebuild the Docker image with your changes, and restart the application containers, ensuring your updates are live.

This Git-based deployment workflow provides a robust and efficient way to manage your application's lifecycle, from development to production.

