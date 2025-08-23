// Test setup and validation script for AI News Assistant
const fs = require('fs');
const path = require('path');

class ExtensionTester {
    constructor() {
        this.rootDir = __dirname;
        this.errors = [];
        this.warnings = [];
        this.success = [];
    }
    
    log(type, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        
        switch(type) {
            case 'error':
                this.errors.push(message);
                console.error('\x1b[31m%s\x1b[0m', logMessage);
                break;
            case 'warning':
                this.warnings.push(message);
                console.warn('\x1b[33m%s\x1b[0m', logMessage);
                break;
            case 'success':
                this.success.push(message);
                console.log('\x1b[32m%s\x1b[0m', logMessage);
                break;
            default:
                console.log(logMessage);
        }
    }
    
    fileExists(filePath) {
        const fullPath = path.join(this.rootDir, filePath);
        return fs.existsSync(fullPath);
    }
    
    validateManifest() {
        this.log('info', 'Validating manifest.json...');
        
        if (!this.fileExists('manifest.json')) {
            this.log('error', 'manifest.json not found');
            return false;
        }
        
        try {
            const manifestContent = fs.readFileSync(path.join(this.rootDir, 'manifest.json'), 'utf8');
            const manifest = JSON.parse(manifestContent);
            
            // Check required fields
            const requiredFields = ['manifest_version', 'name', 'version', 'permissions', 'content_scripts'];
            for (const field of requiredFields) {
                if (!manifest[field]) {
                    this.log('error', `manifest.json missing required field: ${field}`);
                }
            }
            
            // Check permissions
            const requiredPermissions = ['activeTab', 'storage', 'sidePanel'];
            for (const permission of requiredPermissions) {
                if (!manifest.permissions.includes(permission)) {
                    this.log('warning', `Missing permission: ${permission}`);
                }
            }
            
            this.log('success', 'Manifest validation completed');
            return true;
            
        } catch (error) {
            this.log('error', `Invalid manifest.json: ${error.message}`);
            return false;
        }
    }
    
    validateExtensionFiles() {
        this.log('info', 'Validating extension files...');
        
        const requiredFiles = [
            'src/background.js',
            'src/content.js', 
            'src/content.css',
            'src/sidepanel.html',
            'src/sidepanel.css',
            'src/sidepanel.js',
            'src/popup.html',
            'src/popup.js',
            'src/i18n.js',
            'src/utils.js'
        ];
        
        for (const file of requiredFiles) {
            if (this.fileExists(file)) {
                this.log('success', `Found ${file}`);
            } else {
                this.log('error', `Missing file: ${file}`);
            }
        }
        
        // Check icons
        const iconSizes = [16, 32, 48, 128];
        for (const size of iconSizes) {
            if (this.fileExists(`public/icons/icon${size}.svg`)) {
                this.log('success', `Found icon${size}.svg`);
            } else {
                this.log('warning', `Missing icon${size}.svg`);
            }
        }
    }
    
    validateBackend() {
        this.log('info', 'Validating backend setup...');
        
        const backendFiles = [
            'backend/package.json',
            'backend/server.js',
            'backend/ai-client.js'
        ];
        
        for (const file of backendFiles) {
            if (this.fileExists(file)) {
                this.log('success', `Found ${file}`);
            } else {
                this.log('error', `Missing backend file: ${file}`);
            }
        }
        
        // Validate package.json
        if (this.fileExists('backend/package.json')) {
            try {
                const packageContent = fs.readFileSync(path.join(this.rootDir, 'backend/package.json'), 'utf8');
                const packageData = JSON.parse(packageContent);
                
                const requiredDeps = ['express', 'cors', 'cloudscraper', 'helmet'];
                for (const dep of requiredDeps) {
                    if (packageData.dependencies && packageData.dependencies[dep]) {
                        this.log('success', `Backend dependency found: ${dep}`);
                    } else {
                        this.log('error', `Missing backend dependency: ${dep}`);
                    }
                }
            } catch (error) {
                this.log('error', `Invalid backend package.json: ${error.message}`);
            }
        }
    }
    
    async testAPIConnection() {
        this.log('info', 'Testing AI API connection...');
        
        try {
            // Simulate the AI client test
            const AINewsClient = require('./backend/ai-client.js');
            const client = new AINewsClient();
            
            // Test with a simple article
            const testArticle = {
                title: 'Test Article: Market Update',
                content: 'This is a test article about market conditions. The stock market has shown mixed results today with technology stocks declining while energy sectors gained. Trading volume was above average.',
                author: 'Test Author',
                date: new Date().toISOString()
            };
            
            const preferences = {
                summaryLength: 'short',
                focusArea: 'economic',
                language: 'english'
            };
            
            this.log('info', 'Attempting to generate test summary...');
            
            // Note: This will make an actual API call, so it requires valid credentials
            // In a real test environment, you might want to mock this
            const summary = await client.summarizeArticle(testArticle, preferences);
            
            if (summary && summary.summary) {
                this.log('success', 'AI API connection successful');
                this.log('info', `Test summary: ${summary.summary.substring(0, 100)}...`);
                return true;
            } else {
                this.log('error', 'AI API returned invalid response');
                return false;
            }
            
        } catch (error) {
            this.log('error', `AI API connection failed: ${error.message}`);
            this.log('warning', 'This might be due to network issues or API credentials');
            return false;
        }
    }
    
    generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total_checks: this.success.length + this.warnings.length + this.errors.length,
                successful: this.success.length,
                warnings: this.warnings.length,
                errors: this.errors.length
            },
            details: {
                successes: this.success,
                warnings: this.warnings,
                errors: this.errors
            }
        };
        
        // Write report to file
        fs.writeFileSync(
            path.join(this.rootDir, 'test-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        return report;
    }
    
    async runAllTests() {
        console.log('\x1b[36m%s\x1b[0m', '🤖 AI News Assistant Extension - Test Suite');
        console.log('='.repeat(60));
        
        // Run all validation tests
        this.validateManifest();
        this.validateExtensionFiles();
        this.validateBackend();
        
        // Test API connection (optional, might fail in CI)
        try {
            await this.testAPIConnection();
        } catch (error) {
            this.log('warning', 'API test skipped - requires valid credentials');
        }
        
        // Generate report
        const report = this.generateTestReport();
        
        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('\x1b[36m%s\x1b[0m', '📊 Test Summary:');
        console.log(`✅ Successful checks: ${report.summary.successful}`);
        console.log(`⚠️  Warnings: ${report.summary.warnings}`);
        console.log(`❌ Errors: ${report.summary.errors}`);
        
        if (report.summary.errors === 0) {
            console.log('\n\x1b[32m%s\x1b[0m', '🎉 Extension is ready for testing!');
            console.log('\nNext steps:');
            console.log('1. Start backend: cd backend && npm install && npm start');
            console.log('2. Load extension in Chrome: chrome://extensions/ -> Load unpacked');
            console.log('3. Visit a Bloomberg/Reuters article to test');
        } else {
            console.log('\n\x1b[31m%s\x1b[0m', '⚠️  Please fix the errors before testing');
        }
        
        console.log(`\n📄 Detailed report saved to: test-report.json`);
        
        return report.summary.errors === 0;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new ExtensionTester();
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = ExtensionTester;