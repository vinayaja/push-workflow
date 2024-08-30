import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github"; 

export async function run() {
    const token = getInput("gh-token");
    const runid = getInput("run-id");
    const remoterepo = getInput("remote-repo");
    const remotebranch = getInput("remote-branch");
    let payload = getInput("payload");

    const octoKit = getOctokit(token);

    try{  
        
        if((remoterepo == "") && (remotebranch == ""))
        {
            const result = await octoKit.rest.actions.createWorkflowDispatch({
                owner: context.repo.owner,
                repo: context.repo.repo,
                workflow_id: runid,
                ref: context.ref.replace("refs/heads/",""),
                inputs: JSON.parse(payload),
                headers: {
                'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            console.log(result);
        }
        if((remoterepo != "") && (remotebranch != ""))
        {
            const result = await octoKit.rest.actions.createWorkflowDispatch({
                owner: remoterepo.split("/")[0],
                repo: remoterepo.split("/")[1],
                workflow_id: runid,
                ref: remotebranch,
                inputs: JSON.parse(payload),
                headers: {
                'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            console.log(result);
        }

    }   catch(error){
        setFailed((error as Error)?.message ?? "Unknown error");
    }
    
}

if(!process.env.JEST_WORKER_ID){
    run();
}