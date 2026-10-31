const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  console.log('=== STARTING CUSTOM CODE EXECUTION PROOF TEST ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR] ${msg.text()}`);
    }
  });

  // Track /run network calls
  const runRequests = [];
  page.on('request', req => {
    if (req.url().includes('run')) {
      runRequests.push({ url: req.url(), body: req.postData() });
      console.log(`[NETWORK REQ] POST ${req.url()}`, req.postData());
    }
  });
  page.on('response', async res => {
    if (res.url().includes('run')) {
      const txt = await res.text().catch(() => '');
      console.log(`[NETWORK RES] ${res.status()}`, txt.slice(0, 160) + '...');
    }
  });

  // 1. Navigate to workspace
  console.log('Step 1: Navigating to workspace...');
  await page.goto('http://127.0.0.1:5173/workspace', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const initialPreset = await page.evaluate(() => window.useTraceStore.getState().currentPreset?.id);
  console.log('Initial preset:', initialPreset);
  assert.strictEqual(initialPreset, 'two-sum', 'Initial preset should be two-sum');

  // 2. Replace editor code with custom code
  console.log('\nStep 2: Replacing code with custom program: x = 41 + 1\\nprint("hello123", x)');
  const customCode = 'x = 41 + 1\nprint("hello123", x)';
  await page.evaluate((code) => {
    window.useTraceStore.getState().setCode(code);
  }, customCode);
  await page.waitForTimeout(500);

  const stateAfterEdit = await page.evaluate(() => {
    const s = window.useTraceStore.getState();
    return {
      code: s.code,
      currentPreset: s.currentPreset,
    };
  });
  console.log('Store state after editing:');
  console.log('  code:', JSON.stringify(stateAfterEdit.code));
  console.log('  currentPreset:', stateAfterEdit.currentPreset);
  assert.strictEqual(stateAfterEdit.currentPreset, null, 'currentPreset should be null for custom code');

  // Verify dropdown shows "Custom Script"
  const selectedDropdownValue = await page.locator('select').first().inputValue();
  console.log('  dropdown selected value:', selectedDropdownValue);
  assert.strictEqual(selectedDropdownValue, 'custom', 'Dropdown must reflect custom script selection');

  // 3. Click Run
  console.log('\nStep 3: Pressing Run button...');
  const runBtn = page.getByRole('button', { name: /run/i }).first();
  await runBtn.click();

  // Wait for the /run network response
  const runResponse = await page.waitForResponse(res => res.url().includes('run'), { timeout: 15000 });
  assert.strictEqual(runResponse.status(), 200, 'POST /run must succeed with 200 OK');
  await page.waitForTimeout(1000);

  // 4. Verify Store State
  const stateAfterRun = await page.evaluate(() => {
    const s = window.useTraceStore.getState();
    return {
      stepsCount: s.steps.length,
      currentStep: s.currentStep,
      step0: s.steps[0],
      step2: s.steps[2],
      step3: s.steps[3],
    };
  });
  console.log('\nStep 4: Store State after custom code execution:');
  console.log('  stepsCount:', stateAfterRun.stepsCount);
  assert.strictEqual(stateAfterRun.stepsCount, 4, 'Custom program must produce exactly 4 steps');

  console.log('  Step 2 locals:', stateAfterRun.step2?.stack[0]?.locals);
  assert.deepStrictEqual(stateAfterRun.step2?.stack[0]?.locals, { x: 42 }, 'Step 2 must evaluate x = 42');

  console.log('  Step 3 output:', JSON.stringify(stateAfterRun.step3?.output));
  assert.strictEqual(stateAfterRun.step3?.output, 'hello123 42\n', 'Step 3 must output "hello123 42\\n"');

  // 5. Verify UI Panels
  console.log('\nStep 5: Verifying UI Panels rendered custom trace:');
  // Step forward to step 2 to verify VariablesTable
  const stepForwardBtn = page.locator('button[aria-label="Step forward"]');
  await stepForwardBtn.click(); // step 1
  await page.waitForTimeout(150);
  await stepForwardBtn.click(); // step 2
  await page.waitForTimeout(200);

  const variablesHtml = await page.locator('[data-testid="variables-content"]').textContent().catch(() => '');
  console.log('  Variables table text at step 2:', variablesHtml.replace(/\s+/g, ' ').trim());
  assert.ok(variablesHtml.includes('x'), 'Variables table must display variable x');
  assert.ok(variablesHtml.includes('42'), 'Variables table must display value 42');
  assert.ok(!variablesHtml.includes('target'), 'Variables table must NOT contain two_sum target');
  assert.ok(!variablesHtml.includes('nums'), 'Variables table must NOT contain two_sum nums');

  // Step forward to step 3 to verify OutputTerminal
  await stepForwardBtn.click(); // step 3
  await page.waitForTimeout(200);

  const terminalText = await page.locator('[data-testid="terminal-content"]').textContent().catch(() => '');
  console.log('  Terminal text at step 3:', JSON.stringify(terminalText.replace(/\s+/g, ' ').trim()));
  assert.ok(terminalText.includes('hello123 42'), 'Terminal must display "hello123 42"');
  assert.ok(!terminalText.includes('Indices:'), 'Terminal must NOT contain Two Sum output');

  // 6. Verify Preset Switching works cleanly
  console.log('\nStep 6: Testing switching back to a preset (Bubble Sort)...');
  await page.locator('select').first().selectOption('bubble-sort');
  await page.waitForTimeout(500);

  const bubbleState = await page.evaluate(() => {
    const s = window.useTraceStore.getState();
    return {
      currentPreset: s.currentPreset?.id,
      codeHasBubble: s.code.includes('bubble_sort'),
      stepsCount: s.steps.length,
    };
  });
  console.log('  Preset loaded:', bubbleState.currentPreset, 'Steps:', bubbleState.stepsCount);
  assert.strictEqual(bubbleState.currentPreset, 'bubble-sort');
  assert.ok(bubbleState.codeHasBubble, 'Bubble sort code should be loaded');

  // 7. Verify Error Handling for invalid syntax
  console.log('\nStep 7: Testing syntax error handling...');
  await page.evaluate(() => {
    window.useTraceStore.getState().setCode('def broken(');
  });
  await runBtn.click();
  await page.waitForResponse(res => res.url().includes('run'), { timeout: 10000 });
  await page.waitForTimeout(500);

  const errorState = await page.evaluate(() => {
    const s = window.useTraceStore.getState();
    return {
      stepsCount: s.steps.length,
      executionError: s.executionError,
    };
  });
  console.log('  Error state:', errorState);
  assert.strictEqual(errorState.stepsCount, 0, 'Steps must be cleared when execution errors');
  assert.ok(errorState.executionError && errorState.executionError.includes('SyntaxError'), 'Must capture SyntaxError');

  await browser.close();
  console.log('\n=== ALL PROOF TESTS PASSED SUCCESSFULLY! ===');
})();
