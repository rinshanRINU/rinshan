const { spawn } = require('child_process');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  '--remote-debugging-port=9223',
  '--disable-extensions',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank'
]);

setTimeout(async () => {
  try {
    const targets = await new Promise((res, rej) => {
      http.get('http://127.0.0.1:9223/json', r => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => res(JSON.parse(d)));
      }).on('error', rej);
    });
    console.log('Targets:', targets.map(t => ({ type: t.type, url: t.url })));
    const target = targets.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://')) || targets[0];
    
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;
    const send = (method, params = {}) => new Promise(res => {
      const cur = id++;
      const handler = (evt) => {
        const m = JSON.parse(evt.data);
        if (m.id === cur) {
          ws.removeEventListener('message', handler);
          res(m);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: cur, method, params }));
    });

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await new Promise(r => setTimeout(r, 2000));

    const evalExpr = async (expr) => {
      const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
      return res.result.result.value;
    };

    console.log('Location:', await evalExpr('window.location.href'));
    console.log('Title:', await evalExpr('document.title'));
    console.log('Services element found:', await evalExpr('!!document.querySelector("#services")'));
    console.log('Service rows count:', await evalExpr('document.querySelectorAll(".service-row").length'));

    // Check service rows computed style before scroll
    console.log('Row 0 before scroll opacity:', await evalExpr('getComputedStyle(document.querySelector(".service-row")).opacity'));

    // Scroll to services
    await evalExpr('window.lenis.scrollTo("#services", { immediate: true, offset: -40 }); ScrollTrigger.refresh(); ScrollTrigger.update();');
    await new Promise(r => setTimeout(r, 1000));

    console.log('Row 0 after scroll opacity:', await evalExpr('getComputedStyle(document.querySelector(".service-row")).opacity'));
    console.log('Row 0 rect:', await evalExpr('JSON.stringify(document.querySelector(".service-row").getBoundingClientRect())'));

    ws.close();
  } catch (err) {
    console.error(err);
  } finally {
    chrome.kill();
  }
}, 1000);
