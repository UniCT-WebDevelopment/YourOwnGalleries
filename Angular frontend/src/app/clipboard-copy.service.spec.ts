import { TestBed } from '@angular/core/testing';

import { ClipboardCopyService } from './clipboard-copy.service';

describe('ClipboardCopyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ClipboardCopyService = TestBed.get(ClipboardCopyService);
    expect(service).toBeTruthy();
  });
});
