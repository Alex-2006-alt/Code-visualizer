import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { executeCode, runCode } from '@/lib/api'
import { useToastStore } from '@/components/ui/toastStore'

describe('api.ts Error Mapping Contract Tests', () => {
  beforeEach(() => {
    // Reset toast store before each test
    useToastStore.setState({ toasts: [] })
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps 400 Syntax/Compile Error to clear Toast and throws descriptive error', async () => {
    const errorPayload = {
      detail: 'SyntaxError: invalid syntax (<user>, line 1)',
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(errorPayload), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await expect(executeCode('def invalid(')).rejects.toThrow('SyntaxError: invalid syntax (<user>, line 1)')

    const toasts = useToastStore.getState().toasts
    expect(toasts.length).toBeGreaterThan(0)
    const errToast = toasts.find((t) => t.type === 'error')
    expect(errToast).toBeDefined()
    expect(errToast?.title).toBe('Syntax / Runtime Error')
    expect(errToast?.description).toContain('SyntaxError: invalid syntax')
  })

  it('maps 422 Unprocessable Entity (FastAPI Validation Error) to clear Toast', async () => {
    const pydanticError = {
      detail: [
        {
          loc: ['body', 'code'],
          msg: 'Field required',
          type: 'missing',
        },
      ],
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(pydanticError), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await expect(executeCode('x = 1')).rejects.toThrow('body.code: Field required')

    const toasts = useToastStore.getState().toasts
    expect(toasts.length).toBeGreaterThan(0)
    const valToast = toasts.find((t) => t.title === 'Validation Error')
    expect(valToast).toBeDefined()
    expect(valToast?.type).toBe('error')
    expect(valToast?.description).toContain('body.code: Field required')
  })

  it('maps 429 Rate Limit Exceeded to clear Toast and never crashes', async () => {
    const rateLimitPayload = {
      detail: 'Rate limit exceeded: 20 requests per minute allowed. Try again in 45s.',
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(rateLimitPayload), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await expect(executeCode('print("hello")')).rejects.toThrow('Rate limit exceeded')

    const toasts = useToastStore.getState().toasts
    const rateToast = toasts.find((t) => t.title === 'Rate Limit Exceeded')
    expect(rateToast).toBeDefined()
    expect(rateToast?.type).toBe('error')
    expect(rateToast?.description).toContain('20 requests per minute allowed')
  })

  it('maps 503 Concurrency Guard (Server Busy) to clear Toast', async () => {
    const concurrencyPayload = {
      detail: 'Server is busy. Max concurrent sandboxes reached. Please retry.',
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(concurrencyPayload), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await expect(executeCode('x = 10')).rejects.toThrow('Server is busy')

    const toasts = useToastStore.getState().toasts
    const busyToast = toasts.find((t) => t.title === 'Server Busy')
    expect(busyToast).toBeDefined()
    expect(busyToast?.type).toBe('error')
    expect(busyToast?.description).toContain('Max concurrent sandboxes reached')
  })

  it('maps 408/504 Execution Timeout to clear Toast', async () => {
    const timeoutPayload = {
      detail: 'Execution timed out after 5.0 seconds.',
    }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(timeoutPayload), {
        status: 408,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await expect(executeCode('while True: pass')).rejects.toThrow(/execution time/i)

    const toasts = useToastStore.getState().toasts
    const timeoutToast = toasts.find((t) => t.title === 'Execution Timeout')
    expect(timeoutToast).toBeDefined()
    expect(timeoutToast?.type).toBe('error')
    expect(timeoutToast?.description).toContain('Execution timed out after 5.0 seconds.')
  })

  it('handles Network Down / Fetch TypeError gracefully with Toast without crashing', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new TypeError('Failed to fetch (net::ERR_CONNECTION_REFUSED)')
    )

    try {
      await executeCode('x = 1')
    } catch (err) {
      expect(err).toBeInstanceOf(TypeError)
    }

    const toasts = useToastStore.getState().toasts
    const netToast = toasts.find((t) => t.title === 'Network Error')
    expect(netToast).toBeDefined()
    expect(netToast?.type).toBe('error')
  })

  it('handles Malformed JSON from server without crashing and alerts user', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('<html><body>502 Bad Gateway from Nginx Proxy</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    await expect(executeCode('x = 1')).rejects.toThrow('Malformed JSON response from server')

    const toasts = useToastStore.getState().toasts
    const malformedToast = toasts.find((t) => t.title === 'Malformed Response')
    expect(malformedToast).toBeDefined()
    expect(malformedToast?.type).toBe('error')
    expect(malformedToast?.description).toContain('Received invalid JSON data')
  })

  it('returns empty array and warning Toast on empty code input', async () => {
    const steps = await runCode('   \n\t  ')
    expect(steps).toEqual([])

    const toasts = useToastStore.getState().toasts
    const warnToast = toasts.find((t) => t.title === 'Empty Code')
    expect(warnToast).toBeDefined()
    expect(warnToast?.type).toBe('warning')
  })
})
