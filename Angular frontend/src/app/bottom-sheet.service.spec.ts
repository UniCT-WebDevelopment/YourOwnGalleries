import { TestBed } from '@angular/core/testing';

import { BottomSheetService } from './bottom-sheet.service';

describe('BottomSheetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BottomSheetService = TestBed.get(BottomSheetService);
    expect(service).toBeTruthy();
  });
});
