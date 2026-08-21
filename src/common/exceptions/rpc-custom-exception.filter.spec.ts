import { ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RpcCustomExceptionFilter } from './rpc-custom-exception.filter';

/**
 * Minimal mock of Express Response – only the parts the filter touches.
 */
function buildMockResponse() {
  const json = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnValue({ json });
  return { status, json };
}

function buildHost(
  mockResponse: ReturnType<typeof buildMockResponse>,
): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
    }),
  } as unknown as ArgumentsHost;
}

describe('RpcCustomExceptionFilter', () => {
  let filter: RpcCustomExceptionFilter;

  beforeEach(() => {
    filter = new RpcCustomExceptionFilter();
  });

  it('returns 500 when the RPC error contains "Empty response"', () => {
    const mockResponse = buildMockResponse();
    const host = buildHost(mockResponse);
    const exception = new RpcException('Empty response (some context)');

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 500 }),
    );
  });

  it('returns the status from the RPC error object when it has status + message', () => {
    const mockResponse = buildMockResponse();
    const host = buildHost(mockResponse);
    const exception = new RpcException({ status: 404, message: 'Not found' });

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 404, message: 'Not found' }),
    );
  });

  it('falls back to 400 when the RPC error object has a non-numeric status', () => {
    const mockResponse = buildMockResponse();
    const host = buildHost(mockResponse);
    const exception = new RpcException({ status: 'INVALID', message: 'oops' });

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when the RPC error is a plain string (not "Empty response")', () => {
    const mockResponse = buildMockResponse();
    const host = buildHost(mockResponse);
    const exception = new RpcException('Unknown failure');

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 400 }),
    );
  });
});
