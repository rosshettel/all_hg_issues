var async = require('async'),
    fs = require('fs'),
    prompt = require('prompt'),
    GitHubApi = require('github'),
    github = new GitHubApi({
        version: '3.0.0',
        protocol: 'https',
    }),
    promptParams = {
        properties: {
            username: { description: "Your GitHub username:".cyan },
            password: { description: "Your GitHub password:".cyan },
            filename: { description: "The file name to save the issues:".cyan }
        }
    };

prompt.start();
prompt.message = "";
prompt.delimiter = "";

function getAllIssues (callback) {
    var params = {
        user: 'HighGroundInc',
        repo: 'hgapp',
        filter: 'all',
        state: 'all',
        per_page: 100,
        page: 1
    },
    allIssues = [],
    lastResponse;

    async.doWhilst(
        function (callback) {
            github.issues.repoIssues(params, function (err, data) {
                if (err) {
                    console.log('Error getting issues:', err);
                    callback(err);
                }
                console.log('Got ' + data.length + ' issues, page ' + params.page);

                allIssues = allIssues.concat(data);
                lastResponse = data;
                params.page++;

                callback();
            });
        },
        function () {
            return github.hasNextPage(lastResponse);
        },
        function (err) {
            console.log('Got a total of ' + allIssues.length + ' issues');
            callback(null, allIssues);
        }
    );
};

prompt.get(promptParams, function (err, result) {
    if (err) {
        console.error('Error getting input:', err);
        return -1;
    }

    github.authenticate({
        type: 'basic',
        username: result.username,
        password: result.password
    });

    getAllIssues(function (err, issues) {
        fs.writeFile(result.filename + '.json', JSON.stringify(issues, null, 4), function (err) {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('Saved to ' + result.filename + '.json');
            }
        });
    });
});
