import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoschDebugConsolePageComponent } from './bosch-debug-console-page.component';

describe('BoschDebugConsolePageComponent', () => {
  let component: BoschDebugConsolePageComponent;
  let fixture: ComponentFixture<BoschDebugConsolePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoschDebugConsolePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoschDebugConsolePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
