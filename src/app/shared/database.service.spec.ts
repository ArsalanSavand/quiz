import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Theme } from '@app/shared/theme';
import { Database } from './database';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let databaseService: DatabaseService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(async () => {
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);

    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true,
    });

    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should load default value when localStorage is empty', () => {
    localStorageSpy.getItem.and.returnValue(null);
    databaseService = TestBed.inject(DatabaseService);

    expect(databaseService.data()).toEqual(databaseService.defaultValue);
  });

  it('should load existing data from localStorage', () => {
    databaseService = TestBed.inject(DatabaseService);
    const mockData: Database = databaseService.defaultValue;
    localStorageSpy.getItem.and.returnValue(JSON.stringify(mockData));
    databaseService = TestBed.inject(DatabaseService);

    expect(databaseService.data()).toEqual(mockData);
  });

  it('should handle corrupted data and use default value', () => {
    localStorageSpy.getItem.and.returnValue('invalid json');
    databaseService = TestBed.inject(DatabaseService);

    expect(localStorageSpy.removeItem).toHaveBeenCalledWith('database');
    expect(databaseService.data()).toEqual(databaseService.defaultValue);
  });

  it('should save data when signal is updated', () => {
    localStorageSpy.getItem.and.returnValue(null);
    databaseService = TestBed.inject(DatabaseService);
    TestBed.tick();
    localStorageSpy.setItem.calls.reset();

    databaseService.data.set({ ...databaseService.defaultValue, theme: Theme.Light });
    TestBed.tick();

    expect(localStorageSpy.setItem).toHaveBeenCalled();
  });
});
