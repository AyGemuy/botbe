export default {
    name: "tiktok",
    command: ["tt", "tiktok"],
    tags: "download",
    desc: "",
    customPrefix: "",
    example: "https://www.tiktok.com/@kittyandkakai/video/7283513155697904901",
    limit: false,
    isOwner: false,
    isPremium: false,
    isBotAdmin: false,
    isAdmin: false,
    isGroup: false,
    isPrivate: false,
    run: async(m, {
        prefix: usedPrefix,
        noPrefix,
        command,
        arg,
        args,
        text,
        sock,
        commands,
        cmd,
        name,
        user,
        settings,
        stats,
        isGroup,
        isAdmin,
        isBotAdmin,
        admin,
        metadata,
        participants,
        store,
        config,
        functions,
        axios,
        cheerio
    }) => {
        async function tiktok(query) {
            if (!functions.isUrl(query, "tiktok")) throw ("Enter the TikTok URL correctly!");
            let response = await axios("https://lovetik.com/api/ajax/search", {
              method: "POST",
              data: new URLSearchParams(Object.entries({ query })),
            });
            let result = {
              title: clean(response.data.desc),
              author: clean(response.data.author),
              nowm: (response.data.links[0].a || "").replace("https", "http"),
              wm: (response.data.links[1].a || "").replace("https", "http"),
              audio: (response.data.links[2].a || "").replace("https", "http"),
              thumbnail: response.data.cover,
            };
            return result;
          }
          function clean(data) {
            let regex = /(<([^>]+)>)/gi;
            data = data.replace(/(<br?\s?\/>)/gi, " \n");
            return data.replace(regex, "");
          }

          let data = await tiktok(args[0]);
          await sock.sendFile(m.from, data.nowm, "tiktok", `*⭓─❖『 TIKTOK 』❖─⭓*

Title: ¿${data.title}¿

Author: ¿${data.author}¿

WM: ¿${data.wm}¿`, m, {font: true});
          await sock.sendFile(m.from, data.audio, "tiktok", "", m);
    }
    }