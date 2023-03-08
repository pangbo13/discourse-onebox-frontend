import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.11.1", api => {
  api.decorateCookedElement(
    elem => {
        const regex = /^https?:\/\/(?:www\.)?bilibili\.com\/video\/([a-zA-Z0-9]+)(?:\/.*|\?.*)?$/;
        let oneboxes = elem.querySelectorAll(".onebox");
        oneboxes.forEach((onebox_elem) => {
            let src = onebox_elem.getAttribute("data-onebox-src") ?? onebox_elem.getAttribute("href");
            if(regex.test(src)){
                const bili_id = src.match(regex)[1];
                let iframe_src;
                if (bili_id.toLowerCase().startsWith('bv')) {
                    iframe_src = `//player.bilibili.com/player.html?bvid=${bili_id}&high_quality=1`;
                } else {
                    iframe_src = `//player.bilibili.com/player.html?aid=${bili_id.slice(2)}&high_quality=1`;
                }
                const onebox_div = document.createElement('div');
                const biliframe = document.createElement('iframe');
                onebox_div.classList.add('onebox', 'onebox-bilibili');
                onebox_div.setAttribute('data-onebox-src', src);
                biliframe.setAttribute('src',iframe_src);
                biliframe.setAttribute('sandbox', '');
                biliframe.setAttribute('referrerpolicy', 'no-referrer');
                biliframe.setAttribute('loading', 'lazy');
                biliframe.setAttribute('importance', 'low');
                onebox_div.replaceChildren(biliframe);
                onebox_elem.replaceWith(onebox_div);
            }
        });
    },
    { id: 'bilibili-onebox-decorator', onlyStream: true }
  );
});
