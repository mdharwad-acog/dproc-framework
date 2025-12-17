import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';

const API_URL = 'http://localhost:3000/api';

async function selectPipeline() {
  const response = await fetch(`${API_URL}/pipelines`);
  if (!response.ok) throw new Error('Failed to fetch pipelines.');
  const pipelines = await response.json();
  if (pipelines.length === 0) {
      throw new Error('No pipelines found.');
  }

  const { pipelineId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'pipelineId',
      message: 'Select a pipeline to run:',
      choices: pipelines.map((p: any) => ({ name: p.name, value: p.id })),
    },
  ]);

  return pipelines.find((p: any) => p.id === pipelineId);
}

async function getPipelineInputs(schema: any) {
    if (!schema.properties) return {};

    const questions = Object.keys(schema.properties).map(key => {
        const prop = schema.properties[key];
        const question: any = {
            name: key,
            message: prop.description || key,
            default: prop.default,
        };

        if (prop.enum) {
            question.type = 'list';
            question.choices = prop.enum;
        } else if (prop.type === 'boolean') {
            question.type = 'confirm';
        } else if (prop.type === 'number') {
            question.type = 'number';
        } else {
            question.type = 'input';
        }
        return question;
    });

    return inquirer.prompt(questions);
}


export const generateCommand = new Command('generate')
  .description('Generate a report using a pipeline')
  .action(async () => {
    const mainSpinner = ora('Initializing report generation...').start();
    try {
        mainSpinner.text = 'Fetching pipelines...';
        const pipeline = await selectPipeline();
        
        mainSpinner.text = 'Fetching pipeline schema...';
        const response = await fetch(`${API_URL}/pipelines/${pipeline.id}`);
        if (!response.ok) throw new Error('Failed to fetch pipeline schema.');
        const detailedPipeline = await response.json();

        mainSpinner.stop();
        const inputs = await getPipelineInputs(detailedPipeline.inputSchema);
        
        mainSpinner.start('Executing pipeline...');
        const execResponse = await fetch(`${API_URL}/executions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pipelineId: pipeline.id, inputs }),
        });

        if (!execResponse.ok) {
            const errorData = await execResponse.json();
            throw new Error(errorData.details || 'Failed to start execution');
        }

        const { executionId } = await execResponse.json();
        mainSpinner.text = `Execution started with ID: ${executionId}. Waiting for completion...`;

        // Poll for status
        let isDone = false;
        while (!isDone) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const statusResponse = await fetch(`${API_URL}/executions/${executionId}`);
            if (!statusResponse.ok) {
                // don't throw, just log and continue polling
                mainSpinner.text = `Error fetching status for ${executionId}, retrying...`;
                continue;
            }

            const result = await statusResponse.json();
            if (result.status === 'completed') {
                mainSpinner.succeed(chalk.green('Pipeline executed successfully!'));
                console.log(chalk.bold('Artifact available at:'), result.artifactPath);
                isDone = true;
            } else if (result.status === 'failed') {
                throw new Error(`Execution failed: ${result.error}`);
            } else {
                mainSpinner.text = `Status: ${result.status}...`;
            }
        }
    } catch (error) {
      mainSpinner.fail(chalk.red(`Error during generation: ${(error as Error).message}`));
      process.exit(1);
    }
  });