import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.11.1", api => {
  api.decorateCookedElement(
    elem => { 
        const regex = /^https?:\/\/(?:www\.)?bilibili\.com\/video\/([a-zA-Z0-9]+)(?:\/.*|\?.*)?$/;
        let oneboxes = elem.querySelectorAll(".onebox");
        oneboxes.forEach((onebox_elem) => {
            let src = onebox_elem.getAttribute("data-onebox-src") ?? onebox_elem.getAttribute("href");
            if(regex.test(src)){
                let bili_id = src.match(regex)[1];
                let iframe_src;
                if (bili_id.toLowerCase().startsWith('bv')) { 
                    iframe_src = `//player.bilibili.com/player.html?bvid=${bili_id}&high_quality=1`;
                } else {
                    iframe_src = `//player.bilibili.com/player.html?aid=${bili_id.slice(2)}&high_quality=1`;
                }
                const oneboxdiv = document.createElement('div');
                const biliframe = document.createElement('iframe');
                oneboxdiv.classList.add('onebox');
                biliframe.setAttribute('src',iframe_src);
                oneboxdiv.replaceChildren(biliframe);
                onebox_elem.replaceWith(oneboxdiv);
            }

        })
    },
    { id: 'bilibili-onebox-decorator' }
  );
});
