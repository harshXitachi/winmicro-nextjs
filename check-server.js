// Check if the development server is running
const http = require('http');

function checkServer() {
    console.log('🔍 Checking if development server is running...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/debug/razorpay?key=debug123',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Server is running! Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('📦 Debug endpoint response:');
                console.log(JSON.stringify(result, null, 2));
            } catch (error) {
                console.log('📦 Raw response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Server is not running or not accessible');
        console.log('Error:', error.message);
        console.log('\n🚀 To start the server, run:');
        console.log('npm run dev');
    });

    req.end();
}

checkServer();
