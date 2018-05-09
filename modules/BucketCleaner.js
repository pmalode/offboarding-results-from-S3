
const AWS = require('aws-sdk');
const fs=require('fs');
var s3;

var BucketCleaner=function(params){
	
	s3=  new AWS.S3(params);
}

var fileParser= function(stackName,region,tenantIdFile){
	 
	var tenantIdList=[];

	fs.readFile(tenantIdFile,"utf8",function(error,data){
		if(error)
		{
		console.log("file does not exits");
		}
		else{

		   if(data.trim().length!=0){
		   tenantIdList=data.split(",");
		   console.log("***********List of Tenant Ids****************" + tenantIdList);
		   checkIfBucketExits(stackName,region,tenantIdList);
		}
		   else{
		   console.log("**************Tenant id file is empty****************");
		   }
     	}
	});
}

var checkIfBucketExits= function(stackName,region,tenantIdList){

	var bucketName=stackName + '-'+ region +'-' +'pe';

	var params = {
		Bucket : bucketName
	};
	
	s3.headBucket(params, function(err, data) {
		if (err)
		{
			console.log("Bucket " + bucketName + " does not exist or you dont have permissions to access it"); // an error occurred
		}	
		else
		{
			    if(tenantIdList!=null){
			    tenantIdList.forEach(function(tenantId) {
			    if(tenantId.trim().length!=0){
			    listBucketObjects(bucketName,tenantId.trim());
			    }
			});
		}
		} 
	});	
}

var listBucketObjects=function(bucketName,tenantId,lastKey,){
	
	var bucketObjects=[];
	var objectKeys=[];
	var continuationKey;
	var prefix='evaluations/'+ tenantId;

	var params={
			Bucket : bucketName,
			Marker : lastKey,
			Prefix : prefix
	};
	
	console.log("*****Calling List Objects for Tenant ID: "+tenantId);
	
	 s3.listObjects(params, function(err, data) {
		   if (err) {
			   console.log("error in listing the objects of bucket " + bucketName); // an error occurred
		   }
		   else{

		   bucketObjects= data.Contents;
		   if(bucketObjects.length==0){
           console.log("Bucket- "+ bucketName + " does not contain " + prefix +" OR " + prefix +" is empty " );
		   }
		   else{
		   console.log("********Length of Bucket ********"+ bucketObjects.length);

		   console.log("********Is Truncated***** "+ data.IsTruncated);

		   for(var i=0; i < bucketObjects.length;i++)
		   {

			   objectKeys.push({"Key" : bucketObjects[i].Key});

			   if(i==bucketObjects.length-1){
				   continuationKey=bucketObjects[i].Key;
				   console.log("************Continuation Key*******" + continuationKey);
			   }
		   }

		   deleteObjects(bucketName,objectKeys)

		   if(data.IsTruncated){
			listBucketObjects(bucketName,tenantId,continuationKey);
		   }
	
		} 
	}   
  });
}


var deleteObjects= function(bucketName,objectKeys){


	var params = {
			  Bucket:bucketName , 
			  Delete: {
              Objects: objectKeys
			  }
			 };
	
	s3.deleteObjects(params, function(err, data) {
			   if (err) 
				   console.log("Error Occured while deleting  object from bucket" +bucketName); // an error occurred
			   else     
				  {
                   console.log("deleted successfully");           // successful response	
				  }
   });
}




BucketCleaner.prototype.EmptyBucket= function (stackName,region,tenantIdFile){

	fileParser(stackName,region,tenantIdFile);

	}

module.exports= BucketCleaner;
