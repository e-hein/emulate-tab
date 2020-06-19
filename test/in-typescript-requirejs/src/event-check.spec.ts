describe('event check', () => {
  beforeAll(() => {
    fixture.setBase('src');
    document.body.appendChild(fixture.el);
  });

  beforeEach(() => {
    fixture.cleanup();
    fixture.load('event-check.html');
  });

  it('should start', () => expect().nothing());
});