import { Bot, InputFile } from "grammy";
import { hydrateFiles } from "@grammyjs/files";
import dotenv from "dotenv";
import { createReadStream, readFileSync, unlinkSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, extname, join } from "path";
import { mainresults } from "./sharp/sharp.js";

const __dirname = join(dirname(fileURLToPath(import.meta.url)), "../");

dotenv.config();
const token = process.env.TOKEN;

const bot = new Bot(token);

bot.api.config.use(hydrateFiles(bot.token));

bot.catch(err => {
  console.error("Error:", err);
});
bot.command("start", async ctx => await ctx.reply("Welcome! Up and running."));
bot.on(":text", async ctx => {
  return await ctx.reply(
    "write text in the cart and title, we will create a logo for you",
  );
});
bot.on(":photo", async ctx => {
  await ctx.reply("wait a minute");
  const date = new Date();

  // Prepare the file for download.
  const file = await ctx.getFile();
  const extName = extname(file.file_path);
  const destinationPath = join(
    __dirname,
    "public/",
    date.getTime() + "" + extName,
  );
  const path = await file.download(destinationPath);
  const text = ctx.update.message.caption || " ";

  const result = await mainresults(text, path);

  await ctx.replyWithPhoto(new InputFile(result));
});

bot.start();
