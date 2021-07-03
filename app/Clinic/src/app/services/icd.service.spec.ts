import { TestBed } from '@angular/core/testing';

import { IcdService } from './icd.service';

describe('IcdService', () => {
  let service: IcdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IcdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
