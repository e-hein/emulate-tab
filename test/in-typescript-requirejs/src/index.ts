import * as http from 'http';

export class Index {
  public view: {
    content: HTMLDivElement,
  };

  constructor(
    private parent = document,
  ) {
    this.view = {
      content: this.getElementById('main-content'),
    };
  }

  public init() {
    // mainContent.innerHTML = result.html;
    // const scripts = new Array() = Array.form(mainContent.querySelectorAll('script[src]'))
    //   .map((script) => script.src);
    // console.log('scripts');
    this.navigateTo('event-check');
  }

  private navigateTo(target: string) {
    this.getFile(target).then((contents) => {
      this.view.content.innerHTML = contents;
      const scripts = Array.from(this.view.content.querySelectorAll('script[src]'))
        .map((script: HTMLScriptElement) => script.src)
        .map((src) => src.replace(/^.*\/scripts\/(.*?)(.js)?$/, (_, file) => `scripts/${file}.js`))
      ;
      const scriptSrc = JSON.stringify(scripts);
      eval.call(window, `require(${scriptSrc}, () => { console.log('required', '${scripts}'); });`);
//       const scripts = Array.from(this.view.content.querySelectorAll('script[src]'))
//         .map((script: HTMLScriptElement) => script.src
//           ? this.getFile(script.src)
// //          ? eval.call(window, `require(['${script.src}'], () => { console.log('required', ${script.src}); });`)
//           : Promise.resolve(script.innerHTML)
//         )
//         .reduce((last, next) => last.then(() => next.then((scriptContent) => eval.bind(window)(scriptContent))), Promise.resolve(''))
//       ;
      
//      console.log('scripts', scripts);
    });
  }

  private getFile(href: string): Promise<string> {
    return new Promise<string>(resolve => {
      const request = new XMLHttpRequest();
      request.addEventListener('load', (ev) => {
        const response = (ev.target as any).response as string;
        resolve(response);
      })
      request.open('GET', href);
      request.send();
    });
  }

  private getElementById(id: string): any {
    const element = this.parent.getElementById(id);
    if (!element) {
      throw new Error(`element with id '${id}' not found`);
    }
    return element;
  }
}
