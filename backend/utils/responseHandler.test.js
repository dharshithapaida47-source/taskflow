const { errorResponse, successResponse } = require('./responseHandler');

// Build a fake Express response that records what status/json were called with.
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorResponse', () => {
  test('sets the right status code and an error payload', () => {
    const res = mockRes();
    errorResponse(res, 400, 'Invalid input');

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid input'
    });
  });

  test('includes details when provided', () => {
    const res = mockRes();
    errorResponse(res, 500, 'Server error', 'stack trace here');

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server error',
      details: 'stack trace here'
    });
  });

  test('omits details when not provided', () => {
    const res = mockRes();
    errorResponse(res, 404, 'Not found');

    const payload = res.json.mock.calls[0][0];
    expect(payload).not.toHaveProperty('details');
  });
});

describe('successResponse', () => {
  test('sets the right status code and a success payload', () => {
    const res = mockRes();
    successResponse(res, 200, 'OK');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'OK'
    });
  });

  test('includes data when provided', () => {
    const res = mockRes();
    successResponse(res, 201, 'Created', { id: 'abc' });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Created',
      data: { id: 'abc' }
    });
  });
});
