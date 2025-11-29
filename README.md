### **Procedure : Updating the Frontend**

**Objective:** Pull the latest frontend code, build it, and replace the old static files on the web server.

**[ON YOUR VPS]**

1.  **Navigate to the Frontend Directory:**
    ```bash
    cd ~/dycom-ecommerce-frontend
    ```

2.  **Pull the Latest Code from GitHub:**
    ```bash
    git pull origin main
    ```

3.  **Install/Update Dependencies:**
    ```bash
    npm install
    ```

4.  **Build the New Production Files:**
    This creates a fresh `dist` directory with your updated application.
    ```bash
    npm run build
    ```

5.  **Deploy the New Build:**
    This sequence removes the old static files and copies the new ones into the Nginx web root.
    ```bash
    # First, remove the old files
    sudo rm -rf /var/www/dycom-club.com/*

    # Then, copy the new files from your build output
    sudo cp -r dist/* /var/www/dycom-club.com/
    ```