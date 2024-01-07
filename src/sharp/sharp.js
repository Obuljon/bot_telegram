import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Jimp from "jimp";
import sharp from "sharp";
import { unlinkSync } from "fs";
const __dirname = join(dirname(fileURLToPath(import.meta.url)), "../../");

// oq fonli surat yaratadi
async function createimg(width, height) {
  const outputPath = __dirname + "public/blank_image.jpg";
  return await sharp({
    create: {
      width: width,
      height: height,
      channels: 3,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .toFile(outputPath)
    .then(outputInfo => {
      return outputPath;
    })
    .catch(error => {
      console.error("Xato yuz berdi:", error);
    });
}

// surat haqida malumot qaytartadi
async function imginformation(imagePath) {
  return await sharp(imagePath)
    .metadata()
    .then(metadata => {
      const { width, height } = metadata;
      return { width, height };
    })
    .catch(error => {
      console.error("Error:", error);
    });
}

// content arr ko'rinishda kelsa uni text qilib qaytaradi
function inArrOvText(arr, list, textOptions) {
  let text = "";
  arr.forEach(
    (item, index) =>
      (text += `<text x="10" y="${list * (index + 1)}" font-family="${
        textOptions.font.family
      }" font-size="${textOptions.font.size}" fill="${
        textOptions.font.fill
      }" >${item}</text>`),
  );
  return text;
}

async function textforimg(imgname, arr) {
  const inputImagePath = __dirname + "public/" + imgname;
  const outputImagePath = __dirname + "public/textcontent.jpg";
  const { width, height } = await imginformation(inputImagePath);
  // Matnning markazi
  let list = Math.floor((width / 72) * 2);
  const textOptions = {
    font: {
      family: "Arial",
      size: Math.floor((width / 72) * 2),
      fill: "black",
    },
  };
  const text = inArrOvText(arrinstrforlength(arr, 75), list, textOptions);

  const overlay = Buffer.from(
    `<svg width="${width}" height="${height}">
    ${text}  
          </svg>`,
  );
  return sharp(inputImagePath)
    .composite([{ input: overlay, left: 0, top: 0 }])
    .toFile(outputImagePath)
    .then(() => "textcontent.jpg");
}

// 2 ta suratni birlashtiradi
async function imgscombine(firstimg, secondimg) {
  let mainimg = await createimg(
    firstimg.width,
    firstimg.height + secondimg.height,
  );

  return await Promise.all([
    Jimp.read(mainimg),
    Jimp.read(firstimg.path),
    Jimp.read(secondimg.path),
  ])
    .then(async images => {
      images[0].composite(images[1], 0, 0);
      images[0].composite(images[2], 0, firstimg.height);
      // Yangi rasmni saqlash
      // images[0].write(__dirname + "public/output.jpg", err => {
      //   if (err) throw err;
      //   console.log("Bitirilgan rasm saqlandi.");
      // });
      const resultBuffer = await images[0].getBufferAsync(Jimp.AUTO);
      unlinkSync(mainimg);
      unlinkSync(firstimg.path);
      unlinkSync(secondimg.path);
      return resultBuffer;
    })
    .catch(err => {
      console.error("Xatolik:", err);
    });
}

function strlength(str, num) {
  let arr = [];
  let end = 0;
  for (let i = 0; i < str.length; i += num) {
    end += num;
    arr.push(str.slice(i, end));
  }
  return arr;
}

function arrinstrforlength(arr, num) {
  return arr.map(item => (item = strlength(item, num))).flat(Infinity);
}

// export const mainresults = async (text, path) => {

//   const arr = arrinstrforlength(text.split("\n"), 66);
//   const { width, height } = await imginformation(path);
//   const textheight = Math.floor((width / 72) * 2 * arr.length);

//   const createtextimg = await createimg(width, textheight).then(data =>
//     textforimg("blank_image.jpg", arr),
//   );
//   return  await imgscombine(
//     { width, height, path },
//     {
//       width,
//       height: textheight,
//       path: join(__dirname + "public/" + createtextimg),
//     },
//   );
// };

export const mainresults = (text, path) => {
  return new Promise(async (resolve, reject) => {
    try {
      const arr = await arrinstrforlength(text.split("\n"), 66);
      const { width, height } = await imginformation(path);
      const textheight = Math.floor((width / 72) * 2 * arr.length);

      const createtextimg = await createimg(width, textheight);
      const textImage = await textforimg("blank_image.jpg", arr);

      const combinedImagePath = join(__dirname, "public", textImage);

      const result = await imgscombine(
        { width, height, path },
        { width, height: textheight, path: combinedImagePath },
      );

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
