import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TestTube, Play, StopCircle, Bug, CheckCircle, XCircle } from 'lucide-react';
import { usePoetryStore } from '@/lib/store/poetry-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const AnonymousPoemTester: React.FC = () => {
  const [testContent, setTestContent] = useState('');
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    success: boolean;
    message: string;
    timestamp: Date;
  }>>([]);

  const {
    createAnonymousPoem,
    generateTestAnonymousPoems,
    clearAnonymousPoems,
    anonymousPoems,
    isLoading
  } = usePoetryStore();

  const runTests = async () => {
    const results = [];
    
    // Test 1: Normal poem creation
    results.push(await runTest('Normal Creation', () => 
      createAnonymousPoem(testContent || 'This is a test poem for normal creation.')
    ));

    // Test 2: Empty content
    results.push(await runTest('Empty Content Validation', () => 
      createAnonymousPoem('', { simulateError: false })
    ));

    // Test 3: Short content
    results.push(await runTest('Short Content Validation', () => 
      createAnonymousPoem('Short', { simulateError: false })
    ));

    // Test 4: Simulated error
    results.push(await runTest('Error Simulation', () => 
      createAnonymousPoem('This should fail with simulated error.', { simulateError: true })
    ));

    // Test 5: Custom proof
    results.push(await runTest('Custom Proof', () => 
      createAnonymousPoem('Poem with custom proof.', {
        customProof: {
          commitment: '0x' + 'c0de'.repeat(16),
          nullifier: '0x' + 'babe'.repeat(16),
          verified: true,
          poemId: 'custom_test'
        }
      })
    ));

    setTestResults(results);
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    try {
      const result = await testFn();
      return {
        test: testName,
        success: result.success,
        message: result.success ? '✓ Test passed' : `✗ ${result.error}`,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        test: testName,
        success: false,
        message: `✗ ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
    }
  };

  const generateSampleContent = () => {
    const samples = [
      `In the silent spaces between code,\nWhere algorithms learn and nodes commune,\nI find my voice without a name,\nA digital ghost in the blockchain flame.`,

      `Encrypted whispers on the chain,\nMy identity I disclaim,\nYet through the math, my rights remain,\nIn zero-knowledge, I reclaim.`,

      `No face, no name, just pure intent,\nThrough cryptographic walls I've sent,\nA piece of soul, forever lent,\nTo this digital continent.`
    ];
    
    setTestContent(samples[Math.floor(Math.random() * samples.length)]);
  };

  return (
    <Card className="p-6 border border-warning/30 bg-warning/5">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-warning">
        <TestTube size={20} />
        Anonymous Poem Testing Suite
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Poem Content</label>
          <textarea
            value={testContent}
            onChange={(e) => setTestContent(e.target.value)}
            placeholder="Enter test poem content or generate sample..."
            className="input-field"
            rows={4}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={generateSampleContent}
            className="mt-2"
          >
            Generate Sample Content
          </Button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={runTests}
            loading={isLoading}
            icon={Play}
            variant="outline"
          >
            Run All Tests
          </Button>
          
          <Button
            onClick={() => generateTestAnonymousPoems(5)}
            loading={isLoading}
            icon={Bug}
            variant="outline"
          >
            Generate 5 Test Poems
          </Button>
          
          <Button
            onClick={clearAnonymousPoems}
            icon={StopCircle}
            variant="outline"
          >
            Clear Test Poems
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Test Results:</h4>
            {testResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded text-sm ${
                  result.success ? 'bg-accent/10 border border-accent/20' : 'bg-error/10 border border-error/20'
                }`}
              >
                {result.success ? (
                  <CheckCircle size={16} className="text-accent" />
                ) : (
                  <XCircle size={16} className="text-error" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{result.test}</div>
                  <div className={result.success ? 'text-accent' : 'text-error'}>
                    {result.message}
                  </div>
                </div>
                <div className="text-xs text-text-muted">
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Test Poems List */}
        {anonymousPoems.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-3">
              Test Poems ({anonymousPoems.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {anonymousPoems.map((poem) => (
                <motion.div
                  key={poem.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-white/5 rounded text-sm"
                >
                  <div className="font-medium truncate">
                    {poem.content.split('\n')[0]}
                  </div>
                  <div className="text-xs text-text-muted flex justify-between mt-1">
                    <span>ID: {poem.id.slice(0, 8)}...</span>
                    <span>{poem.createdAt.toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};