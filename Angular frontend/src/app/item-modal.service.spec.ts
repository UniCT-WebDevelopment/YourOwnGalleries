import { TestBed } from '@angular/core/testing';

import { ItemModalService } from './item-modal.service';

describe('ItemModalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ItemModalService = TestBed.get(ItemModalService);
    expect(service).toBeTruthy();
  });
});
