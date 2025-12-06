import ora, { Ora } from "ora";
import chalk from "chalk";

export class ProgressTracker {
  private spinner: Ora;
  private startTime: number;

  constructor() {
    this.spinner = ora();
    this.startTime = Date.now();
  }

  start(message: string): void {
    this.spinner.start(chalk.cyan(message));
  }

  succeed(message: string): void {
    this.spinner.succeed(chalk.green(message));
  }

  fail(message: string): void {
    this.spinner.fail(chalk.red(message));
  }

  info(message: string): void {
    this.spinner.info(chalk.blue(message));
  }

  update(message: string): void {
    this.spinner.text = chalk.cyan(message);
  }

  getElapsedTime(): string {
    const elapsed = Date.now() - this.startTime;
    return `${(elapsed / 1000).toFixed(1)}s`;
  }

  complete(): void {
    const elapsed = this.getElapsedTime();
    console.log(chalk.gray(`\n⏱️  Total time: ${elapsed}\n`));
  }
}
