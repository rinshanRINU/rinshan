const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Launching Chrome with remote debugging...');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-extensions',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await sleep(1500);

  try {
    const targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
    const pageTarget = targets.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://')) || targets[0];
    if (!pageTarget) throw new Error('No page target found');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception);
      }
    };

    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    function send(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');
    await send('DOM.enable');

    console.log('Navigating to http://localhost:3000...');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2500); // Wait for preloader and hero reveal

    // Take Desktop Screenshots
    async function captureElement(selector, filename, width = 1440, height = 900) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 768
      });
      await sleep(200);

      if (selector) {
        await send('Runtime.evaluate', {
          expression: `
            if (window.lenis) {
              window.lenis.scrollTo('${selector}', { immediate: true, offset: -40 });
            } else {
              const el = document.querySelector('${selector}');
              if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
            if (window.ScrollTrigger) {
              window.ScrollTrigger.refresh();
              window.ScrollTrigger.update();
            }
          `
        });
        await sleep(1000);
      }

      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(__dirname, filename), Buffer.from(data, 'base64'));
      console.log(`Saved screenshot: ${filename}`);
    }

    console.log('Capturing desktop section views...');
    await captureElement('#hero', 'section_hero_desktop.png', 1440, 900);
    await captureElement('#work', 'section_work_desktop.png', 1440, 900);
    await captureElement('#services', 'section_services_desktop.png', 1440, 900);
    await captureElement('#showreel', 'section_showreel_desktop.png', 1440, 900);
    await captureElement('#about', 'section_about_desktop.png', 1440, 900);
    await captureElement('#contact', 'section_contact_desktop.png', 1440, 900);

    console.log('Capturing mobile section views...');
    await captureElement('#hero', 'section_hero_mobile.png', 390, 844);
    await captureElement('#work', 'section_work_mobile.png', 390, 844);
    await captureElement('#services', 'section_services_mobile.png', 390, 844);
    await captureElement('#showreel', 'section_showreel_mobile.png', 390, 844);
    await captureElement('#about', 'section_about_mobile.png', 390, 844);
    await captureElement('#contact', 'section_contact_mobile.png', 390, 844);

    ws.close();
  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    chromeProc.kill();
    console.log('Done.');
  }
}

run();
