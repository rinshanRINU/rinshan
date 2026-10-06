const http = require('http');
http.get('http://localhost:3000', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('Title:', d.match(/<title>.*?<\/title>/)?.[0]);
    console.log('Has id="services":', d.includes('id="services"'));
    console.log('Has service-row:', d.includes('service-row'));
  });
});
