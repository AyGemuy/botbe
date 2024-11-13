import path from "path";
import util from "util";
import moment from "moment-timezone";
import { toBuffer } from "@whiskeysockets/baileys";
import { platform, arch } from "process";
import { fileURLToPath, pathToFileURL } from "url";
import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import axios from "axios";
import config from "../config.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default {
_filename(pathURL = import.meta.url, rmPrefix = platform !== "win32") { 
  const isFileURL = pathURL.startsWith('file:///');
  return rmPrefix ? (isFileURL ? fileURLToPath(pathURL) : pathURL.replace(/^file:(\/+)/, '')) : (isFileURL ? pathURL : pathToFileURL(pathURL).toString());
},
_dirname(pathURL, rmPrefix = platform !== "win32") { 
  return path.dirname(this._filename(pathURL, rmPrefix));
},
chalkLog(text, color) {
  let formattedText = typeof text === "object" ? JSON.stringify(text) : text;
  let coloredText = !color ? chalk.yellowBright(formattedText) :
                    isNaN(color) ? chalk.ansi256(parseInt(color) > 255 ? 255 : color)(formattedText) :
                    chalk.red(formattedText);
  console.log(chalk.bgCyan("Console Output:\n") + coloredText);
},
splitString(input, barrier = "/") {
  const parts = input.split(barrier);
  const lastPart = parts.pop();
  const firstPart = parts.join(barrier);
  return [firstPart, lastPart];
},
toUpper(query) {
  const arr = query.split(" ")
  for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1)
  }
  return arr.join(" ")
},
list(data, top) {
  const symbol = this.random(["⟰", "♕", "♔", "✪", "✽", "✦", "★", "⁂", "✇", "✡", "≛", "☀"]);
  const header = `*<===[ ${top ? `${symbol} ${top} ${symbol}` : `${symbol} SEARCH RESULT ${symbol}`} ]===>*`;
  const generateField = (obj) => {
    return Object.entries(obj).map(([key, value]) => `*${key.toUpperCase()}:* _${value}_`).join('\n');
  };
  const body = generateField(data);
  return `${header}\n\n${body}`;
},
listObj(data, top) {
  const symbol = this.random(["⟰", "♕", "♔", "✪", "✽", "✦", "★", "⁂", "✇", "✡", "≛", "☀"]);
  const header = `*<===[ ${top ? `${symbol} ${top} ${symbol}` : `${symbol} SEARCH RESULT ${symbol}`} ]===>*`;
  const generateField = (obj, prefix = '') => {
    return Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'object') {
        return generateField(value, `${(prefix+key).toUpperCase()}.`);
      } else {
        return `*${(prefix+key).toUpperCase()}:* _${value}_`;
      }
    }).join('\n');
  };
  const body = generateField(data);
  return `${header}\n\n${body}`;
},
mapList(data, top) {
  const symbol = this.random(["⟰", "♕", "♔", "✪", "✽", "✦", "★", "⁂", "✇", "✡", "≛", "☀"]);
  const header = `*<===[ ${top ? `${symbol} ${top} ${symbol}` : `${symbol} SEARCH RESULT ${symbol}`} ]===>*`;
  const stringifyValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([key, val]) => `*${key.toUpperCase()}:* ${stringifyValue(val)}`).join('\n');
    }
    return `_${typeof value === "string" ? value.trim() : value}_`;
  };
  const generateField = (v, index) => {
    const fields = Object.entries(v).map(([key, value]) => `*${key.toUpperCase()}:* ${stringifyValue(value)}`).join('\n');
    return `*[${index + 1}]* ${fields}`;
  };
  const body = data.map((v, i) => generateField(v, i)).join(`\n<==== ${config.name.bot} ====>\n\n`);
  return `${header}\n\n${body}`;
},
transformText(input) {
  const charMap = {
    "A": "ᴀ", "B": "ʙ", "C": "ᴄ", "D": "ᴅ", "E": "ᴇ", "F": "ꜰ", "G": "ɢ", "H": "ʜ", "I": "ɪ", "J": "ᴊ", 
    "K": "ᴋ", "L": "ʟ", "M": "ᴍ", "N": "ɴ", "O": "ᴏ", "P": "ᴘ", "Q": "Q", "R": "ʀ", "S": "ꜱ", "T": "ᴛ", 
    "U": "ᴜ", "V": "ᴠ", "W": "ᴡ", "X": "x", "Y": "ʏ", "Z": "ᴢ",
    "a": "ᴀ", "b": "ʙ", "c": "ᴄ", "d": "ᴅ", "e": "ᴇ", "f": "ꜰ", "g": "ɢ", "h": "ʜ", "i": "ɪ", "j": "ᴊ", 
    "k": "ᴋ", "l": "ʟ", "m": "ᴍ", "n": "ɴ", "o": "ᴏ", "p": "ᴘ", "q": "Q", "r": "ʀ", "s": "ꜱ", "t": "ᴛ", 
    "u": "ᴜ", "v": "ᴠ", "w": "ᴡ", "x": "x", "y": "ʏ", "z": "ᴢ",
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉"
  };

  const linkPattern = /(https?:\/\/[^\s]+)/g;
  const atNumberPattern = /@[\d]+(?:\s|$)/g;

  return input.split(linkPattern).map(part => {
    if (linkPattern.test(part)) {
      return part;
    } else {
      return part.split(/(¿[^¿]*¿)/g).map(segment => {
        if (segment.startsWith('¿') && segment.endsWith('¿')) {
          return segment;
        } else {
          return segment.split(atNumberPattern).map((subpart, index, arr) => {
            if (index < arr.length - 1) {
              let match = part.match(atNumberPattern)[index];
              return subpart.split("").map(char => charMap[char] || char).join("") + match;
            } else {
              return subpart.split("").map(char => charMap[char] || char).join("");
            }
          }).join("");
        }
      }).join("");
    }
  }).join("").replace(/¿/g, '');
},
numbersOnly(inputString) {
  return inputString.replace(/[^0-9]/g, "");
},
isNumber(x) {
  return typeof x === "number" && !isNaN(x);
},
isBoolean(x) {
  return typeof x === "boolean" && Boolean(x)
},
sleep(ms) {
  return new Promise(a => setTimeout(a, ms))
},
delay(time) {
  return new Promise(res => setTimeout(res, time))
},
str(obj) {
  return JSON.stringify(obj, null, 2)
},
format(obj) {
  return util.format(obj)
},
msToDate(dateString, timeZone = "") {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let date = new Date(dateString);
  timeZone ? date.toLocaleString("en", { timeZone }) : "";
  let day = date.getDate();
  let month = date.getMonth();
  let weekday = date.getDay();
  let thisDay = days[weekday];
  let year = date.getFullYear();
  return `${thisDay}, ${day} ${months[month]} ${year}`;
},
tanggal(numer, timeZone = "") {
  const myMonths = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const myDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum’at", "Sabtu"];
  let tgl = new Date(numer);
  if (timeZone) {
    tgl = new Date(tgl.toLocaleString("en-US", { timeZone }));
  }
  let day = tgl.getDate();
  let bulan = tgl.getMonth();
  let hari = tgl.getDay();
  let thisDay = myDays[hari];
  let yy = tgl.getFullYear();
  let hours = tgl.getHours();
  let minutes = tgl.getMinutes();
  let seconds = tgl.getSeconds();
  let formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return `${thisDay}, ${day} ${myMonths[bulan]} ${yy} pukul ${formattedTime}`;
},
isUrl(url, pattern) {
  if (typeof pattern === 'string') {
    return url.includes(pattern) ? url : false;
  }
  if (Array.isArray(pattern)) {
    return pattern.some(word => url.includes(word)) ? url : false;
  }
  if (pattern instanceof RegExp) {
    return pattern.test(url) ? url : false;
  }
  return false;
},
card(options, url, body, footer, button, name, text, id) {
  return options.map((item, index) => {
      const itemUrl = item?.[url] ? String(item[url]) : (item?.url ? item.url : config.logo.thumb);
      const itemBody = item?.[body] ? String(item[body]) : (item?.title ? item.title : `*Hasil ke: ${index + 1}*`);
      const itemFooter = item?.[footer] ? String(item[footer]) : (item?.id ? String(item.id) : (item.desc ? item.desc : config.name.bot));
      const buttons = Array.isArray(button) ? button.map(v => {
          const buttonName = name ? v[name] : v.name;
          const buttonText = text ? v[text] : v.text;
          const buttonId = id ? v[id] : v.id;
          if (buttonName && buttonText && buttonId) {
              return {
                  name: String(buttonName),
                  buttonParamsJson: JSON.stringify({ display_text: String(buttonText), id: String(buttonId) })
              };
          } else {
              console.warn(`Invalid button data: ${JSON.stringify(v)}`);
              return null;
          }
      }).filter(Boolean) : [];
      return {
          url: itemUrl,
          body: itemBody,
          footer: itemFooter,
          buttons: buttons
      };
  });
},
wa(input) {
  if (!Array.isArray(input)) {
      input = input.split(".");
  }
  const transformed = input.map(item => {
      if (item.startsWith("085")) {
          return item.replace(/^085/g, '6285');
      } else {
          return item;
      }
  });
  return transformed.map(item => {
      return item.replace(/[^\d.]+/g, '')
                 .split('.')
                 .map(str => str + "@s.whatsapp.net");
  }).flat();
},
random(list) {
  return list[Math.floor(Math.random() * list.length)]
},
randomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
},
getRandom(ext = "", length = "10") {
  let result = ""
  let character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
  let characterLength = character.length
  for (let i = 0; i < length; i++) {
      result += character.charAt(Math.floor(Math.random() * characterLength))
  }
  return `${result}${ext ? `.${ext}` : ""}`
},
getRandomStringsFromArray(arr, count) {
  const length = Math.min(count, arr.length);
  const originalCopy = arr.slice();
  const result = [];
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * originalCopy.length);
      result.push(originalCopy.splice(randomIndex, 1)[0]);
  }
  return result;
},
generateIntegerArray(maxValue) {
  const parsedValue = parseInt(maxValue);
  if (isNaN(parsedValue) || parsedValue < 1) {
      parsedValue = 100;
  }
  const arrayInteger = Array.from({ length: parsedValue }, (_, index) => index + 1);
  return arrayInteger;
},
generateArray(...args) {
  let combinedArray = [];
    for (let i = 0; i < args.length; i++) {
        const value = !isNaN(args[i]) ? parseInt(args[i]) : 0;
        const newArray = Array(args.length - i).fill(value);
        combinedArray = combinedArray.concat(newArray);
    }
  combinedArray = shuffleArray(combinedArray);
  function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
  }
  return this.random(combinedArray);
},
readMore() {
  return String.fromCharCode(8206).repeat(4001)
},
isBase64(string) {
  const regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
  return regex.test(string)
},
formatSize(bytes) {
  if (bytes >= 1000000000) { bytes = (bytes / 1000000000).toFixed(2) + " GB"; }
  else if (bytes >= 1000000) { bytes = (bytes / 1000000).toFixed(2) + " MB"; }
  else if (bytes >= 1000) { bytes = (bytes / 1000).toFixed(2) + " KB"; }
  else if (bytes > 1) { bytes = bytes + " bytes"; }
  else if (bytes == 1) { bytes = bytes + " byte"; }
  else { bytes = "0 bytes"; }
  return bytes;
},
clockString(ms) {
  if (isNaN(ms)) {
    return "-- Tahun -- Bulan -- Hari -- Jam -- Menit -- Detik";
  }
  const y = Math.floor(ms / 31536000000); // Tahun
  const mo = Math.floor(ms / 2592000000) % 12; // Bulan
  const d = Math.floor(ms / 86400000) % 30; // Hari
  const h = Math.floor(ms / 3600000) % 24; // Jam
  const m = Math.floor(ms / 60000) % 60; // Menit
  const s = Math.floor(ms / 1000) % 60; // Detik
  const timeParts = [
    { value: y, unit: " Tahun " },
    { value: mo, unit: " Bulan " },
    { value: d, unit: " Hari " },
    { value: h, unit: " Jam " },
    { value: m, unit: " Menit " },
    { value: s, unit: " Detik" }
  ];
  const formattedTime = timeParts
    .filter((part, index) => part.value > 0 || index >= 3)
    .map(part => part.value.toString().padStart(2, "0") + part.unit)
    .join("");
  return formattedTime;
},
runtime(time) {
  if (time > 1000) {
  time = time / 1000;
}
  let seconds = parseInt(time);
  let d = Math.floor(seconds / (3600 * 24))
  let h = Math.floor(seconds % (3600 * 24) / 3600)
  let m = Math.floor(seconds % 3600 / 60)
  let s = Math.floor(seconds % 60)
  let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
  let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
  let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
  let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
  return dDisplay + hDisplay + mDisplay + sDisplay
},
greeting(name) {
  const time = moment.tz("Asia/Jakarta").format("HH")
  let res = "𝑆𝑒𝑙𝑎𝑚𝑎𝑡 𝐷𝑖𝑛𝑖𝐻𝑎𝑟𝑖 ☀️"
  if (time >= 4) {
    res = "𝑆𝑒𝑙𝑎𝑚𝑎𝑡 𝑝𝑎𝑔𝑖 🌄"
  }
  if (time >= 10) {
    res = "𝑆𝑒𝑙𝑎𝑚𝑎𝑡 𝑠𝑖𝑎𝑛𝑔 ☀️"
  }
  if (time >= 15) {
    res = "𝑆𝑒𝑙𝑎𝑚𝑎𝑡 𝑠𝑜𝑟𝑒 🌇"
  }
  if (time >= 18) {
    res = "𝑆𝑒𝑙𝑎𝑚𝑎𝑡 𝑚𝑎𝑙𝑎𝑚 🌙"
  }
  return res+ ` @${name.split("@")[0]}`
},
async shortUrl(url) {
  try {
      const response = await axios.get(`https://tinyurl.com/api-create.php?url=${url}`);
      return response.data;
  } catch (error) {
      console.error('Error occurred while shortening URL:', error);
      throw error;
  }
},
async fetchBuffer(url, options = {}, responseType = 'arraybuffer') {
  try {
    const response = await axios.get(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
        ...options.headers,
      },
      responseType, // Default to 'arraybuffer' if not provided
      ...options,
    });

    let buffer;
    if (responseType === 'stream') {
      buffer = await toBuffer(response.data);
    } else {
      buffer = response.data;
    }
    const headers = response.headers;
    const contentDisposition = headers['content-disposition'];
    const filenameMatch = contentDisposition?.match(/filename=(?:(?:"|')(.*?)(?:"|')|([^""\s]+))/);
    const filename = filenameMatch ? decodeURIComponent(filenameMatch[1] || filenameMatch[2]) : null;
    const fileType = await fileTypeFromBuffer(buffer);
    const mimetype = fileType?.mime || 'application/octet-stream';
    const ext = fileType?.ext || 'bin';
    return { data: buffer, filename, mimetype, ext };
  } catch (error) {
    throw new Error(`Failed to fetch buffer: ${error.message}`);
  }
},
async fetchJson(url, options = {}) {
  try {
    const {data} = await axios.get(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
        ...(options.headers ? options.headers : {}),
      },
      responseType: "json",
      ...(options && delete options.headers && options),
    });
    return data;
  } catch (error) {
    console.log(error)
    throw "error";
  }
},
async fetchText(url, options = {}) {
	return new Promise((resolve, reject) => {
		axios
			.get(url, {
				headers: {
					Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
					...(options.headers ? options.headers : {}),
				},
				responseType: "text",
				...(options && delete options.headers && options),
			})
			.then(({ data }) => resolve(data))
			.catch(reject("Failed to fetch text!"));
	});
},
async fetchData(url) {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const contentType = response.headers['content-type'];
    if (contentType.includes('application/json')) {
      let json = '';
      response.data.on('data', (chunk) => {
        json += chunk.toString('utf-8');
      });
      return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve(JSON.parse(json)));
        response.data.on('error', reject);
      });
    } else if (contentType.includes('text')) {
      let text = '';
      response.data.on('data', (chunk) => {
        text += chunk.toString('utf-8');
      });
      return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve(text));
        response.data.on('error', reject);
      });
    } else {
      const chunks = [];
      response.data.on('data', (chunk) => {
        chunks.push(chunk);
      });
      return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve(Buffer.concat(chunks)));
        response.data.on('error', reject);
      });
    }
  } catch (error) {
    throw error;
  }
},
async getFile(PATH, text = "") {
  if (!fs.existsSync("./tmp")) {
    fs.mkdirSync("./tmp")
  } else {
    if (!fs.existsSync("./tmp/image")) fs.mkdirSync("./tmp/image")
    if (!fs.existsSync("./tmp/audio")) fs.mkdirSync("./tmp/audio")
    if (!fs.existsSync("./tmp/video")) fs.mkdirSync("./tmp/video")
    if (!fs.existsSync("./tmp/sticker")) fs.mkdirSync("./tmp/sticker")
  }
  let filename, data;
  if (/^https?:\/\//.test(PATH)) {
      data = (await this.fetchBuffer(PATH)).data
  } else if (/^data:.*?\/.*?;base64,/i.test(PATH) || this.isBase64(PATH)) {
      data = Buffer.from(PATH?.split(",")[1] ? PATH?.split(",")[1] : PATH, "base64")
  } else if (fs.existsSync(PATH) && (fs.statSync(PATH)).isFile()) {
      data = fs.readFileSync(PATH)
  } else if (Buffer.isBuffer(PATH)) {
      data = PATH
  } else {
      data = Buffer.alloc(20)
  }
   const type = await fileTypeFromBuffer(data) || {
      mime: "application/octet-stream",
      ext: ".bin"
  }
  let name = !text ? `BOTBE_${this.getRandom("", "5")}` : `${text.replace(/[\\/:*?"<>| ]/g, "_")}_${this.getRandom("", "3")}`;
  let size = Buffer.byteLength(data)
  let mime = /image/.test(type.mime) ? "image/" : /audio/.test(type.mime) ? "audio/" : /video/.test(type.mime) ? "video/" : ""
  if (data && !filename && size > 1000000) (filename = path.join(__dirname, `../tmp/${mime}` +`${name}` + "." + type.ext), await fs.promises.writeFile(filename, data))
  return {
      filename: size > 1000000 ? filename : size > 100000 && /image/.test(type.mime) ? filename : data, 
      ...type, 
      data, 
      size, 
      sizeH: this.formatSize(size)
  }
},
async pushToJson(filePath, newObjects) {
  if (!fs.existsSync(filePath)) {
    await saveJsonFile(filePath, []);
    return [];
  }
  const data = await loadJsonFile(filePath);
  newObjects.forEach(newObject => {
    if (!isDuplicate(newObject, data)) {
      data.push(newObject);
    }
  });
  await saveJsonFile(filePath, data);
  console.log('Non-duplicate objects added to the file.');
async function loadJsonFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}
async function saveJsonFile(filePath, data) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 4), 'utf-8');
}
function isDuplicate(newObject, existingObjects) {
  return existingObjects.some(obj => JSON.stringify(obj) === JSON.stringify(newObject));
}
},
xpRange(level, multiplier = 38) {
  level = Math.max(Math.floor(level), 0);
  const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75;
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1;
  const max = Math.round(Math.pow(level + 1, growth) * multiplier);
  return {
      min,
      max,
      exp: max - min
  };
},
findLevel(xp, multiplier = 38) {
  if (!isFinite(xp) || isNaN(xp) || xp <= 0) return 1;
  let level = 0;
  while (this.xpRange(level, multiplier).min <= xp) level++;
  return level - 1;
},
canLevelUp(level, xp, multiplier = 38) {
  if (level < 0 || !isFinite(xp) || isNaN(xp) || xp <= 0) return false;
  return level < this.findLevel(xp, multiplier);
},
PHONENUMBER_MCC(phoneNumber) {
  const countryNumber = [
    "93", "355", "213", "1-684", "376", "244", "1-264", "1-268", "54", "374",
    "297", "61", "43", "994", "1-242", "973", "880", "1-246", "375", "32", "501",
    "229", "1-441", "975", "591", "387", "267", "55", "1-284", "673", "359", "226",
    "257", "855", "237", "238", "1-345", "236", "235", "56", "86", "57", "269", "682",
    "506", "385", "53", "357", "420", "243", "45", "253", "1-767", "1-809", "1-849", 
    "1-829", "593", "20", "503", "240", "291", "372", "251", "500", "298", "679", "358", 
    "33", "689", "241", "220", "995", "49", "233", "350", "30", "299", "1-473", "1-671", 
    "502", "224", "592", "509", "504", "852", "36", "354", "91", "62", "98", "964", "353",
    "972", "39", "225", "1-876", "81", "962", "254", "686", "383", "965", "371", "961", 
    "266", "231", "218", "423", "370", "352", "389", "261", "265", "60", "960", "223", 
    "356", "692", "222", "230", "52", "691", "373", "377", "976", "382", "1-664", "212", 
    "258", "95", "264", "674", "977", "31", "687", "64", "505", "227", "234", "683", 
    "1-670", "47", "968", "92", "680", "970", "507", "675", "595", "51", "63", "48", 
    "351", "1-787", "1-939", "974", "242", "40", "7", "250", "290", "1-869", "1-758",
    "508", "1-784", "685", "378", "239", "966", "221", "381", "248", "232", "65", "386",
    "677", "27", "211", "34", "94", "249", "597", "268", "46", "41", "963", "886", "992",
    "255", "66", "228", "690", "676", "1-868", "216", "90", "993", "1-649", "688", "1-340",
    "256", "380", "971", "44", "1", "598", "998", "678", "379", "58", "681", "967", "260",
    "263", "670", "245", "856", "599", "850", "262", "82", "84"
  ];
  return countryNumber.some(v => phoneNumber.startsWith(v));;
}
}