import { TestBed } from '@angular/core/testing';

import { DataProviderBoschService } from './data-provider-bosch.service';

describe('DataProviderBoschService', () => {
  let service: DataProviderBoschService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataProviderBoschService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
