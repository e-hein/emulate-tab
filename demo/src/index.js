const contentFrame = document.getElementById('content');
let nextPage;
window.addEventListener('message', (message) => {
  console.log('got message', message);
  if (message.data.type === 'privacy-settings') {
    const settings = message.data.value;
    updatePrivacySettings(settings);
    if (nextPage === 'angular' && isAngularOk(settings)) {
      contentFrame.src = 'examples/angular/index.html';
    } else {
      contentFrame.src = getHomeLink(settings);
    }
  }
});

function getHomeLink(settings) {
  return 'home.html?shieldsOk=' + settings.shieldIoCookie;
}

function isAngularOk(settings) {
  return settings.googleIcons && settings.googleStyle;
}

function updateAngularLink(settings) {
  const link = document.getElementById('angularLink');
  const angularOk = isAngularOk(settings);
  if (angularOk) {
    link.onclick = () => {}
    link.href = 'examples/angular/index.html';
  } else {
    link.onclick = angularPrivacyRejected;
    link.href = 'javascript:void(0)';
  }
  return angularOk ? link.href : 'settings.html?require=google*';
}

function angularPrivacyRejected() {
  alert('can\'t open angular sample because of your privacy settings');
  nextPage = 'angular';
  contentFrame.src = 'settings.html?required=google*';
}

function updatePrivacySettings(settings) {
  console.log('settings2: ', settings, settings.shieldIoCookie);
  document.getElementById('homeLink').href = getHomeLink(settings);
  updateAngularLink(settings);
  const googleIconLinkExists = Array.from(document.head.children).find((link) => link.href && link.href.includes('google'))
  if (settings.googleIcons && !googleIconLinkExists) {
    const googleIconLink = document.createElement('link');
    googleIconLink.href="https://fonts.googleapis.com/icon?family=Material+Icons";
    googleIconLink.rel="stylesheet";
    document.head.appendChild(googleIconLink);
  } else if (!settings.googleIcons && googleIconLinkExists) {
    googleIconLinkExists.parentNode.removeChild(googleIconLinkExists);
  }
}

const initialPrivacySettings = loadSettings();
if (initialPrivacySettings) {
  console.log('initial privacy settings', initialPrivacySettings);
  this.updatePrivacySettings(initialPrivacySettings);
  contentFrame.src = getHomeLink(initialPrivacySettings);
} else {
  contentFrame.src = 'settings.html';
}
