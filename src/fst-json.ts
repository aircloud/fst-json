#!/usr/bin/env node
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

import { program } from 'commander';
import { pipeline } from "./pipeline";
import { Options, DefaultClassOptions, DefaultTarget, DefaultSuffix, DefaultFormat } from "./schema";

const defaultConfigName = `.fstconfig.js`;
const version = require('../package.json').version;

program
  .version(version);

program
  .command('gen')
  .description('generate ts/js schema file')
  .option('--fst-config <FilePath>', `custom ${defaultConfigName}`)
  .action((options: any) => {
    const config = parseFSTConfig(options);
    pipeline(config as Options)
  });

program.parse();

interface CommandOptions {
  fstConfig: string
}

function parseFSTConfig(commandOptions: CommandOptions) {
  let fstConfigPath = commandOptions.fstConfig;
  if (!fstConfigPath) {
    const cwd = process.cwd();
    fstConfigPath = path.join(cwd, defaultConfigName);
  }

  if (!fs.existsSync(fstConfigPath)) {
    console.error(chalk.red(`config file not found: ${fstConfigPath}`));
    return;
  }

  const fstConfig = require(fstConfigPath) as Options;
  return Object.assign({
    target: DefaultTarget,
    suffix: DefaultSuffix,
    classOptions: DefaultClassOptions,
    format: DefaultFormat,
  }, fstConfig) as Options;
}
