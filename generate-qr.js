const qrcode = require('qrcode-terminal');

// Get the Expo URL from the current running instance
// This is typically in the format exp://192.168.x.x:8081
const expoUrl = 'exp://192.168.0.125:8081';

console.log('Scan this QR code with the Expo Go app on your device:');
qrcode.generate(expoUrl, {small: true});

console.log('\nOr use this URL in Expo Go: ' + expoUrl);
console.log('\nMake sure your device is on the same WiFi network as this computer.');
