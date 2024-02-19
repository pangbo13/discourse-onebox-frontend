import { apiInitializer } from "discourse/lib/api";
import I18n from "I18n";

export default apiInitializer("0.11.1", api => {

    const getIframeUrl = (src) => {
        const url = new URL(src, document.baseURI);
        const iframeUrl = new URL('//music.163.com/outchain/player', document.baseURI);
        
        url.searchParams.forEach((v, k) => {
            if(['id', 'type', 'height'].includes(k)){
                iframeUrl.searchParams.set(k, v);
            }
        });
        iframeUrl.searchParams.set('auto', '0');
        
        return iframeUrl.toString();
    };

    const createOrResetIframe = (iframe) => { 
        if (iframe === undefined) { 
            return document.createElement('iframe');
        } else {
            // remove all attributes
            while (iframe.attributes.length > 0) {
                iframe.removeAttribute(iframe.attributes[0].name);
            }
            return iframe;
        }
    }

    const decorateIframe = (iframe_src, original_iframe) => {
        const iframe = createOrResetIframe(original_iframe);
        iframe.classList.add('onebox-163music-iframe');
        iframe.setAttribute('src',iframe_src);
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        iframe.setAttribute('referrerpolicy', 'no-referrer');
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('importance', 'low');
        return iframe;
    };

    const createOneboxIframe = (src, original_iframe, type, height) => {
        decorateIframe(getIframeUrl(src), original_iframe);
        original_iframe.classList.add('onebox', 'onebox-163music');
        switch (parseInt(type)) {
            case 0:
                original_iframe.classList.add('onebox-163music-playlist');
                break;
            case 1:
                original_iframe.classList.add('onebox-163music-song');
                break;
            case 2:
                original_iframe.classList.add('onebox-163music-album');
                break;
            case 3:
                original_iframe.classList.add('onebox-163music-artist');
                break;
            default:
                original_iframe.classList.add('onebox-163music-unknown');
                break;
        }
        original_iframe.setAttribute('height', height);
        original_iframe.setAttribute('data-onebox-src', src);
        return original_iframe;
    };

    api.decorateCookedElement(elem => {
        elem.querySelectorAll("iframe").forEach((iframe_elem) => {
            const src = iframe_elem.getAttribute("src");
            const url = new URL(src, document.baseURI);
            const rendered_oneboxes = [];
            if(url.hostname === 'music.163.com' && url.pathname === '/outchain/player'){
                createOneboxIframe(src, iframe_elem, url.searchParams.get('type'), iframe_elem.getAttribute("height"));
                rendered_oneboxes.push(iframe_elem);
            }
        });
    },
    { id: '163music-onebox-decorator', onlyStream: true }
  );
});
