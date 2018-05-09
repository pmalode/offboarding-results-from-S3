const commandLineArgs = require('command-line-args');
const commandlineUsage = require('command-line-usage');
const BucketCleaner = require('./modules/BucketCleaner');

const optionDefinitions = [
    {
        name: 'accessKey',
        alias: 'a',
        type: String,
        description: 'Access Key of Aws Account'
    },

    {
        name: 'secretKey',
        alias: 'k',
        type: String,
        description: 'Secret access key of AWS Account'
    },

    {
        name: 'region',
        alias: 'r',
        type: String,
        description: 'Region Name'
    },
    {
        name: 'stackName',
        alias: 's',
        type: String,
        description: 'Stack Name'
    },
    {
        name: 'tenantIdFile',
        alias: 't',
        type: String,
        description: 'Input file containing Tenant Id list',
        typeLabel: '<csv file path>'

    },
    {
        name: 'bucketCleaner',
        alias: 'c',
        type: Boolean,
        description: 'Deletes the bucket'

    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Displays the user guide'
    }
];

const sections = [
    {
        header: 'Bucket Object Deleter',
        content: 'Utility to Delete the Objects of "pe" Bucket for given Tenant IDs'
    },
    {
        header: 'Options',
        optionList: optionDefinitions
    }

];
const options = commandLineArgs(optionDefinitions);
const usage = commandlineUsage(sections);

var validateOptions = function () {
    var flag = true;
    if (options.accessKey == null) {
        console.log("AWS Account Access Key is not specified");
        flag = false;
    }
    if (options.secretKey == null) {
        console.log("Secret Access Key is not specified");
        flag = false;
    }
    if (options.region == null) {
        console.log("Region is not specified");
        flag = false;
    }
    if (options.stackName == null) {
        console.log("Stack Name is not specified");
        flag = false;
    }
    if (options.tenantIdFile == null) {
        console.log("Tenant ID is not specified");
        flag = false;
    }
    return flag;
};
var main = function () {


    if (options.help != null && options.help === true) {
        console.log(usage);
    }
    else if ((options.bucketCleaner != null)) {

        if (validateOptions()) {

            var params = {
                "accessKeyId": options.accessKey,
                "secretAccessKey": options.secretKey,
                "region": options.region
            };

            var emptyBucket = new BucketCleaner(params);
            emptyBucket.EmptyBucket(options.stackName, options.region, options.tenantIdFile);
        }
    }
    else {
        console.log(usage);
    }

};

main();
