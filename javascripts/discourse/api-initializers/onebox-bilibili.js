import { apiInitializer } from "discourse/lib/api";
import I18n from "I18n";

export default apiInitializer("0.11.1", api => {

    const getIframeUrl = (src) => {
        const url = new URL(src, document.baseURI);
        const iframeUrl = new URL('//player.bilibili.com/player.html', document.baseURI);
        if (url.hostname === 'player.bilibili.com') {
            url.searchParams.forEach((v, k) => iframeUrl.searchParams.set(k, v));
        } else {
            const BV_reg = /bv([a-zA-Z0-9]+)/i;
            const AV_reg = /av([a-zA-Z0-9]+)/i;
            if (BV_reg.test(url.pathname)) {
                iframeUrl.searchParams.set('bvid', 'BV' + url.pathname.match(BV_reg)[1]);
            }
            if (AV_reg.test(url.pathname)) {
                iframeUrl.searchParams.set('avid', url.pathname.match(AV_reg)[1]);
            }
        }
        iframeUrl.searchParams.set('autoplay', 0);
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
        const biliframe = createOrResetIframe(original_iframe)
        biliframe.classList.add('onebox-bilibili-iframe')
        biliframe.setAttribute('src',iframe_src);
        biliframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        biliframe.setAttribute('referrerpolicy', 'no-referrer');
        biliframe.setAttribute('loading', 'lazy');
        biliframe.setAttribute('importance', 'low');
        return biliframe;
    };

    const createOneboxDiv = (src) => {
        const onebox_div = document.createElement('div');
        onebox_div.classList.add('onebox', 'onebox-bilibili');
        onebox_div.setAttribute('data-onebox-src', src);
        const biliframe = decorateIframe(getIframeUrl(src));
        onebox_div.replaceChildren(biliframe);
        return onebox_div;
    };

    const createOneboxIframe = (src, original_iframe) => { 
        decorateIframe(getIframeUrl(src), original_iframe);
        original_iframe.setAttribute('data-onebox-src', src);
        original_iframe.classList.add('onebox', 'onebox-bilibili');
        return original_iframe;
    }


    api.decorateCookedElement(elem => {
        const regex = /^https?:\/\/(?:www\.)?bilibili\.com\/video\/([a-zA-Z0-9]+)(?:\/.*|\?.*)?$/;
        let oneboxes = elem.querySelectorAll(".onebox");
        let iframes = elem.querySelectorAll("iframe");
        const rendered_oneboxes = [];
        oneboxes.forEach((onebox_elem) => {
            const src = onebox_elem.getAttribute("data-onebox-src") ?? onebox_elem.getAttribute("href");
            if(regex.test(src)){
                const onebox_div = createOneboxDiv(src);
                onebox_elem.replaceWith(onebox_div);
                rendered_oneboxes.push(onebox_div);
            }
        });
        iframes.forEach((iframe_elem) => {
            const src = iframe_elem.getAttribute("src");
            if((new URL(src,document.baseURI)).hostname === 'player.bilibili.com'){
                createOneboxIframe(src, iframe_elem);
                rendered_oneboxes.push(iframe_elem);
            }
        });
    },
    { id: 'bilibili-onebox-decorator', onlyStream: false }
  );
});
