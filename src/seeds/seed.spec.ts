/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports */
describe('seed', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should seed all entities when database is empty', async () => {
    let idCounter = 0;
    const mockFindOne = jest.fn().mockResolvedValue(null);
    const mockSave = jest.fn().mockImplementation((data) => ({
      id: ++idCounter,
      ...data,
    }));
    const mockCreate = jest.fn().mockImplementation((data) => data);
    const mockInitialize = jest.fn().mockResolvedValue(undefined);
    const mockDestroy = jest.fn().mockResolvedValue(undefined);

    jest.isolateModules(() => {
      jest.doMock('bcryptjs', () => ({
        hash: jest.fn().mockResolvedValue('hashed_pw'),
      }));
      jest.doMock('src/config/ormconfig', () => ({
        AppDataSource: {
          initialize: mockInitialize,
          getRepository: jest.fn().mockReturnValue({
            findOne: mockFindOne,
            save: mockSave,
            create: mockCreate,
          }),
          destroy: mockDestroy,
        },
      }));
      require('./seed');
    });

    await new Promise((r) => setTimeout(r, 500));

    expect(mockInitialize).toHaveBeenCalledTimes(1);
    expect(mockDestroy).toHaveBeenCalledTimes(1);
    // 8 units + 3 users + 5 customers + 4 suppliers + 5 payment methods + 8 products + 14 product units = 47
    expect(mockSave).toHaveBeenCalledTimes(47);
    expect(console.log).toHaveBeenCalledWith('Database connected.');
    expect(console.log).toHaveBeenCalledWith('✔ 8 units seeded.');
    expect(console.log).toHaveBeenCalledWith('✔ 3 users seeded.');
    expect(console.log).toHaveBeenCalledWith('✔ 5 customers seeded.');
    expect(console.log).toHaveBeenCalledWith('✔ 4 suppliers seeded.');
    expect(console.log).toHaveBeenCalledWith('✔ 5 payment methods seeded.');
    expect(console.log).toHaveBeenCalledWith('✔ 8 products seeded.');
    expect(console.log).toHaveBeenCalledWith('✔ 14 product units seeded.');
    expect(console.log).toHaveBeenCalledWith('\n🎉 Seed completed!');
  });

  it('should skip existing entities', async () => {
    const mockFindOne = jest.fn().mockImplementation((query) => {
      if (query?.where?.symbol) {
        return {
          id: `unit-${query.where.symbol}`,
          name: 'Unit',
          symbol: query.where.symbol,
        };
      }
      if (Array.isArray(query?.where)) {
        return { id: 'user-1', username: 'existing' };
      }
      if (query?.where?.name) {
        return { id: 'entity-1', name: query.where.name };
      }
      if (query?.where?.product?.id && query?.where?.unit?.id) {
        return { id: 'pu-1' };
      }
      return { id: 'existing' };
    });
    const mockSave = jest.fn();
    const mockCreate = jest.fn();
    const mockInitialize = jest.fn().mockResolvedValue(undefined);
    const mockDestroy = jest.fn().mockResolvedValue(undefined);

    jest.isolateModules(() => {
      jest.doMock('bcryptjs', () => ({
        hash: jest.fn().mockResolvedValue('hashed_pw'),
      }));
      jest.doMock('src/config/ormconfig', () => ({
        AppDataSource: {
          initialize: mockInitialize,
          getRepository: jest.fn().mockReturnValue({
            findOne: mockFindOne,
            save: mockSave,
            create: mockCreate,
          }),
          destroy: mockDestroy,
        },
      }));
      require('./seed');
    });

    await new Promise((r) => setTimeout(r, 500));

    expect(mockInitialize).toHaveBeenCalledTimes(1);
    expect(mockSave).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('✔ 0 users seeded.');
    expect(console.log).toHaveBeenCalledWith('✔ 0 customers seeded.');
    expect(console.log).toHaveBeenCalledWith('✔ 0 suppliers seeded.');
    expect(console.log).toHaveBeenCalledWith('✔ 0 payment methods seeded.');
    expect(console.log).toHaveBeenCalledWith('✔ 0 product units seeded.');
  });

  it('should handle seed failure', async () => {
    const mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    const mockInitialize = jest
      .fn()
      .mockRejectedValue(new Error('DB connection failed'));

    jest.isolateModules(() => {
      jest.doMock('bcryptjs', () => ({
        hash: jest.fn(),
      }));
      jest.doMock('src/config/ormconfig', () => ({
        AppDataSource: {
          initialize: mockInitialize,
          getRepository: jest.fn(),
          destroy: jest.fn(),
        },
      }));
      require('./seed');
    });

    await new Promise((r) => setTimeout(r, 500));

    expect(console.error).toHaveBeenCalledWith(
      'Seed failed:',
      expect.any(Error),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
