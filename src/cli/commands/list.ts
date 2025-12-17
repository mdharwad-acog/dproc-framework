
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';

const API_URL = 'http://localhost:3000/api';

export const listCommand = new Command('list')
  .description('List all available pipelines')
  .action(async () => {
    const spinner = ora('Fetching available pipelines...').start();
    try {
      const response = await fetch(`${API_URL}/pipelines`);
      if (!response.ok) {
        spinner.fail(chalk.red('Failed to fetch pipelines from the server.'));
        const errorText = await response.text();
        console.error(chalk.red(`Error: ${errorText}`));
        process.exit(1);
      }

      const pipelines: any[] = await response.json();
      spinner.succeed(chalk.green('Available pipelines:'));

      if (pipelines.length === 0) {
        console.log(chalk.yellow('No pipelines found.'));
        return;
      }

      pipelines.forEach(pipeline => {
        console.log(`\n- ${chalk.bold.cyan(pipeline.name)} (${chalk.yellow(pipeline.id)})`);
        console.log(`  ${pipeline.description}`);
        console.log(`  Version: ${chalk.dim(pipeline.version)}`);
      });

    } catch (error) {
      spinner.fail(chalk.red('An error occurred while fetching pipelines.'));
      console.error(error);
      process.exit(1);
    }
  });
