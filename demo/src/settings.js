const settingsTemplate = document.getElementById('settings-template').innerHTML;
const settingsTable = document.getElementById('settings-table');
const variable = (name) => new RegExp('{{' + name + '}}', 'g');
const required = new URL(document.location.href).searchParams.get('required');
Object.entries(settings).forEach(([id, setting]) => {
  const lineClass = required && id.includes('google')
    ? 'required'
    : '';
  settingsTable.innerHTML += Object.entries({...setting, id, lineClass}).reduce(
    (tpl, [key, value]) => tpl.replace(variable(key), value),
    settingsTemplate,
  );
  setting.value = document.getElementById(id);
});

const loadedSettings = loadSettings();
if (loadedSettings) {
  Object.entries(loadedSettings).forEach(([key, value]) => document.getElementById(key).checked = value);
}

function useSelected(ev) {
  ev.preventDefault();
  console.log('use selected', ev);
  const value = Object.keys(settings).reduce((s, key) => {
    const input = document.getElementById(key);
    const value = input.checked;
    console.log(key, value, input);
    return { ...s, [key]: value };
  }, {});
  emitSelection(value);
}

function emitSelection(settings) {
  saveSettings(settings);
  window.parent.postMessage({
    type: 'privacy-settings',
    value: settings,
  });
}

function rejectAll(ev) {
  ev.preventDefault();
  emitSelection({})
}

function acceptAll(ev) {
  ev.preventDefault();
  emitSelection(Object.entries(settings).reduce((s, [key]) => ({ ...s, [key]: true }), {}));
}
