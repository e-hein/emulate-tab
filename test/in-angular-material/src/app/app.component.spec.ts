import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { testApp } from 'src/testing/app.shared-specs';
import { AppComponent } from './app.component';

@Component({ template: '<app-root></app-root>'})
class StageComponent {}

describe('app component', () => {
  let fixture: ComponentFixture<StageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        BrowserAnimationsModule,
      ],
      declarations: [AppComponent, StageComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(StageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  testApp(() => TestbedHarnessEnvironment.loader(fixture));
});
