const qrcode = require('qrcode-terminal');

// Generate SDK 51 QR Code
console.log('\n\x1b[36m=== SDK 51 QR Code ===\x1b[0m');
console.log('\x1b[33mScan with Expo Go app to open on your mobile device\x1b[0m');
console.log(`URL: exp://192.168.0.115:8081\n`);
qrcode.generate('exp://192.168.0.115:8081', {small: true});

// Generate SDK 53 QR Code
console.log('\n\x1b[36m=== SDK 53 QR Code ===\x1b[0m');
console.log('\x1b[33mScan with Expo Go app to open on your mobile device\x1b[0m');
console.log(`URL: exp://192.168.0.115:8082\n`);
qrcode.generate('exp://192.168.0.115:8082', {small: true});

// Generate Web QR Code
console.log('\n\x1b[36m=== Web Version QR Code ===\x1b[0m');
console.log('\x1b[33mScan to open web version in mobile browser\x1b[0m');
console.log(`URL: http://192.168.0.115:3000\n`);
qrcode.generate('http://192.168.0.115:3000', {small: true});

console.log('\n\x1b[32mWeb server running at: \x1b[0m\x1b[1mhttp://192.168.0.115:3000\x1b[0m');
console.log('\x1b[32mQR codes available at: \x1b[0m\x1b[1mhttp://192.168.0.115:3000/qrcodes/index.html\x1b[0m\n');
