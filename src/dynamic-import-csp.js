import { nonce } from './options.js';
import { createBlob, baseUrl, noop } from './common.js';

let err;
window.addEventListener('error', _err => err = _err);
export function dynamicImport (url, { errUrl = url } = {}) {
  err = undefined;
  const src = createBlob(`import*as m from'${url}';self._esmsi=m`);
  const s = Object.assign(document.createElement('script'), { type: 'module', src });
  s.setAttribute('nonce', nonce);
  s.setAttribute('noshim', '');
  const p =  new Promise((resolve, reject) => {
    // Safari is unique in supporting module script error events
    s.addEventListener('error', cb);
    s.addEventListener('load', cb);

    function cb () {
      document.head.removeChild(s);
      if (self._esmsi) {
        resolve(self._esmsi, baseUrl);
        self._esmsi = undefined;
      }
      else {
        reject(err.error || new Error(`Error loading or executing the graph of ${errUrl} (check the console for ${src}).`));
        err = undefined;
      }
    }
  });
  document.head.appendChild(s);
  return p;
}

export const supportsDynamicImportCheck = dynamicImport(createBlob('0&&import("")')).catch(noop);
