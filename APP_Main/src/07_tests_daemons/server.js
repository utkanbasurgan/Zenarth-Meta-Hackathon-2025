const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002; // Using port 3002 to avoid conflicts with existing server
const TEST_PORT = 3000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Test endpoint responses
const testResponses = {
    '/test': {
        method: 'GET',
        response: {
            status: 'success',
            message: 'Test endpoint is working',
            timestamp: new Date().toISOString(),
            data: {
                server: 'Test Server',
                version: '1.0.0',
                uptime: process.uptime()
            }
        }
    },
    '/test/health': {
        method: 'GET',
        response: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: 'connected',
                memory: process.memoryUsage(),
                uptime: process.uptime()
            }
        }
    }
};

// Create HTTP server
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    console.log(`${method} ${pathname}`);

    // Handle test endpoints
    if (testResponses[pathname] && testResponses[pathname].method === method) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(testResponses[pathname].response, null, 2));
        return;
    }

    // Handle POST to /test
    if (pathname === '/test' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('Received test data:', data);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'success',
                    message: 'Test data received',
                    received: data,
                    timestamp: new Date().toISOString()
                }, null, 2));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'error',
                    message: 'Invalid JSON data',
                    error: error.message
                }, null, 2));
            }
        });
        return;
    }

    // Serve static files
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);

    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server error');
            }
            return;
        }

        // Get file extension and set appropriate MIME type
        const ext = path.extname(filePath).toLowerCase();
        const mimeType = mimeTypes[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Test website server running on http://localhost:${PORT}`);
    console.log(`📡 Test endpoint available at http://localhost:${PORT}/test`);
    console.log(`🏥 Health check available at http://localhost:${PORT}/test/health`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  GET  /test        - Test endpoint');
    console.log('  POST /test        - Accept test data');
    console.log('  GET  /test/health - Health check');
    console.log('  GET  /            - Test website');
    console.log('  GET  /index.html  - Test website');
    console.log('');
    console.log('Open your browser and go to:');
    console.log(`  http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down test server...');
    server.close(() => {
        console.log('✅ Test server stopped');
        process.exit(0);
    });
});

// Error handling
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('Please stop the existing server or use a different port');
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
