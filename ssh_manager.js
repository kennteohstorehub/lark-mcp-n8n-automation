#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

class SSHManager {
    constructor() {
        this.connections = new Map();
    }

    async connect(host, options = {}) {
        const connectionId = `${host}_${Date.now()}`;
        
        const sshOptions = [
            '-o ConnectTimeout=10',
            '-o StrictHostKeyChecking=accept-new',
            ...(options.port ? [`-p ${options.port}`] : []),
            ...(options.key ? [`-i ${options.key}`] : []),
            ...(options.user ? [`${options.user}@${host}`] : [host])
        ];
        
        return new Promise((resolve, reject) => {
            const testCommand = `ssh ${sshOptions.join(' ')} "echo 'Connection test successful'"`;
            
            exec(testCommand, { timeout: 15000 }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`SSH connection failed: ${error.message}`));
                } else {
                    this.connections.set(connectionId, { host, options, lastUsed: Date.now() });
                    resolve({ connectionId, message: stdout.trim() });
                }
            });
        });
    }

    async execute(host, command, options = {}) {
        const sshOptions = [
            '-o ConnectTimeout=10',
            '-o StrictHostKeyChecking=accept-new',
            ...(options.port ? [`-p ${options.port}`] : []),
            ...(options.key ? [`-i ${options.key}`] : []),
            ...(options.user ? [`${options.user}@${host}`] : [host])
        ];
        
        const fullCommand = `ssh ${sshOptions.join(' ')} "${command}"`;
        
        return new Promise((resolve, reject) => {
            exec(fullCommand, { timeout: 30000 }, (error, stdout, stderr) => {
                resolve({
                    command,
                    host,
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    success: !error,
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    async uploadFile(localPath, remotePath, host, options = {}) {
        const scpOptions = [
            '-o ConnectTimeout=10',
            '-o StrictHostKeyChecking=accept-new',
            ...(options.port ? [`-P ${options.port}`] : []),
            ...(options.key ? [`-i ${options.key}`] : [])
        ];
        
        const target = options.user ? `${options.user}@${host}:${remotePath}` : `${host}:${remotePath}`;
        const command = `scp ${scpOptions.join(' ')} "${localPath}" "${target}"`;
        
        return new Promise((resolve, reject) => {
            exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
                resolve({
                    localPath,
                    remotePath,
                    host,
                    success: !error,
                    message: error ? error.message : 'File uploaded successfully',
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    getActiveConnections() {
        return Array.from(this.connections.entries()).map(([id, info]) => ({
            id,
            ...info
        }));
    }
}

module.exports = SSHManager;

// Demo if run directly
if (require.main === module) {
    const ssh = new SSHManager();
    
    async function demo() {
        console.log("🔗 SSH Manager Demo");
        
        try {
            // Test localhost connection
            const result = await ssh.execute('localhost', 'echo "SSH Manager working!" && date');
            console.log("✅ SSH execution result:", result);
            
        } catch (error) {
            console.error("❌ SSH demo error:", error.message);
        }
    }
    
    demo();
}
