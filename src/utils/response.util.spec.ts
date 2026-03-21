import { ResponseUtil } from './response.util';

describe('ResponseUtil', () => {
  describe('success', () => {
    it('should return a success response with defaults', () => {
      const result = ResponseUtil.success();

      expect(result).toEqual({
        error: false,
        data: {},
        message: 'Opération réussie',
        statusCode: 200,
      });
    });

    it('should return a success response with custom data and message', () => {
      const data = { id: '1', name: 'Test' };
      const result = ResponseUtil.success(data, 'Créé avec succès');

      expect(result.error).toBe(false);
      expect(result.data).toEqual(data);
      expect(result.message).toBe('Créé avec succès');
      expect(result.statusCode).toBe(200);
      expect(result.meta).toBeUndefined();
    });

    it('should include meta when provided', () => {
      const meta = { total: 50, page: 2, limit: 10 };
      const result = ResponseUtil.success([1, 2, 3], 'OK', meta);

      expect(result.meta).toEqual(meta);
    });

    it('should not include meta when not provided', () => {
      const result = ResponseUtil.success({ id: '1' }, 'OK');

      expect('meta' in result).toBe(false);
    });

    it('should use custom statusCode', () => {
      const result = ResponseUtil.success({}, 'Créé', undefined, 201);

      expect(result.statusCode).toBe(201);
    });
  });

  describe('error', () => {
    it('should return an error response with defaults', () => {
      const result = ResponseUtil.error();

      expect(result.error).toBe(true);
      expect(result.data).toEqual({});
      expect(result.message).toBe("Une erreur s'est produite");
      expect(result.statusCode).toBe(500);
      expect(result.timestamp).toBeDefined();
    });

    it('should return an error response with custom values', () => {
      const result = ResponseUtil.error('Not found', null, 404);

      expect(result.error).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toBe('Not found');
      expect(result.statusCode).toBe(404);
    });

    it('should include code when provided', () => {
      const result = ResponseUtil.error('Error', {}, 400, 'VALIDATION_ERROR');

      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('should not include code when not provided', () => {
      const result = ResponseUtil.error('Error', {}, 400);

      expect('code' in result).toBe(false);
    });

    it('should include details when provided', () => {
      const details = [{ field: 'name', error: 'required' }];
      const result = ResponseUtil.error('Error', {}, 400, undefined, details);

      expect(result.details).toEqual(details);
    });

    it('should not include details when not provided', () => {
      const result = ResponseUtil.error('Error');

      expect('details' in result).toBe(false);
    });

    it('should include a valid ISO timestamp', () => {
      const result = ResponseUtil.error();

      expect(() => new Date(result.timestamp!)).not.toThrow();
      expect(new Date(result.timestamp!).toISOString()).toBe(result.timestamp);
    });
  });
});
