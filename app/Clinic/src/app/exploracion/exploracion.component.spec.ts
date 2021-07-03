import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploracionComponent } from './exploracion.component';

describe('ExploracionComponent', () => {
  let component: ExploracionComponent;
  let fixture: ComponentFixture<ExploracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploracionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
