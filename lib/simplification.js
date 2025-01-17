/*<============== CREDITS ==============>
	Author: @berkahesport.id
	Contact me: 62895375950107
	
	Do not delete the source code.
	It is prohibited to sell and buy
	WhatsApp BOT scripts
	without the knowledge
	of the script owner.
	
	Selling = Sin 
	
	Thank you to Allah S.W.T
<============== CREDITS ==============>*/
import baileys from "@whiskeysockets/baileys"
const {proto, prepareWAMessageMedia, jidNormalizedUser, generateWAMessageFromContent, toBuffer, jidDecode, downloadContentFromMessage} = baileys;
import { parsePhoneNumber } from 'libphonenumber-js';
import axios from "axios";
import fs from "fs";
import { writeExif } from "./js/sticker.js";
export default async function whatsapp(sock, store, config, functions) {
	sock.getContentType = (object) => {
		if (object) {
			const keys = Object.keys(object);
			const key = keys.find(x => (x === 'conversation' || x.endsWith('Message') || x.includes('V2') || x.includes('V3')) && x !== 'senderKeyDistributionMessage');
			return key ? key : keys[0];
		}
	}

	sock.getName = (jid) => {
		const id = jidNormalizedUser(jid);
		if (id.endsWith('g.us')) {
			const metadata = store.groupMetadata?.[id];
			return metadata.subject;
		} else {
			const metadata = store.contacts[id];
			return metadata?.name || metadata?.verifiedName || metadata?.notify || parsePhoneNumber('+' + id.split('@')[0]).format('INTERNATIONAL');
		}
	}

	sock.parseMentions = (text) => {
		if (typeof text === "string") {
			const matches = text.match(/@([0-9]{5,16}|0)/g) || [];
			return matches.map((match) => match.replace("@", "") + "@s.whatsapp.net");
		}
	}

	sock.decodeJid = (jid) => {
		if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return decode.user && decode.server && `${decode.user}@${decode.server}` || jid;
        } else return jid;
	}

	sock.downloadMediaMessage = async(m) => {
		let quoted = m.msg ? m.msg : m;
		let stream = await downloadContentFromMessage(quoted, m.type.replace(/Message/, ""));
		let buffer = await toBuffer(stream) || Buffer.alloc(0);
		if (buffer) {
			return buffer;
		}
	}
	
	sock.reply = async (jid, text = "", quoted = "", options = {}) => {
		if (typeof text == "object") {
			return sock.sendMessage(jid, {
				text: options.font ? functions.transformText(functions.format(text)) : text,
				mentions: [jid, ...sock.parseMentions(functions.format(text))], ...options,
				}, { ephemeralExpiration: quoted ? quoted.expiration : undefined, quoted, ...options });
		} else return sock.sendMessage(jid, {
			text:  options.font ? functions.transformText(functions.format(text)) : text,
			mentions: !!options.mentions ? options.mentions : sock.parseMentions(text), 
			contextInfo: {
				forwardingScore: !!options.isForwarded ? functions.randomInt(10, 256) : 0,
				isForwarded: !!options.isForwarded ? true : false,
				mentionedJid: !!options.mentions ? options.mentions : [jid, ...sock.parseMentions(text)],
				externalAdReply: {
					title: config.name.bot || sock.user.name,
					body: !!options.body ? options.body : "",
					mediaType: 1,
					previewType: 5,
					renderLargerThumbnail: !!options.thumbnail ? true : false,
					thumbnail: !!options.thumbnail ? await (await functions.getFile(options.thumbnail)).data : fs.readFileSync("./src/thumbnail.jpg"),
					sourceUrl: !!options.body ? "https://tinyurl.com/berkahesport" : config.group.ofc,
					showAdAttribution: !!options.isForwarded ? false : true
				}, ...options
			}
		}, { ephemeralExpiration: quoted ? quoted.expiration : undefined, quoted, ...options});
	}

	sock.sendFile = async (jid, url, fileName = "", caption = "", quoted = "", options = {}) => {
		let { mime, data: buffer, ext, size } = await functions.getFile(url, fileName);
		let data = { text: "" };
		if (options.asDocument) {
			data = { 
					document: buffer, 
					mimetype: mime, 
					caption: typeof caption == "object" ? functions.format(caption) :  options.font ? functions.transformText(caption) : caption, 
					fileName: fileName ? `${fileName}.${ext}` : `${sock.user?.name} (${new Date()}).${ext}`, 
					contextInfo: {
						forwardingScore: 1,
						isForwarded: true,
						mentionedJid: !!options.mentions ? options.mentions : [jid, ...sock.parseMentions(caption)],
						forwardedNewsletterMessageInfo: {
							newsletterJid: config.group.chid,
							serverMessageId: 100,
							newsletterName: `Bot Whatsapp ${config.name.bot}`
						}, ...options
					}
			}
		} else if (options.asSticker || /webp/.test(mime)) {
			const pathFile = await writeExif({ mimetype: mime, data: buffer }, { ...options }, fileName);
			data = { sticker: fs.readFileSync(pathFile), mimetype: "image/webp", ...options }
		} else if (/image/.test(mime)) {
			data = {
				image: buffer, 
				fileName: fileName ? `${fileName}.${ext}` : `${sock.user?.name} (${new Date()}).${ext}`, 
				caption : typeof caption == "object" ? functions.format(caption) :  options.font ? functions.transformText(caption) : caption, 
				mimetype: options?.mimetype ? options.mimetype : "image/png",
				contextInfo: {
					forwardingScore: 1,
					isForwarded: true,
					mentionedJid: !!options.mentions ? options.mentions : [jid, ...sock.parseMentions(caption)],
					forwardedNewsletterMessageInfo: {
						newsletterJid: config.group.chid,
						serverMessageId: 100,
						newsletterName: `Bot Whatsapp ${config.name.bot}`
					}, ...options
				}
			} 
		} else if (/video/.test(mime)) {
			data = {
				video: buffer, 
				fileName: fileName ? `${fileName}.${ext}` : `${sock.user?.name} (${new Date()}).${ext}`, 
				caption : typeof caption == "object" ? functions.format(caption) :  options.font ? functions.transformText(caption) : caption, 
				mimetype: options?.mimetype ? options.mimetype : "video/mp4",
				contextInfo: {
					forwardingScore: 1,
					isForwarded: true,
					mentionedJid: !!options.mentions ? options.mentions : [jid, ...sock.parseMentions(caption)],
					forwardedNewsletterMessageInfo: {
						newsletterJid: config.group.chid,
						serverMessageId: 100,
						newsletterName: `Bot Whatsapp ${config.name.bot}`
					}, ...options
				}
			} 
		} else if (/audio/.test(mime)) {
			data = {
				audio: buffer,
				fileName: fileName ? `${fileName}.${ext}` : `${sock.user?.name} (${new Date()}).${ext}`, 
				caption : typeof caption == "object" ? functions.format(caption) :  options.font ? functions.transformText(caption) : caption, 
				mimetype: options?.mimetype ? options.mimetype : "audio/mpeg",
				contextInfo: {
					forwardingScore: 1,
					isForwarded: true,
					mentionedJid: !!options.mentions ? options.mentions : [jid, ...sock.parseMentions(caption)],
					forwardedNewsletterMessageInfo: {
						newsletterJid: config.group.chid,
						serverMessageId: 100,
						newsletterName: `Bot Whatsapp ${config.name.bot}`
					}, ...options
				}
			}
		}
		const msg = await sock.sendMessage(jid, data, { ephemeralExpiration: quoted ? quoted.expiration : undefined, quoted, ...options });
		data = null;
		return msg;
	}

	// Button [contact me: wa.me/62895375950107] to unlock
	function _0x7ec4(){const _0x40b4dc=['27oxCGJU','user','8201080ApWvhF','quick_reply','string','110173BzSKbm','cta_url','sendButton','readFileSync','content-type','key','imageMessage','assign','376328APFhiZ','name','arraybuffer','Incompatible\x20MIME\x20type:','forEach','push','waUploadToServer','394728hiRPaD','760953MZtwhb','temareply','mime','fromObject','map','jid','message','bot','relayMessage','get','1041201VBnqit','test','externalAdReply','filter','stringify','Failed\x20to\x20get\x20MIME\x20type:','566960jFvrdd','2CEICHh','owner','videoMessage','18JCetQC','error','contextInfo','parseMentions'];_0x7ec4=function(){return _0x40b4dc;};return _0x7ec4();}const _0x19e4e1=_0x1612;function _0x1612(_0x26368e,_0x4da2e2){const _0x7ec4f5=_0x7ec4();return _0x1612=function(_0x16120e,_0x5a5183){_0x16120e=_0x16120e-0x14d;let _0x1f8dae=_0x7ec4f5[_0x16120e];return _0x1f8dae;},_0x1612(_0x26368e,_0x4da2e2);}(function(_0x6c3a12,_0x5bfdb8){const _0x4674a2=_0x1612,_0x587fb8=_0x6c3a12();while(!![]){try{const _0xe06c23=parseInt(_0x4674a2(0x172))/0x1*(-parseInt(_0x4674a2(0x166))/0x2)+-parseInt(_0x4674a2(0x155))/0x3+parseInt(_0x4674a2(0x14d))/0x4+parseInt(_0x4674a2(0x165))/0x5*(-parseInt(_0x4674a2(0x169))/0x6)+-parseInt(_0x4674a2(0x15f))/0x7+parseInt(_0x4674a2(0x154))/0x8*(parseInt(_0x4674a2(0x16d))/0x9)+parseInt(_0x4674a2(0x16f))/0xa;if(_0xe06c23===_0x5bfdb8)break;else _0x587fb8['push'](_0x587fb8['shift']());}catch(_0x4fe507){_0x587fb8['push'](_0x587fb8['shift']());}}}(_0x7ec4,0x3323e),sock[_0x19e4e1(0x174)]=async(_0x128ec5,_0x5298fa='',_0x2580b8='',_0x4420da,_0x312c85,_0xcbec80,_0x2d2e22,_0x52b74a,_0x2641d9)=>{const _0x1cafea=_0x19e4e1;let _0x201c47,_0x194b86;if(/^https?:\/\//i[_0x1cafea(0x160)](_0x4420da))try{const _0x316435=await axios[_0x1cafea(0x15e)](_0x4420da,{'responseType':_0x1cafea(0x14f)}),_0x488aa8=_0x316435['headers'][_0x1cafea(0x176)];if(/^image\//i[_0x1cafea(0x160)](_0x488aa8))_0x201c47=await prepareWAMessageMedia({'image':{'url':_0x4420da}},{'upload':sock[_0x1cafea(0x153)],..._0x2641d9});else/^video\//i[_0x1cafea(0x160)](_0x488aa8)?_0x194b86=await prepareWAMessageMedia({'video':{'url':_0x4420da}},{'upload':sock[_0x1cafea(0x153)],..._0x2641d9}):console[_0x1cafea(0x16a)](_0x1cafea(0x150),_0x488aa8);}catch(_0x4b60e1){_0x201c47=await prepareWAMessageMedia({'image':{'url':fs[_0x1cafea(0x175)]('./src/thumbnail.jpg')}},{'upload':sock['waUploadToServer'],..._0x2641d9}),console['error'](_0x1cafea(0x164),_0x4b60e1);}else try{const _0x4bc38e=await functions['getFile'](_0x4420da);if(/^image\//i[_0x1cafea(0x160)](_0x4bc38e[_0x1cafea(0x157)]))_0x201c47=await prepareWAMessageMedia({'image':{'url':_0x4420da}},{'upload':sock[_0x1cafea(0x153)],..._0x2641d9});else/^video\//i[_0x1cafea(0x160)](_0x4bc38e[_0x1cafea(0x157)])&&(_0x194b86=await prepareWAMessageMedia({'video':{'url':_0x4420da}},{'upload':sock['waUploadToServer'],..._0x2641d9}));}catch(_0x28f54c){console['error'](_0x1cafea(0x164),_0x28f54c);}const _0x2b1174=_0x312c85[_0x1cafea(0x159)](_0xefa603=>({'name':_0x1cafea(0x170),'buttonParamsJson':JSON[_0x1cafea(0x163)]({'display_text':_0xefa603[0x0],'id':_0xefa603[0x1]})}));_0xcbec80?.[_0x1cafea(0x151)](_0x2cbb90=>{const _0x9aa29b=_0x1cafea;_0x2b1174['push']({'name':_0x9aa29b(0x173),'buttonParamsJson':JSON[_0x9aa29b(0x163)]({'display_text':_0x2cbb90[0x0],'url':_0x2cbb90[0x1],'merchant_url':_0x2cbb90[0x1]})});}),_0x2d2e22?.[_0x1cafea(0x151)](_0x2cf9fd=>{const _0x1d6b94=_0x1cafea;_0x2b1174[_0x1d6b94(0x152)]({'name':'single_select','buttonParamsJson':JSON[_0x1d6b94(0x163)]({'title':_0x2cf9fd[0x0],'sections':_0x2cf9fd[0x1]})});});const _0x9b5fc4=_0x201c47||_0x194b86,_0xccd6e7={'body':{'text':_0x5298fa||config[_0x1cafea(0x14e)][_0x1cafea(0x167)]},'footer':{'text':_0x2580b8||config[_0x1cafea(0x14e)][_0x1cafea(0x15c)]},'header':{'hasMediaAttachment':_0x9b5fc4,'imageMessage':_0x201c47?_0x201c47[_0x1cafea(0x178)]:null,'videoMessage':_0x194b86?_0x194b86[_0x1cafea(0x168)]:null},'nativeFlowMessage':{'buttons':_0x2b1174[_0x1cafea(0x162)](Boolean),'messageParamsJson':''}},_0x48af8c=proto['Message'][_0x1cafea(0x158)]({'viewOnceMessage':{'message':{'interactiveMessage':_0xccd6e7,...Object[_0x1cafea(0x179)]({'mentions':typeof _0x5298fa===_0x1cafea(0x171)?await sock[_0x1cafea(0x16c)](_0x5298fa||'@0'):[],'contextInfo':{'mentionedJid':typeof _0x5298fa===_0x1cafea(0x171)?await sock[_0x1cafea(0x16c)](_0x5298fa||'@0'):[]}},{..._0x2641d9||{},...sock[_0x1cafea(0x156)]?.[_0x1cafea(0x16b)]&&{'contextInfo':{..._0x2641d9?.['contextInfo']||{},...sock[_0x1cafea(0x156)][_0x1cafea(0x16b)],'externalAdReply':{..._0x2641d9?.['contextInfo']?.[_0x1cafea(0x161)]||{},...sock['temareply'][_0x1cafea(0x16b)]['externalAdReply']}}}})}}}),_0x54f74d=generateWAMessageFromContent(_0x128ec5,_0x48af8c,{'userJid':sock[_0x1cafea(0x16e)][_0x1cafea(0x15a)],'quoted':_0x52b74a,'ephemeralExpiration':0x15180,...Object[_0x1cafea(0x179)]({'mentions':typeof _0x5298fa===_0x1cafea(0x171)?await sock[_0x1cafea(0x16c)](_0x5298fa||'@0'):[],'contextInfo':{'mentionedJid':typeof _0x5298fa===_0x1cafea(0x171)?await sock[_0x1cafea(0x16c)](_0x5298fa||'@0'):[]}},{..._0x2641d9||{},...sock[_0x1cafea(0x156)]?.[_0x1cafea(0x16b)]&&{'contextInfo':{..._0x2641d9?.[_0x1cafea(0x16b)]||{},...sock[_0x1cafea(0x156)][_0x1cafea(0x16b)],'externalAdReply':{..._0x2641d9?.[_0x1cafea(0x16b)]?.[_0x1cafea(0x161)]||{},...sock[_0x1cafea(0x156)][_0x1cafea(0x16b)]['externalAdReply']}}}})});return await sock[_0x1cafea(0x15d)](_0x128ec5,_0x54f74d[_0x1cafea(0x15b)],{'messageId':_0x54f74d[_0x1cafea(0x177)]['id']});});
	
	if (sock.user?.id) sock.user.jid = sock.decodeJid(sock.user.id);
	return sock;
}