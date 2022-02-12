const chalk = require('chalk');

import { Options } from "../schema";
import { paserToFSTLists } from './parser';
import { genFSTLists2File } from './generator';

export async function pipeline(options: Options) {
  console.info(chalk.blue(`[fst] begin parse:`, JSON.stringify(options, null, 4)))

  const fstLists = await paserToFSTLists(options);

  console.info(chalk.blue(`[fst] begin generate file`))

  genFSTLists2File(fstLists, options);

  console.info(chalk.green(`[fst] well done!`))
}