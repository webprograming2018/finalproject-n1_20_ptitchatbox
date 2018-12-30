const functions = require("firebase-functions");
const mysql = require("./mysql");



const runtimeOpts = {
  timeoutSeconds: 13,
  memory: "128MB"
};

exports.search = functions
  .runWith(runtimeOpts)
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return search(data.query);
});


function search(query){
	query = query.toLowerCase();
	query = query.replace(/'/g,'')
	const connect = mysql();
	const sql = `SELECT * FROM \`ptitvl\`.\`dssv\` WHERE lower(full_name) LIKE '%${query}%' OR lower(mssv) LIKE '%${query}%' COLLATE utf8_unicode_ci LIMIT 10;`;
	
	return new Promise((resolve,reject)=>{
		connect.query(sql,(err,result)=>{
			if(err){
				return resolve({
					error:"Something went wrong"
				})
			}else{
				return resolve({
					error:null,
					result
				})
			}
		});
	})

}

