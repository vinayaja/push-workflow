import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";  

async function run() {
    const token = getInput("gh-token");
    const runid = getInput("run-id");
    let payload = getInput("payload");

    const octoKit = getOctokit(token);

    await octoKit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
        owner: context.repo.owner,
        repo: context.repo.repo,
        workflow_id: runid,
        ref: context.ref,
        inputs: JSON.parse(payload),
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
    })
}