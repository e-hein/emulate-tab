const settings = {
  googleIcons: {
    title: 'google icons',
    types: ['IP-Adress'],
    effect: 'Request fonts from <a href="https://about.google/" target="_blank">google</a>, so it will transmit your IP-Adress, Browser and OS to google.',
    description: 'Required for the settings icon and the angular example.',
  },
  googleStyle: {
    title: 'material style',
    types: ['IP-Adress'],
    effect: 'Request stylesheets from <a href="https://about.google/" target="_blank">google</a>, so it will transmit your IP-Adress, Browser and OS to google.',
    description: 'Required for the angular example.'
  },
  shieldIoCookie: {
    title: 'shield.io',
    types: ['IP-Adress', 'Cookie'],
    effect: 'Request images from <a href="https://shields.io/" target="_blank">shield.io</a>, so it will transmit your IP-Adress, Browser and OS to shield.io and they will set a <b>cookie</b>.',
    description: 'Required dynamic images, which will show build status.'
  },
  ownSettings: {
    title: 'save this form',
    types: ['Local-Storage'],
    effect: 'Save this form into the local storage of your browser.',
    description: 'So you won\'t see it next time you visit this site.',
  },
};

function loadSettings() {
  const savedSettings = window.localStorage.getItem('privacy-settings');
  return savedSettings ? JSON.parse(savedSettings) : false;
}

function saveSettings(settings) {
  if (settings.ownSettings) {
    localStorage.setItem('privacy-settings', JSON.stringify(settings));
  } else {
    localStorage.removeItem('privacy-settings');
  }
}