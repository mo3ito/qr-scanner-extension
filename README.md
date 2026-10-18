## Installation (Manual)

Follow these steps to install the QR Scanner Chrome extension manually.

### 1. Clone the Repository

Make sure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

```bash
git clone https://github.com/mo3ito/qr-scanner-extension.git
cd qr-scanner-extension
```

### 2. Install Dependencies and Build

```bash
pnpm install
pnpm build
```

This generates the production-ready extension files in the `dist` directory.

### 3. Load the Extension in Chrome

1. Open Google Chrome.
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the `dist` folder inside the cloned project.
6. Pin **QR Scanner** to your Chrome toolbar for easy access.

### 4. Use the Extension

1. Click the QR Scanner icon in the Chrome toolbar.
2. Allow camera access if prompted.
3. Point your camera or webcam at a QR code.
4. View the scanned result and copy it or open the link if needed.

**Note:** Camera access depends on browser permissions and your device's available camera. Always verify that a scanned URL is trustworthy before opening it.

### Updating the Extension

Pull the latest changes and rebuild the project:

```bash
git pull
pnpm install
pnpm build
```

Then return to `chrome://extensions` and click the **Reload** icon on the QR Scanner extension.