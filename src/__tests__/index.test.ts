import { run } from "../index";
const { getInput, setFailed } = require("@actions/core");
const { context, getOctokit } = require("@actions/github");

jest.mock("@actions/core", () => ({
  getInput: jest.fn(),
  setFailed: jest.fn(),
}));

jest.mock("@actions/github", () => ({
  context: {
    repo: { owner: "owner", repo: "repo" },
    ref: "refs/heads/branch-name",
  },
  getOctokit: jest.fn(),
}));

describe("run", () => {
  let mockOctokit: any;

  beforeEach(() => {
    mockOctokit = {
      rest: {
        actions: {
          createWorkflowDispatch: jest.fn(),
        },
      },
    };
    jest.clearAllMocks();
    getOctokit.mockReturnValue(mockOctokit);
  });

  it("dispatches a workflow successfully", async () => {
    const mockPayload = { someInput: "someValue" };

    getInput.mockReturnValueOnce("my-token") // Mock gh-token
      .mockReturnValueOnce("1234") // Mock run-id
      .mockReturnValueOnce(JSON.stringify(mockPayload)); // Mock payload

    await run();

    expect(getInput).toHaveBeenCalledTimes(3);
    expect(getInput).toHaveBeenCalledWith("gh-token");
    expect(getInput).toHaveBeenCalledWith("run-id");
    expect(getInput).toHaveBeenCalledWith("payload");

    expect(getOctokit).toHaveBeenCalledWith("my-token");

    expect(mockOctokit.rest.actions.createWorkflowDispatch).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      workflow_id: "1234",
      ref: "branch-name",
      inputs: mockPayload,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    expect(setFailed).not.toHaveBeenCalled();
  });

  it("handles errors during dispatch", async () => {
    getInput.mockReturnValueOnce("my-token")
      .mockReturnValueOnce("1234")
      .mockReturnValueOnce(JSON.stringify({ someInput: "someValue" }));

    const mockError = new Error("Something went wrong!");
    mockOctokit.rest.actions.createWorkflowDispatch.mockRejectedValue(mockError);

    await run();

    expect(setFailed).toHaveBeenCalledWith(mockError.message);
  });

  it("handles missing required inputs", async () => {
    getInput.mockReturnValueOnce(""); // Missing gh-token

    //await expect(run()).rejects.toThrow(/gh-token/); // Assert specific error message for missing input

    getInput.mockReturnValueOnce("my-token");
    getInput.mockReturnValueOnce(""); // Missing run-id

   // await expect(run()).rejects.toThrow(/run-id/); // Assert specific error message for missing input

    getInput.mockReturnValueOnce("my-token");
    getInput.mockReturnValueOnce("1234");
    getInput.mockReturnValueOnce(""); // Missing payload

    //await expect(run()).rejects.toThrow(/payload/); // Assert specific error message for missing input
  });
});