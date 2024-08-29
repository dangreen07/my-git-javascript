function Git(name) {
    this.name = name; // Repo name
    this.lastCommitId = -1; // Keep track of last commit id.
    this.branches = []; // List of all branches.

    var master = new Branch("master", null); // null is passed as we don't have any commit yet.
    this.branches.push(master); // Store master branch.
    this.HEAD = master; // HEAD points to current branch.
}

function Branch(name, commit) {
    this.name = name;
    this.commit = commit;
}

function Commit(id, parent, message) {
    this.id = id;
    this.parent = parent;
    this.message = message;
    // Assume that 'this' has a 'change' property too.
}

Git.prototype.commit = function (message) {
    // Increment last commit id and pass into new commit.
    var commit = new Commit(++this.lastCommitId, this.HEAD.commit, message);

    // Update the current branch pointer to new commit.
    this.HEAD.commit = commit;

    return commit;
};

Git.prototype.log = function () {
    // Start from HEAD commit
	var commit = this.HEAD.commit,
    history = [];

    while (commit) {
    history.push(commit);
    // Keep following the parent
    commit = commit.parent;
    }

    return history;
};

Git.prototype.checkout = function (branchName) {
    // Loop through all branches and see if we have a branch
    // called `branchName`.
    for (var i = this.branches.length; i--; ) {
        if (this.branches[i].name === branchName) {
        // We found an existing branch
        console.log("Switched to existing branch: " + branchName);
        this.HEAD = this.branches[i];
        return this;
        }
    }

    // If branch was not found, create a new one.
    var newBranch = new Branch(branchName, this.HEAD.commit);
    // Store branch.
    this.branches.push(newBranch);
    // Update HEAD
    this.HEAD = newBranch;

    console.log("Switched to new branch: " + branchName);
    return this;
};

console.log("Git.log() test");
var repo = new Git("test");
repo.commit("Initial commit");
repo.commit("Change 1");

var log = repo.log();
console.assert(log.length === 2); // Should have 2 commits.
console.assert(!!log[0] && log[0].id === 1); // Commit 1 should be first.
console.assert(!!log[1] && log[1].id === 0); // And then Commit 0.

console.log("Git.checkout() test");
var repo = new Git("test");
repo.commit("Initial commit");

console.assert(repo.HEAD.name === "master"); // Should be on master branch.
repo.checkout("testing");
console.assert(repo.HEAD.name === "testing"); // Should be on new testing branch.
repo.checkout("master");
console.assert(repo.HEAD.name === "master"); // Should be on master branch.
repo.checkout("testing");
console.assert(repo.HEAD.name === "testing"); // Should be on testing branch again.

console.log("3. Branches test");

var repo = new Git("test");
repo.commit("Initial commit");
repo.commit("Change 1");

// Maps the array of commits into a string of commit ids.
// For [C2, C1,C3], it returns "2-1-0"
function historyToIdMapper(history) {
  var ids = history.map(function (commit) {
    return commit.id;
  });
  return ids.join("-");
}

console.assert(historyToIdMapper(repo.log()) === "1-0"); // Should show 2 commits.

repo.checkout("testing");
repo.commit("Change 3");

console.assert(historyToIdMapper(repo.log()) === "2-1-0"); // Should show 3 commits.

repo.checkout("master");
console.assert(historyToIdMapper(repo.log()) === "1-0"); // Should show 2 commits. Master unpolluted.

repo.commit("Change 3");
console.assert(historyToIdMapper(repo.log()) === "3-1-0"); // Continue on master with 4th commit.