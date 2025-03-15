import { ChangeDetectionStrategy, Component, DebugNode } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgxResponsiveIfDirective } from './ngx-responsive-if.directive';
import { BehaviorSubject } from 'rxjs';

class MatchMedia {
  private readonly matchMedia$ = new BehaviorSubject<MediaQueryListEvent>({ matches: false } as MediaQueryListEvent);

  get mediaQueryList(): MediaQueryList {
    return { matches: this.matchMedia$.value.matches } as MediaQueryList;
  }

  setMatches(matches: boolean) {
    this.matchMedia$.next({ matches } as MediaQueryListEvent);
    window.dispatchEvent(new Event('resize'));
  }
}

@Component({
  template: `
    <div *ngxResponsiveIf="mediaQuery; else elseTemplate">
      Visible on large screens
    </div>

    <ng-template #elseTemplate>
      <p>Visible on small screens</p>
    </ng-template>
  `,
  imports: [NgxResponsiveIfDirective],
  standalone: true,
})
class HostComponent {
  mediaQuery!: string;
}

describe(NgxResponsiveIfDirective.name, () => {
  let fixture: ComponentFixture<HostComponent>;
  let matchMedia: MatchMedia;
  
  function getPrimaryContent(): HTMLDivElement | null {
    return fixture.nativeElement.querySelector('div');
  }

  function getElseContent(): HTMLDivElement | null {
    return fixture.nativeElement.querySelector('p');
  }

  function getDirectiveInstance(): NgxResponsiveIfDirective | undefined {
    return fixture.debugElement.childNodes
      .find((node: DebugNode) => node.injector.get(NgxResponsiveIfDirective))
      ?.injector.get(NgxResponsiveIfDirective);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
    });
  });

  beforeEach(() => {
    matchMedia = new MatchMedia();

    spyOn(window, 'matchMedia').and.callFake(() => matchMedia.mediaQueryList);
  });

  [ChangeDetectionStrategy.Default, ChangeDetectionStrategy.OnPush].forEach((strategy: ChangeDetectionStrategy) => {
    describe(`with ChangeDetectionStrategy.${ strategy ? 'OnPush' : 'Default' }`, () => {
      beforeEach(() => {
        TestBed.overrideComponent(
          HostComponent,
          {
            set: {
              changeDetection: strategy,
            },
          },
        );

        fixture = TestBed.createComponent(HostComponent);
        fixture.componentInstance.mediaQuery = 'min-width: 768px';
      });

      it('should create an instance of the directive', fakeAsync(() => {
        // Arrange
        fixture.detectChanges();
        tick(300);

        matchMedia.setMatches(true);
        tick(300);

        // Act
        // Assert
        expect(getDirectiveInstance()).toBeInstanceOf(NgxResponsiveIfDirective);
      }));

      describe('inputs validation', () => {
        const invalidInputs = [
          {
            expectation: 'should throw an error for an invalid unit',
            mediaQuery: 'invalid-query: 500dp',
            isValid: false,
          },
          {
            expectation: 'should throw an error for an invalid aspect-ratio value',
            mediaQuery: 'aspect-ratio: 16:9',
            isValid: false,
          },
        ];

        const cssProperties = ['min-width', 'max-width', 'min-height', 'max-height'] as const;

        const cssUnits = ['px', 'rem', 'em', 'vw', 'dvw', 'vh', 'dvh'] as const;

        const propertiesMapping = cssProperties.reduce((result, property) => {
          const propertyMapping = cssUnits.map((unit) => [property, unit]) as [typeof cssProperties[number], typeof cssUnits[number]][];

          result.push(...propertyMapping);

          return result;
        }, [] as [typeof cssProperties[number], typeof cssUnits[number]][]);

        const validInputs = [
          ...propertiesMapping.map(([property, unit]) => {
            return {
              expectation: `should accept a valid media query with the ${ property } property and ${ unit } unit`,
              mediaQuery: `${ property }: 10${ unit }`,
              isValid: true,
            };
          }),
          {
            expectation: 'should handle aspect-ratio correctly',
            mediaQuery: 'aspect-ratio: 16/9',
            isValid: true,
          },
          {
            expectation: 'should handle orientation queries correctly',
            mediaQuery: 'orientation: portrait',
            isValid: true,
          },
        ];

        [...invalidInputs, ...validInputs].forEach(({ expectation, mediaQuery, isValid }) => {
          it(expectation, () => {
            // Arrange
            fixture.componentInstance.mediaQuery = mediaQuery as any;

            // Act
            // Assert
            if (isValid) {
              expect(() => fixture.detectChanges()).not.toThrow();
            } else {
              expect(() => fixture.detectChanges()).toThrowError(Error);
            }
          });
        });
      });

      describe('strict mode', () => {
        it('should throw an error when strict mode is enabled and media query is invalid', () => {
          // Arrange
          const mediaQuery = 'invalid-query';
          const directive = getDirectiveInstance();
          directive!.strictMode = true;
          fixture.componentInstance.mediaQuery = mediaQuery;

          // Act
          // Assert
          expect(() => fixture.detectChanges()).toThrowError(`[ngxResponsiveIf] Invalid media query: "${ mediaQuery }".`);
        });

        it('should not throw an error when strict mode is enabled and media query is valid', () => {
          // Arrange
          const directive = getDirectiveInstance();
          directive!.strictMode = true;
          fixture.componentInstance.mediaQuery = 'min-width: 768px';

          // Act
          // Assert
          expect(() => fixture.detectChanges()).not.toThrow();
        });

        it('should not throw an error when strict mode is disabled, even for invalid media queries', () => {
          // Arrange
          const directive = getDirectiveInstance();
          directive!.strictMode = false;
          fixture.componentInstance.mediaQuery = 'invalid-query';

          // Act
          // Assert
          expect(() => fixture.detectChanges()).not.toThrow();
        });
      });

      describe('template', () => {
        it('should display the primary template when the media query matches', fakeAsync(() => {
          // Arrange
          fixture.detectChanges();
          tick(300);

          // Act
          matchMedia.setMatches(true);
          tick(300);

          // Assert
          expect(getPrimaryContent()).toBeTruthy();
          expect(getElseContent()).toBeFalsy();
        }));

        it('should display the else template when the media query does not match', fakeAsync(() => {
          // Arrange
          fixture.detectChanges();
          tick(300);

          // Act
          matchMedia.setMatches(false);
          tick(300);

          // Assert
          expect(getPrimaryContent()).toBeFalsy();
          expect(getElseContent()).toBeTruthy();
        }));

        it('should update the view when window resizes', fakeAsync(() => {
          // Arrange
          fixture.detectChanges();
          tick(300);

          // Act
          matchMedia.setMatches(false);
          tick(300);

          // Assert
          expect(getElseContent()).toBeTruthy();
          expect(getPrimaryContent()).toBeFalsy();

          // Act
          matchMedia.setMatches(true);
          tick(300);

          // Assert
          expect(getPrimaryContent()).toBeTruthy();
          expect(getElseContent()).toBeFalsy();
        }));
      });
    });
  });
});
