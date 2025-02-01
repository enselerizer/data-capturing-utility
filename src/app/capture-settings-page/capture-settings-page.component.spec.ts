import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureSettingsPageComponent } from './capture-settings-page.component';

describe('CaptureSettingsPageComponent', () => {
  let component: CaptureSettingsPageComponent;
  let fixture: ComponentFixture<CaptureSettingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptureSettingsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaptureSettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
